import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '../database/database.service';
import { hashPassword } from '../auth/password';

@Injectable()
export class CatalogService {
  constructor(private readonly db: Database) {}

  async dentists() {
    return (await this.db.query(
      `SELECT d.id, d.name, COALESCE(array_agg(dt.treatment_id) FILTER (WHERE dt.treatment_id IS NOT NULL), '{}') AS treatment_ids
       FROM dentists d LEFT JOIN dentist_treatments dt ON dt.dentist_id = d.id GROUP BY d.id ORDER BY d.name`)).rows;
  }

  async treatments() {
    return (await this.db.query('SELECT * FROM treatments ORDER BY name')).rows;
  }

  async createDentist(name: string) {
    return (await this.db.query("INSERT INTO dentists (name) VALUES ($1) RETURNING id, name, '{}'::uuid[] AS treatment_ids", [name])).rows[0];
  }

  async createAccount(dentistId: string, input: { email: string; password: string }) {
    const passwordHash = await hashPassword(input.password);
    return this.db.transaction(async (client) => {
      const { rows: [dentist] } = await client.query('SELECT id, name, user_id FROM dentists WHERE id = $1 FOR UPDATE', [dentistId]);
      if (!dentist) throw new NotFoundException('Dentist not found');
      if (dentist.user_id) throw new ConflictException('Dentist already has an account');
      const { rows: [user] } = await client.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'dentist')
         RETURNING id, name, email, role`, [dentist.name, input.email, passwordHash]);
      await client.query('UPDATE dentists SET user_id = $2 WHERE id = $1', [dentistId, user.id]);
      return { ...user, dentistId };
    });
  }

  async createTreatment(input: { name: string; durationMinutes: number; priceCents: number }) {
    return (await this.db.query(
      'INSERT INTO treatments (name, duration_minutes, price_cents) VALUES ($1, $2, $3) RETURNING *',
      [input.name, input.durationMinutes, input.priceCents])).rows[0];
  }

  async assign(dentistId: string, treatmentId: string) {
    await this.db.query('INSERT INTO dentist_treatments VALUES ($1, $2) ON CONFLICT DO NOTHING', [dentistId, treatmentId]);
  }
}
