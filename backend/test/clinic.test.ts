import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import EmbeddedPostgres from 'embedded-postgres';
import { Pool } from 'pg';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { ClinicApi, ClinicApiError } from '../../frontend-client/src/index';

let postgres: EmbeddedPostgres;
let pool: Pool;
let app: INestApplication;
let baseUrl: string;
let passwordHash: string;
const password = 'a-strong-test-password-123';
const admin = randomUUID();
const patient = randomUUID();
const other = randomUUID();
const dentistUser = randomUUID();
const secondDentistUser = randomUUID();
const dentist = randomUUID();
const dentistTwo = randomUUID();
const treatment = randomUUID();
const workWindow = randomUUID();
const tokens = {
  admin: randomBytes(32).toString('base64url'), patient: randomBytes(32).toString('base64url'), other: randomBytes(32).toString('base64url'),
  dentist: randomBytes(32).toString('base64url'), secondDentist: randomBytes(32).toString('base64url'),
};
const start = new Date();
start.setUTCDate(start.getUTCDate() + 2);
start.setUTCHours(12, 0, 0, 0);
const at = (minutes: number) => new Date(+start + minutes * 60000).toISOString();
const booking = (minutes = 0, dentistId = dentist) => ({ dentistId, treatmentId: treatment, startsAt: at(minutes) });
const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
const api = () => request(app.getHttpServer());
const book = (minutes = 0, token = tokens.patient, key = randomUUID(), dentistId = dentist) =>
  api().post('/api/appointments').auth(token, { type: 'bearer' }).set('Idempotency-Key', key).send(booking(minutes, dentistId));

async function freePort() {
  const server = createServer();
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No test port');
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return address.port;
}

beforeAll(async () => {
  const port = await freePort();
  const databasePassword = randomBytes(24).toString('hex');
  postgres = new EmbeddedPostgres({
    databaseDir: await mkdtemp(join(tmpdir(), 'clinic-postgres-')),
    user: 'clinic_test', password: databasePassword, port, persistent: false,
    authMethod: 'scram-sha-256', postgresFlags: ['-h', '127.0.0.1'],
    onLog: () => {}, onError: () => {},
  });
  await postgres.initialise();
  await postgres.start();
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = `postgresql://clinic_test:${databasePassword}@127.0.0.1:${port}/postgres`;
  process.env.CORS_ORIGINS = 'http://localhost:3000';
  process.env.BOOKING_LEAD_MINUTES = '30';
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const { migrate } = await import('../scripts/migrate');
  await migrate(pool);
  await migrate(pool); // Applied migrations must be safe to rerun.
  const { hashPassword } = await import('../src/auth/password');
  passwordHash = await hashPassword(password);
  const { createApp } = await import('../src/app');
  app = await createApp(true);
  await app.listen(0, '127.0.0.1');
  baseUrl = `${await app.getUrl()}/api`;
});

beforeEach(async () => {
  await pool.query('TRUNCATE users, dentists, treatments, rate_limits CASCADE');
  await pool.query(`INSERT INTO users (id, name, email, password_hash, role) VALUES
    ($1, 'Admin', 'admin@example.test', $4, 'admin'), ($2, 'Patient', 'patient@example.test', $4, 'patient'),
    ($3, 'Other patient', 'other@example.test', $4, 'patient')`, [admin, patient, other, passwordHash]);
  await pool.query(`INSERT INTO users (id, name, email, password_hash, role) VALUES
    ($1, 'Dentist', 'dentist@example.test', $3, 'dentist'), ($2, 'Second Dentist', 'second-dentist@example.test', $3, 'dentist')`,
    [dentistUser, secondDentistUser, passwordHash]);
  for (const [role, userId] of [['admin', admin], ['patient', patient], ['other', other], ['dentist', dentistUser], ['secondDentist', secondDentistUser]] as const) {
    await pool.query("INSERT INTO sessions VALUES ($1, $2, now() + interval '1 hour', now())", [tokenHash(tokens[role]), userId]);
  }
  await pool.query("INSERT INTO dentists (id, name) VALUES ($1, 'Dentist'), ($2, 'Second Dentist')", [dentist, dentistTwo]);
  await pool.query('UPDATE dentists SET user_id = CASE id WHEN $1 THEN $3::uuid ELSE $4::uuid END WHERE id IN ($1, $2)',
    [dentist, dentistTwo, dentistUser, secondDentistUser]);
  await pool.query("INSERT INTO treatments VALUES ($1, 'Evaluation', 30, 15000)", [treatment]);
  await pool.query('INSERT INTO dentist_treatments VALUES ($1, $3), ($2, $3)', [dentist, dentistTwo, treatment]);
  await pool.query('INSERT INTO schedule_windows VALUES ($1, $2, $3, $4), ($5, $6, $3, $4)',
    [workWindow, dentist, at(0), at(480), randomUUID(), dentistTwo]);
});

afterAll(async () => {
  if (app) await app.close();
  if (pool) await pool.end();
  if (postgres) await postgres.stop();
});

describe('authentication and input boundaries', () => {
  it('registers patients, hashes credentials, logs in, and revokes logout sessions', async () => {
    const registered = await api().post('/api/auth/register').send({ name: 'New Patient', email: 'NEW@example.test', password }).expect(201);
    expect(registered.body.user.role).toBe('patient');
    expect(registered.body.user.password_hash).toBeUndefined();
    const stored = await pool.query('SELECT password_hash FROM users WHERE id = $1', [registered.body.user.id]);
    expect(stored.rows[0].password_hash).not.toContain(password);
    const login = await api().post('/api/auth/login').send({ email: 'new@example.test', password }).expect(200);
    expect((await pool.query('SELECT token_hash FROM sessions WHERE token_hash = $1', [tokenHash(login.body.accessToken)])).rowCount).toBe(1);
    await api().get('/api/auth/me').auth(login.body.accessToken, { type: 'bearer' }).expect(200);
    await api().post('/api/auth/logout').auth(login.body.accessToken, { type: 'bearer' }).expect(204);
    await api().get('/api/auth/me').auth(login.body.accessToken, { type: 'bearer' }).expect(401);
  });

  it('rejects role escalation, weak passwords, unknown fields and duplicate emails', async () => {
    await api().post('/api/auth/register').send({ name: 'Attacker', email: 'new@example.test', password, role: 'admin' }).expect(400);
    await api().post('/api/auth/register').send({ name: 'Patient', email: 'new@example.test', password: 'short' }).expect(400);
    await api().post('/api/auth/register').send({ name: 'Duplicate', email: 'PATIENT@example.test', password }).expect(409);
    await book().send({ priceCents: 1 }).expect(400);
  });

  it('returns uniform credential errors and rejects expired sessions', async () => {
    const unknown = await api().post('/api/auth/login').send({ email: 'missing@example.test', password }).expect(401);
    const wrong = await api().post('/api/auth/login').send({ email: 'patient@example.test', password: 'incorrect-password' }).expect(401);
    expect(unknown.body).toEqual(wrong.body);
    await pool.query("UPDATE sessions SET expires_at = now() - interval '1 second'");
    await api().get('/api/auth/me').auth(tokens.patient, { type: 'bearer' }).expect(401);
    await api().get('/api/appointments').expect(401);
  });

  it('enforces admin permissions, UUID validation and timezone offsets', async () => {
    await api().post('/api/dentists').auth(tokens.patient, { type: 'bearer' }).send({ name: 'Forbidden' }).expect(403);
    await api().post('/api/dentists').auth(tokens.admin, { type: 'bearer' }).send({ name: 'Allowed' }).expect(201);
    await book().send({ startsAt: '2030-01-01T10:00:00' }).expect(400);
    await api().patch('/api/appointments/invalid/cancel').auth(tokens.patient, { type: 'bearer' }).expect(400);
  });

  it('rate limits across requests and rejects spoofed forwarding IPs', async () => {
    for (let attempt = 0; attempt < 10; attempt++) {
      await api().post('/api/auth/login').set('X-Forwarded-For', `10.0.0.${attempt}`)
        .send({ email: 'patient@example.test', password: 'bad' }).expect(400);
    }
    const result = await api().post('/api/auth/login').send({ email: 'patient@example.test', password }).expect(429);
    expect(result.headers['retry-after']).toBeDefined();
  });

  it('restricts CORS and sends no-store/security headers', async () => {
    const allowed = await api().get('/api/health').set('Origin', 'http://localhost:3000').expect(200);
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(allowed.headers['cache-control']).toBe('no-store');
    expect(allowed.headers['x-content-type-options']).toBe('nosniff');
    const denied = await api().get('/api/health').set('Origin', 'https://unknown.example').expect(200);
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rejects malformed JSON and oversized request bodies without exposing internals', async () => {
    const invalid = await api().post('/api/auth/login').set('Content-Type', 'application/json').send('{invalid').expect(400);
    expect(invalid.body.code).toBe('HTTP_400');
    await api().post('/api/auth/login').send({ email: 'a'.repeat(17000), password }).expect(413);
  });
});

describe('booking transactions', () => {
  it('calculates duration and price and atomically records the audit event', async () => {
    const result = await book().expect(201);
    expect(result.body.ends_at).toBe(at(30));
    expect(result.body.price_cents).toBe(15000);
    expect(result.body.patient_id).toBe(patient);
    expect((await pool.query('SELECT action FROM appointment_events')).rows).toEqual([{ action: 'booked' }]);
  });

  it('allows only one winner when simultaneous patients reserve overlapping times', async () => {
    const results = await Promise.all([book(0), book(15, tokens.other), book(0, tokens.admin)]);
    expect(results.map((result) => result.status).sort()).toEqual([201, 409, 409]);
    expect((await pool.query('SELECT * FROM appointments')).rowCount).toBe(1);
    expect((await pool.query('SELECT * FROM appointment_events')).rowCount).toBe(1);
  });

  it('protects overlaps at the database level without application locking', async () => {
    const sql = `INSERT INTO appointments (patient_id, dentist_id, treatment_id, starts_at, ends_at, price_cents, idempotency_key, request_starts_at)
      VALUES ($1, $2, $3, $4, $5, 15000, $6, $4)`;
    const results = await Promise.allSettled([
      pool.query(sql, [patient, dentist, treatment, at(0), at(30), randomUUID()]),
      pool.query(sql, [other, dentist, treatment, at(15), at(45), randomUUID()]),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const failure = results.find((result) => result.status === 'rejected') as PromiseRejectedResult;
    expect(failure.reason.code).toBe('23P01');
  });

  it('allows adjacent appointments but prevents patient overlap across dentists', async () => {
    await book(0).expect(201);
    await book(30).expect(201);
    await book(15, tokens.patient, randomUUID(), dentistTwo).expect(409);
    await book(0, tokens.other, randomUUID(), dentistTwo).expect(201);
  });

  it('deduplicates parallel retries and rejects key reuse with changed input', async () => {
    const key = randomUUID();
    const results = await Promise.all([book(0, tokens.patient, key), book(0, tokens.patient, key)]);
    expect(results.map((result) => result.status)).toEqual([201, 201]);
    expect(results[0].body.id).toBe(results[1].body.id);
    await book(60, tokens.patient, key).expect(409);
    expect((await pool.query('SELECT * FROM appointment_events')).rowCount).toBe(1);
  });

  it('rejects missing idempotency keys, unsupported treatments and invalid work times', async () => {
    await api().post('/api/appointments').auth(tokens.patient, { type: 'bearer' }).send(booking()).expect(400);
    await book().send({ treatmentId: randomUUID() }).expect(400);
    await book(-15).expect(409);
    await book(465).expect(409);
    await book(7).expect(409);
    await book().send({ startsAt: new Date().toISOString() }).expect(400);
  });

  it('lists only own bookings and hides other patients records on mutation', async () => {
    const result = await book().expect(201);
    const own = await api().get('/api/appointments').auth(tokens.patient, { type: 'bearer' }).expect(200);
    expect(own.body).toHaveLength(1);
    const hidden = await api().get('/api/appointments').auth(tokens.other, { type: 'bearer' }).expect(200);
    expect(hidden.body).toHaveLength(0);
    await api().patch(`/api/appointments/${result.body.id}/cancel`).auth(tokens.other, { type: 'bearer' }).expect(404);
    await api().patch(`/api/appointments/${result.body.id}/reschedule`).auth(tokens.other, { type: 'bearer' }).send({ startsAt: at(60) }).expect(404);
  });

  it('reschedules atomically and preserves the original booking after a conflict', async () => {
    const first = await book().expect(201);
    await book(60, tokens.other).expect(201);
    await api().patch(`/api/appointments/${first.body.id}/reschedule`).auth(tokens.patient, { type: 'bearer' }).send({ startsAt: at(60) }).expect(409);
    expect((await pool.query('SELECT starts_at FROM appointments WHERE id = $1', [first.body.id])).rows[0].starts_at.toISOString()).toBe(at(0));
    await api().patch(`/api/appointments/${first.body.id}/reschedule`).auth(tokens.patient, { type: 'bearer' }).send({ startsAt: at(120) }).expect(200);
    await book(0, tokens.other).expect(201);
  });

  it('cancels idempotently, releases slots and prevents rescheduling cancelled bookings', async () => {
    const result = await book().expect(201);
    await api().patch(`/api/appointments/${result.body.id}/cancel`).auth(tokens.patient, { type: 'bearer' }).expect(200);
    await api().patch(`/api/appointments/${result.body.id}/cancel`).auth(tokens.patient, { type: 'bearer' }).expect(200);
    await book(0, tokens.other).expect(201);
    await api().patch(`/api/appointments/${result.body.id}/reschedule`).auth(tokens.patient, { type: 'bearer' }).send({ startsAt: at(60) }).expect(409);
    expect((await pool.query("SELECT * FROM appointment_events WHERE action = 'cancelled'")).rowCount).toBe(1);
  });

  it('only allows admins to complete elapsed confirmed appointments', async () => {
    const result = await book().expect(201);
    const endpoint = `/api/appointments/${result.body.id}/complete`;
    await api().patch(endpoint).auth(tokens.patient, { type: 'bearer' }).expect(403);
    await api().patch(endpoint).auth(tokens.admin, { type: 'bearer' }).expect(400);
    await pool.query("UPDATE appointments SET starts_at = now() - interval '2 hours', ends_at = now() - interval '1 hour' WHERE id = $1", [result.body.id]);
    const completed = await api().patch(endpoint).auth(tokens.admin, { type: 'bearer' }).expect(200);
    expect(completed.body.status).toBe('completed');
  });
});

describe('schedule and frontend integration', () => {
  it('returns only free slots with treatment duration and excludes overlaps', async () => {
    await book(30).expect(201);
    const result = await api().get('/api/availability').query({ dentistId: dentist, treatmentId: treatment, from: at(0), to: at(120) }).expect(200);
    expect(result.body).toEqual([
      { startsAt: at(0), endsAt: at(30) }, { startsAt: at(60), endsAt: at(90) },
      { startsAt: at(75), endsAt: at(105) }, { startsAt: at(90), endsAt: at(120) },
    ]);
    await api().get('/api/availability').query({ dentistId: dentist, treatmentId: treatment, from: at(0), to: at(32 * 24 * 60) }).expect(400);
  });

  it('rejects overlapping work windows and removal of booked windows', async () => {
    await api().post('/api/schedule').auth(tokens.admin, { type: 'bearer' }).send({ dentistId: dentist, startsAt: at(60), endsAt: at(180) }).expect(409);
    const result = await book().expect(201);
    await api().delete(`/api/schedule/${workWindow}`).auth(tokens.admin, { type: 'bearer' }).expect(409);
    await api().patch(`/api/appointments/${result.body.id}/cancel`).auth(tokens.patient, { type: 'bearer' }).expect(200);
    await api().delete(`/api/schedule/${workWindow}`).auth(tokens.admin, { type: 'bearer' }).expect(204);
    await book().expect(409);
  });

  it('serializes window removal against booking so a booking can never be orphaned', async () => {
    const [reserved, removed] = await Promise.all([
      book(), api().delete(`/api/schedule/${workWindow}`).auth(tokens.admin, { type: 'bearer' }),
    ]);
    expect([[201, 409], [409, 204]]).toContainEqual([reserved.status, removed.status]);
    const orphaned = await pool.query(`SELECT a.id FROM appointments a WHERE a.status = 'confirmed' AND NOT EXISTS
      (SELECT 1 FROM schedule_windows w WHERE w.dentist_id = a.dentist_id AND w.starts_at <= a.starts_at AND w.ends_at >= a.ends_at)`);
    expect(orphaned.rowCount).toBe(0);
  });

  it('runs login, availability, booking, rescheduling, cancellation and logout through the frontend client', async () => {
    const client = new ClinicApi(baseUrl);
    expect((await client.login('patient@example.test', password)).id).toBe(patient);
    const slots = await client.availability({ dentistId: dentist, treatmentId: treatment, from: at(0), to: at(120) });
    const result = await client.book({ ...booking(), startsAt: slots[0].startsAt }, randomUUID());
    expect((await client.appointments())[0].id).toBe(result.id);
    expect((await client.reschedule(result.id, at(60))).starts_at).toBe(at(60));
    expect((await client.cancel(result.id)).status).toBe('cancelled');
    await client.logout();
    await expect(client.me()).rejects.toBeInstanceOf(ClinicApiError);
  });

  it('connects the actual Vue service adapter and preserves contact details and booking notes', async () => {
    vi.stubEnv('VITE_API_BASE_URL', baseUrl);
    const { api: frontend } = await import('../../src/services/api');
    const registered = await frontend.auth.register({ fullName: 'Vue Patient', email: 'vue@example.test', password, phone: '(71) 99999-9999', cpf: '123.456.789-00' });
    expect(registered.success).toBe(true);
    expect(registered.data?.cpf).toBe('12345678900');
    const catalog = await frontend.booking.getTreatments();
    const dentists = await frontend.booking.getDoctors(treatment);
    expect(catalog.data?.[0].id).toBe(treatment);
    expect(dentists.data).toHaveLength(2);
    const slots = await frontend.booking.getAvailableSlots(dentist, start.toISOString().slice(0, 10), treatment);
    expect(slots.data?.[0].time).toBe('09:00');
    const payload = {
      ...booking(), doctorId: dentist, startsAt: slots.data![0].startsAt!,
      treatmentName: 'Evaluation', doctorName: 'Dentist', date: start.toISOString().slice(0, 10), timeSlot: '09:00',
      patientName: 'Vue Patient', patientEmail: 'vue@example.test', patientPhone: '(71) 99999-9999', patientCpf: '123.456.789-00',
      notes: 'First evaluation', isFirstVisit: true,
    };
    const key = randomUUID();
    const booked = await frontend.booking.createAppointment(payload, key);
    expect(booked.success).toBe(true);
    const retry = await frontend.booking.createAppointment(payload, key);
    expect(retry.data?.protocol).toBe(booked.data?.protocol);
    const record = await pool.query('SELECT patient_phone, patient_cpf, notes FROM appointments WHERE id = $1', [booked.data?.protocol]);
    expect(record.rows[0]).toEqual({ patient_phone: '(71) 99999-9999', patient_cpf: '12345678900', notes: 'First evaluation' });
    await frontend.auth.logout();
    vi.unstubAllEnvs();
  });
});

const toggle = (from = 0, to = 30, available = false, token = tokens.dentist, dentistId?: string) =>
  api().patch('/api/management/availability').auth(token, { type: 'bearer' })
    .send({ startsAt: at(from), endsAt: at(to), available, ...(dentistId ? { dentistId } : {}) });
const managedMove = (id: string, minutes: number, token = tokens.dentist) =>
  api().patch('/api/management/appointments/' + id + '/reschedule').auth(token, { type: 'bearer' }).send({ startsAt: at(minutes) });

describe('dentist appointment management', () => {
  it('connects the admin panel to real management routes and propagates authorization/conflict errors', async () => {
    vi.stubEnv('VITE_API_BASE_URL', baseUrl);
    const { api: frontend } = await import('../../src/services/api');
    await frontend.auth.logout();
    expect((await frontend.admin.getAppointments(dentist, start.toISOString().slice(0, 10))).success).toBe(false);
    await frontend.auth.login({ email: 'dentist@example.test', password });
    const booked = await book().expect(201);
    const date = start.toISOString().slice(0, 10);
    const list = await frontend.admin.getAppointments(dentist, date);
    expect(list.data?.[0].patientName).toBe('Patient');
    expect((await frontend.admin.getAppointments(dentistTwo, date)).success).toBe(false);
    const matrix = await frontend.admin.getSlotMatrix(dentist, date);
    expect(matrix.data?.find((slot) => slot.time === '09:00')?.occupied).toBe(true);
    expect((await frontend.admin.toggleSlotAvailability(dentist, date, '09:00', false)).success).toBe(false);
    expect((await frontend.admin.toggleSlotAvailability(dentist, date, '10:00', false)).success).toBe(true);
    expect((await frontend.admin.rescheduleAppointment(booked.body.id, date, '10:00')).success).toBe(false);
    expect((await frontend.admin.toggleSlotAvailability(dentist, date, '10:00', true)).success).toBe(true);
    expect((await frontend.admin.rescheduleAppointment(booked.body.id, date, '10:00')).success).toBe(true);
    await frontend.auth.logout();
    expect((await frontend.admin.cancelAppointment(booked.body.id)).success).toBe(false);
    vi.unstubAllEnvs();
  });

  it('denies anonymous and patient access to every management operation', async () => {
    const result = await book().expect(201);
    for (const token of [undefined, tokens.patient]) {
      const calls = [
        api().get('/api/management/appointments'),
        api().get('/api/management/availability').query({ from: at(0), to: at(120) }),
        api().patch('/api/management/availability').send({ startsAt: at(0), endsAt: at(30), available: false }),
        api().patch('/api/management/appointments/' + result.body.id + '/reschedule').send({ startsAt: at(60) }),
      ];
      for (const call of calls) {
        if (token) call.auth(token, { type: 'bearer' });
        await call.expect(token ? 403 : 401);
      }
    }
  });

  it('lists all scheduled appointments for admins, only own patients for dentists, with pagination/status', async () => {
    await book().expect(201);
    await book(0, tokens.other, randomUUID(), dentistTwo).expect(201);
    const own = await api().get('/api/management/appointments').auth(tokens.dentist, { type: 'bearer' }).expect(200);
    expect(own.body).toHaveLength(1);
    expect(own.body[0].patient_name).toBe('Patient');
    expect(own.body[0].dentist_id).toBe(dentist);
    const all = await api().get('/api/management/appointments').auth(tokens.admin, { type: 'bearer' }).expect(200);
    expect(all.body).toHaveLength(2);
    const page = await api().get('/api/management/appointments').query({ limit: 1, page: 2 }).auth(tokens.admin, { type: 'bearer' }).expect(200);
    expect(page.body).toHaveLength(1);
    const cancelled = await api().get('/api/management/appointments').query({ status: 'cancelled' }).auth(tokens.dentist, { type: 'bearer' }).expect(200);
    expect(cancelled.body).toHaveLength(0);
    await api().get('/api/management/appointments').query({ dentistId: dentistTwo }).auth(tokens.dentist, { type: 'bearer' }).expect(403);
    await api().get('/api/appointments').query({ dentistId: dentistTwo }).auth(tokens.dentist, { type: 'bearer' }).expect(403);
  });

  it('reschedules own patients atomically and rejects another dentist on both route families', async () => {
    const own = await book().expect(201);
    const another = await book(0, tokens.other, randomUUID(), dentistTwo).expect(201);
    await managedMove(own.body.id, 60).expect(200);
    await managedMove(another.body.id, 60).expect(404);
    await api().patch('/api/appointments/' + another.body.id + '/reschedule').auth(tokens.dentist, { type: 'bearer' }).send({ startsAt: at(60) }).expect(404);
    await toggle(120, 150).expect(200);
    await managedMove(own.body.id, 120).expect(409);
    expect((await pool.query('SELECT starts_at FROM appointments WHERE id = $1', [own.body.id])).rows[0].starts_at.toISOString()).toBe(at(60));
    const event = await pool.query("SELECT actor_id FROM appointment_events WHERE action = 'rescheduled'");
    expect(event.rows).toEqual([{ actor_id: dentistUser }]);
  });

  it('blocks cross-dentist schedule changes and permits own work windows', async () => {
    await toggle(0, 30, false, tokens.dentist, dentistTwo).expect(403);
    await api().get('/api/management/availability').auth(tokens.dentist, { type: 'bearer' }).query({ dentistId: dentistTwo, from: at(0), to: at(120) }).expect(403);
    await api().get('/api/schedule/' + dentistTwo).auth(tokens.dentist, { type: 'bearer' }).query({ from: at(0), to: at(120) }).expect(403);
    await api().delete('/api/schedule/' + workWindow).auth(tokens.secondDentist, { type: 'bearer' }).expect(403);
    await api().post('/api/schedule').auth(tokens.dentist, { type: 'bearer' }).send({ dentistId: dentistTwo, startsAt: at(1440), endsAt: at(1500) }).expect(403);
    const window = await api().post('/api/schedule').auth(tokens.dentist, { type: 'bearer' }).send({ dentistId: dentist, startsAt: at(1440), endsAt: at(1500) }).expect(201);
    await api().delete('/api/schedule/' + window.body.id).auth(tokens.dentist, { type: 'bearer' }).expect(204);
    await toggle(0, 30, false, tokens.admin, dentistTwo).expect(200);
  });

  it('provisions dentist accounts only through an admin and exposes their server-side association on login', async () => {
    const record = await api().post('/api/dentists').auth(tokens.admin, { type: 'bearer' }).send({ name: 'Provisioned Dentist' }).expect(201);
    const endpoint = '/api/dentists/' + record.body.id + '/account';
    const input = { email: 'NEW-DENTIST@example.test', password };
    await api().post(endpoint).auth(tokens.patient, { type: 'bearer' }).send(input).expect(403);
    await api().post(endpoint).auth(tokens.dentist, { type: 'bearer' }).send(input).expect(403);
    const account = await api().post(endpoint).auth(tokens.admin, { type: 'bearer' }).send(input).expect(201);
    expect(account.body.role).toBe('dentist');
    expect(account.body.password_hash).toBeUndefined();
    await api().post(endpoint).auth(tokens.admin, { type: 'bearer' }).send(input).expect(409);
    const login = await api().post('/api/auth/login').send({ email: input.email, password }).expect(200);
    expect(login.body.user.dentistId).toBe(record.body.id);
    await api().get('/api/management/appointments').auth(login.body.accessToken, { type: 'bearer' }).expect(200);
    await api().post('/api/auth/register').send({ name: 'Self promoted', email: 'self@example.test', password, role: 'dentist', dentistId: dentist }).expect(400);
    const publicDentists = await api().get('/api/dentists').expect(200);
    expect(publicDentists.body.some((item: { user_id?: string }) => item.user_id)).toBe(false);
  });

  it('rejects an unlinked dentist and observes role revocation on existing sessions', async () => {
    await pool.query('UPDATE dentists SET user_id = NULL WHERE id = $1', [dentist]);
    await api().get('/api/management/appointments').auth(tokens.dentist, { type: 'bearer' }).expect(403);
    await pool.query("UPDATE users SET role = 'patient' WHERE id = $1", [secondDentistUser]);
    await api().get('/api/management/appointments').auth(tokens.secondDentist, { type: 'bearer' }).expect(403);
  });

  it('hides blocked intervals, rejects bookings, and reopens only the selected sub-interval', async () => {
    await toggle(0, 60).expect(200);
    await book(0).expect(409);
    await book(45).expect(409);
    const slots = await api().get('/api/availability').query({ dentistId: dentist, treatmentId: treatment, from: at(0), to: at(120) }).expect(200);
    expect(slots.body[0].startsAt).toBe(at(60));
    await toggle(15, 45, true).expect(200);
    await toggle(15, 45, true).expect(200);
    const blocks = await api().get('/api/management/availability').auth(tokens.dentist, { type: 'bearer' }).query({ from: at(0), to: at(120) }).expect(200);
    expect(blocks.body.map((block: { starts_at: string; ends_at: string }) => [block.starts_at, block.ends_at])).toEqual([[at(0), at(15)], [at(45), at(60)]]);
    expect((await pool.query('SELECT * FROM availability_events')).rowCount).toBe(2);
    await book(0).expect(409);
    await book(30).expect(409);
    await book(15).expect(201);
    await book(60).expect(201);
  });

  it('merges overlapping blocks and makes repeated toggles idempotent', async () => {
    await toggle(0, 30).expect(200);
    await toggle(15, 60).expect(200);
    await toggle(15, 60).expect(200);
    const blocks = await pool.query('SELECT starts_at, ends_at FROM schedule_blocks');
    expect(blocks.rowCount).toBe(1);
    expect(blocks.rows[0].ends_at.toISOString()).toBe(at(60));
    expect((await pool.query('SELECT * FROM availability_events')).rowCount).toBe(2);
    await toggle(0, 60, true).expect(200);
    expect((await pool.query('SELECT * FROM schedule_blocks')).rowCount).toBe(0);
    await book().expect(201);
  });

  it('refuses blocking a booked interval until the appointment is cancelled', async () => {
    const result = await book().expect(201);
    await toggle(15, 45).expect(409);
    expect((await pool.query('SELECT * FROM availability_events')).rowCount).toBe(0);
    await api().patch('/api/appointments/' + result.body.id + '/cancel').auth(tokens.dentist, { type: 'bearer' }).expect(200);
    await toggle(0, 30).expect(200);
    await book().expect(409);
  });

  it('serializes a simultaneous booking and block without leaving a booked interval blocked', async () => {
    const [reserved, blocked] = await Promise.all([book(), toggle()]);
    expect([[201, 409], [409, 200]]).toContainEqual([reserved.status, blocked.status]);
    const overlap = await pool.query("SELECT a.id FROM appointments a JOIN schedule_blocks b ON a.dentist_id = b.dentist_id AND a.starts_at < b.ends_at AND a.ends_at > b.starts_at WHERE a.status <> 'cancelled'");
    expect(overlap.rowCount).toBe(0);
  });

  it('serializes a simultaneous reschedule and block at the destination', async () => {
    const existing = await book().expect(201);
    const [moved, blocked] = await Promise.all([managedMove(existing.body.id, 60), toggle(60, 90)]);
    expect([[200, 409], [409, 200]]).toContainEqual([moved.status, blocked.status]);
  });

  it('validates time ranges, slot alignment, explicit boolean and admin scope', async () => {
    await toggle(0, 30, false, tokens.admin).expect(400);
    await toggle(30, 0).expect(400);
    await toggle(0, 721).expect(400);
    await toggle(7, 37).expect(409);
    await toggle(-30, 0).expect(409);
    await toggle(1440, 1470, true).expect(409);
    await toggle().send({ available: 'false' }).expect(400);
    await toggle().send({ startsAt: new Date().toISOString() }).expect(400);
    await toggle().send({ startsAt: '2030-01-01T12:00:00' }).expect(400);
  });
});
