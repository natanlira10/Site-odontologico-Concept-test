import { z } from 'zod';
import { Database } from '../src/database/database.service';
import { hashPassword } from '../src/auth/password';
import { env } from '../src/config';

async function main() {
  const credentials = z.object({
    ADMIN_EMAIL: z.string().email().transform((value) => value.toLowerCase()),
    ADMIN_PASSWORD: z.string().min(12).max(128),
  }).parse(process.env);
  const db = new Database();
  try {
    await db.transaction(async (client) => {
      await client.query('SELECT pg_advisory_xact_lock(73190422)');
      const existing = await client.query('SELECT role FROM users WHERE email = $1', [credentials.ADMIN_EMAIL]);
      if (existing.rows[0]?.role === 'patient') throw new Error('Admin email belongs to an existing patient');
      if (!existing.rowCount) {
        await client.query("INSERT INTO users (name, email, password_hash, role) VALUES ('Administrador', $1, $2, 'admin')",
          [credentials.ADMIN_EMAIL, await hashPassword(credentials.ADMIN_PASSWORD)]);
      }
      // Demonstration catalog and work windows are never added in production.
      if (env.NODE_ENV !== 'production') {
        const dentistId = '10000000-0000-4000-8000-000000000001';
        const treatmentId = '20000000-0000-4000-8000-000000000001';
        await client.query("INSERT INTO dentists (id, name) VALUES ($1, 'Dentista Demonstração') ON CONFLICT DO NOTHING", [dentistId]);
        await client.query(`INSERT INTO treatments (id, name, duration_minutes, price_cents)
          VALUES ($1, 'Consulta de avaliação', 30, 15000) ON CONFLICT DO NOTHING`, [treatmentId]);
        await client.query('INSERT INTO dentist_treatments VALUES ($1, $2) ON CONFLICT DO NOTHING', [dentistId, treatmentId]);
        await client.query('SELECT id FROM dentists WHERE id = $1 FOR UPDATE', [dentistId]);
        for (let offset = 1; offset <= 14; offset++) {
          const startsAt = new Date();
          startsAt.setUTCDate(startsAt.getUTCDate() + offset);
          startsAt.setUTCHours(12, 0, 0, 0); // 09:00 America/Bahia.
          if (startsAt.getUTCDay() === 0 || startsAt.getUTCDay() === 6) continue;
          const endsAt = new Date(+startsAt + 8 * 3600000);
          await client.query(`INSERT INTO schedule_windows (dentist_id, starts_at, ends_at)
            VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [dentistId, startsAt, endsAt]);
        }
      }
    });
    console.log('Seed complete. Existing users and passwords were preserved.');
  } finally { await db.onApplicationShutdown(); }
}

void main().catch(() => {
  console.error('Seed failed. Check ADMIN_EMAIL, ADMIN_PASSWORD and database configuration.');
  process.exitCode = 1;
});
