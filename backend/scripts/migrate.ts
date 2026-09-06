import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { Pool } from 'pg';
import { env } from '../src/config';

export async function migrate(pool: Pool, directory = resolve(process.cwd(), 'migrations')) {
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock(73190421)');
    await client.query(`CREATE TABLE IF NOT EXISTS migrations (
      id text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`);
    const files = (await readdir(directory)).filter((file) => file.endsWith('.sql')).sort();
    for (const id of files) {
      const sql = await readFile(resolve(directory, id), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const { rows: [previous] } = await client.query('SELECT checksum FROM migrations WHERE id = $1', [id]);
      if (previous) {
        if (previous.checksum !== checksum) throw new Error(`Applied migration was modified: ${id}`);
        continue;
      }
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO migrations (id, checksum) VALUES ($1, $2)', [id, checksum]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock(73190421)');
    client.release();
  }
}

async function main() {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  try {
    await migrate(pool);
    console.log('Migrations applied.');
  } finally { await pool.end(); }
}

if (require.main === module) void main().catch(() => {
  console.error('Migration failed. Check database connectivity and migration SQL.');
  process.exitCode = 1;
});
