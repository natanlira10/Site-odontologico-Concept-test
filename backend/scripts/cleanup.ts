import { Database } from '../src/database/database.service';

async function main() {
  const db = new Database();
  try {
    await db.query('DELETE FROM sessions WHERE expires_at <= now()');
    await db.query('DELETE FROM rate_limits WHERE expires_at <= now()');
  } finally { await db.onApplicationShutdown(); }
}

void main().catch(() => { console.error('Cleanup failed'); process.exitCode = 1; });
