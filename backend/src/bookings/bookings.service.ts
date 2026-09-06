import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PoolClient } from 'pg';
import { Database } from '../database/database.service';
import { ScheduleService } from '../schedule/schedule.service';
import { User } from '../auth/auth.types';
import { staffScope } from '../auth/staff-access';
import { AppointmentQuery } from './appointment-query';

type Appointment = {
  id: string; patient_id: string; dentist_id: string; treatment_id: string;
  starts_at: Date; ends_at: Date; request_starts_at: Date; price_cents: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  patient_phone: string | null; patient_cpf: string | null; notes: string | null; is_first_visit: boolean;
};
type Booking = {
  dentistId: string; treatmentId: string; startsAt: Date;
  patientPhone?: string; patientCpf?: string; notes?: string; isFirstVisit: boolean;
};

@Injectable()
export class BookingsService {
  constructor(private readonly db: Database, private readonly schedule: ScheduleService) {}

  async book(user: User, input: Booking, key: string) {
    return this.db.transaction(async (client) => {
      await this.schedule.lockDentist(client, input.dentistId);
      const { rows: [existing] } = await client.query<Appointment>(
        'SELECT * FROM appointments WHERE patient_id = $1 AND idempotency_key = $2', [user.id, key]);
      if (existing) {
        if (existing.dentist_id !== input.dentistId || existing.treatment_id !== input.treatmentId ||
            +existing.request_starts_at !== +input.startsAt || existing.patient_phone !== (input.patientPhone ?? null) ||
            existing.patient_cpf !== (input.patientCpf ?? null) || existing.notes !== (input.notes ?? null) ||
            existing.is_first_visit !== input.isFirstVisit) {
          throw new ConflictException('Idempotency key was used for a different booking');
        }
        return existing;
      }
      const treatment = await this.schedule.treatment(input.dentistId, input.treatmentId, client);
      const endsAt = await this.schedule.ensureSlot(client, input.dentistId, input.startsAt, treatment.duration_minutes);
      const { rows: [appointment] } = await client.query<Appointment>(
        `INSERT INTO appointments
         (patient_id, dentist_id, treatment_id, starts_at, ends_at, price_cents, idempotency_key, request_starts_at,
          patient_phone, patient_cpf, notes, is_first_visit)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $4, $8, $9, $10, $11) RETURNING *`,
        [user.id, input.dentistId, input.treatmentId, input.startsAt, endsAt, treatment.price_cents, key,
          input.patientPhone ?? null, input.patientCpf ?? null, input.notes ?? null, input.isFirstVisit]);
      await this.event(client, appointment, user.id, 'booked');
      return appointment;
    });
  }

  async list(user: User, input: AppointmentQuery) {
    const dentistId = user.role === 'patient' ? input.dentistId : staffScope(user, input.dentistId);
    return (await this.db.query(
      `SELECT a.*, d.name AS dentist_name, t.name AS treatment_name, u.name AS patient_name, u.email AS patient_email FROM appointments a
       JOIN dentists d ON d.id = a.dentist_id JOIN treatments t ON t.id = a.treatment_id
       JOIN users u ON u.id = a.patient_id
       WHERE ($1::uuid IS NULL OR a.patient_id = $1)
         AND ($2::timestamptz IS NULL OR a.starts_at >= $2)
         AND ($3::timestamptz IS NULL OR a.starts_at < $3)
         AND ($4::uuid IS NULL OR a.dentist_id = $4)
         AND ($7::text IS NULL OR a.status = $7)
       ORDER BY a.starts_at, a.id LIMIT $5 OFFSET $6`,
      [user.role === 'patient' ? user.id : null, input.from ?? null, input.to ?? null,
        dentistId ?? null, input.limit, (input.page - 1) * input.limit, input.status ?? null])).rows;
  }

  async reschedule(user: User, id: string, startsAt: Date) {
    return this.db.transaction(async (client) => {
      const appointment = await this.lockAppointment(client, user, id);
      this.requireUpcoming(appointment);
      const duration = (+appointment.ends_at - +appointment.starts_at) / 60000;
      const endsAt = await this.schedule.ensureSlot(client, appointment.dentist_id, startsAt, duration);
      const { rows: [updated] } = await client.query<Appointment>(
        'UPDATE appointments SET starts_at = $2, ends_at = $3, updated_at = now() WHERE id = $1 RETURNING *',
        [id, startsAt, endsAt]);
      await this.event(client, updated, user.id, 'rescheduled', {
        previousStartsAt: appointment.starts_at, previousEndsAt: appointment.ends_at,
      });
      return updated;
    });
  }

  async cancel(user: User, id: string) {
    return this.db.transaction(async (client) => {
      const appointment = await this.lockAppointment(client, user, id);
      if (appointment.status === 'cancelled') return appointment;
      this.requireUpcoming(appointment);
      const { rows: [updated] } = await client.query<Appointment>(
        "UPDATE appointments SET status = 'cancelled', updated_at = now() WHERE id = $1 RETURNING *", [id]);
      await this.event(client, updated, user.id, 'cancelled');
      return updated;
    });
  }

  async complete(user: User, id: string) {
    return this.db.transaction(async (client) => {
      const appointment = await this.lockAppointment(client, user, id);
      if (appointment.status === 'completed') return appointment;
      if (appointment.status !== 'confirmed' || appointment.ends_at > new Date()) {
        throw new BadRequestException('Only finished, confirmed appointments can be completed');
      }
      const { rows: [updated] } = await client.query<Appointment>(
        "UPDATE appointments SET status = 'completed', updated_at = now() WHERE id = $1 RETURNING *", [id]);
      await this.event(client, updated, user.id, 'completed');
      return updated;
    });
  }

  private async lockAppointment(client: PoolClient, user: User, id: string) {
    const dentistId = user.role === 'patient' ? undefined : staffScope(user);
    const { rows: [initial] } = await client.query<Appointment>(
      `SELECT * FROM appointments WHERE id = $1 AND ($2::uuid IS NULL OR patient_id = $2)
       AND ($3::uuid IS NULL OR dentist_id = $3)`,
      [id, user.role === 'patient' ? user.id : null, dentistId ?? null]);
    if (!initial) throw new NotFoundException('Appointment not found');
    await this.schedule.lockDentist(client, initial.dentist_id);
    const { rows: [locked] } = await client.query<Appointment>('SELECT * FROM appointments WHERE id = $1 FOR UPDATE', [id]);
    return locked;
  }

  private requireUpcoming(appointment: Appointment) {
    if (appointment.status !== 'confirmed' || appointment.starts_at <= new Date()) {
      throw new ConflictException('Only upcoming confirmed appointments can be changed');
    }
  }

  private async event(client: PoolClient, appointment: Appointment, actorId: string, action: string, extra: object = {}) {
    await client.query(
      'INSERT INTO appointment_events (appointment_id, actor_id, action, details) VALUES ($1, $2, $3, $4)',
      [appointment.id, actorId, action, JSON.stringify({ startsAt: appointment.starts_at, endsAt: appointment.ends_at, ...extra })]);
  }
}
