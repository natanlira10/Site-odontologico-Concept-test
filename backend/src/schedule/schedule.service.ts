import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PoolClient } from 'pg';
import { Database } from '../database/database.service';
import { env } from '../config';
import { User } from '../auth/auth.types';
import { staffDentist } from '../auth/staff-access';

type WorkWindow = { id: string; dentist_id: string; starts_at: Date; ends_at: Date };
type Treatment = { duration_minutes: number; price_cents: number };
const minute = 60000;

@Injectable()
export class ScheduleService {
  constructor(private readonly db: Database) {}

  async lockDentist(client: PoolClient, dentistId: string) {
    const result = await client.query('SELECT id FROM dentists WHERE id = $1 FOR UPDATE', [dentistId]);
    if (!result.rowCount) throw new NotFoundException('Dentist not found');
  }

  async treatment(dentistId: string, treatmentId: string, executor: Pick<Database, 'query'> = this.db) {
    const { rows: [treatment] } = await executor.query<Treatment>(
      `SELECT t.duration_minutes, t.price_cents FROM treatments t
       JOIN dentist_treatments dt ON dt.treatment_id = t.id WHERE dt.dentist_id = $1 AND t.id = $2`,
      [dentistId, treatmentId]);
    if (!treatment) throw new BadRequestException('Treatment is not offered by this dentist');
    return treatment;
  }

  validateBookingTime(startsAt: Date) {
    const now = Date.now();
    if (+startsAt < now + env.BOOKING_LEAD_MINUTES * minute ||
        +startsAt > now + env.BOOKING_HORIZON_DAYS * 86400000) {
      throw new BadRequestException(`Book between ${env.BOOKING_LEAD_MINUTES} minutes and ${env.BOOKING_HORIZON_DAYS} days ahead`);
    }
  }

  async ensureSlot(client: PoolClient, dentistId: string, startsAt: Date, duration: number) {
    this.validateBookingTime(startsAt);
    const endsAt = new Date(+startsAt + duration * minute);
    const { rowCount } = await client.query(
      `SELECT id FROM schedule_windows WHERE dentist_id = $1 AND starts_at <= $2 AND ends_at >= $3
       AND mod(extract(epoch FROM ($2::timestamptz - starts_at))::numeric, 900) = 0`,
      [dentistId, startsAt, endsAt]);
    if (!rowCount) throw new ConflictException('Time is outside the available work windows or slot grid');
    const blocked = await client.query(
      'SELECT id FROM schedule_blocks WHERE dentist_id = $1 AND starts_at < $3 AND ends_at > $2 LIMIT 1',
      [dentistId, startsAt, endsAt]);
    if (blocked.rowCount) throw new ConflictException('This interval is blocked by the dentist');
    return endsAt;
  }

  async list(dentistId: string, from: Date, to: Date) {
    return (await this.db.query<WorkWindow>(
      'SELECT * FROM schedule_windows WHERE dentist_id = $1 AND starts_at < $3 AND ends_at > $2 ORDER BY starts_at',
      [dentistId, from, to])).rows;
  }

  async create(input: { dentistId: string; startsAt: Date; endsAt: Date }, user: User) {
    staffDentist(user, input.dentistId);
    if (input.startsAt <= new Date() || input.endsAt <= input.startsAt || +input.endsAt - +input.startsAt > 12 * 3600000) {
      throw new BadRequestException('Work windows must be in the future and last at most 12 hours');
    }
    if (+input.startsAt % minute || +input.endsAt % minute) {
      throw new BadRequestException('Work windows must start and end on whole minutes');
    }
    return this.db.transaction(async (client) => {
      await this.lockDentist(client, input.dentistId);
      return (await client.query<WorkWindow>(
        'INSERT INTO schedule_windows (dentist_id, starts_at, ends_at) VALUES ($1, $2, $3) RETURNING *',
        [input.dentistId, input.startsAt, input.endsAt])).rows[0];
    });
  }

  async remove(id: string, user: User) {
    return this.db.transaction(async (client) => {
      const { rows: [window] } = await client.query<WorkWindow>('SELECT * FROM schedule_windows WHERE id = $1', [id]);
      if (!window) throw new NotFoundException('Work window not found');
      staffDentist(user, window.dentist_id);
      // Same lock order as booking/rescheduling prevents deleting a window during a booking.
      await this.lockDentist(client, window.dentist_id);
      const { rowCount } = await client.query(
        `SELECT id FROM appointments WHERE dentist_id = $1 AND status <> 'cancelled'
         AND starts_at < $3 AND ends_at > $2 LIMIT 1`, [window.dentist_id, window.starts_at, window.ends_at]);
      if (rowCount) throw new ConflictException('Cancel or reschedule appointments before removing this work window');
      await client.query('DELETE FROM schedule_windows WHERE id = $1', [id]);
    });
  }

  async availability(input: { dentistId: string; treatmentId: string; from: Date; to: Date }) {
    const treatment = await this.treatment(input.dentistId, input.treatmentId);
    const windows = await this.list(input.dentistId, input.from, input.to);
    const { rows: busy } = await this.db.query<{ starts_at: Date; ends_at: Date }>(
      `SELECT starts_at, ends_at FROM appointments WHERE dentist_id = $1 AND status <> 'cancelled'
       AND starts_at < $3 AND ends_at > $2
       UNION ALL SELECT starts_at, ends_at FROM schedule_blocks
       WHERE dentist_id = $1 AND starts_at < $3 AND ends_at > $2`, [input.dentistId, input.from, input.to]);
    const earliest = Math.max(+input.from, Date.now() + env.BOOKING_LEAD_MINUTES * minute);
    const latest = Math.min(+input.to, Date.now() + env.BOOKING_HORIZON_DAYS * 86400000);
    const slots: { startsAt: string; endsAt: string }[] = [];
    for (const window of windows) {
      for (let start = +window.starts_at; start + treatment.duration_minutes * minute <= +window.ends_at; start += 15 * minute) {
        const end = start + treatment.duration_minutes * minute;
        if (start < earliest || start >= latest || end > +input.to) continue;
        if (busy.some((appointment) => +appointment.starts_at < end && +appointment.ends_at > start)) continue;
        slots.push({ startsAt: new Date(start).toISOString(), endsAt: new Date(end).toISOString() });
      }
    }
    return slots;
  }
}
