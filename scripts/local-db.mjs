import EmbeddedPostgres from 'embedded-postgres';
import { config } from 'dotenv';
import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createServer } from 'node:net';

config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });
if (!process.env.DATABASE_URL) throw new Error('Run npm run setup first');
if (process.env.NODE_ENV === 'production') throw new Error('Local embedded database is for development only');
const url = new URL(process.env.DATABASE_URL);
if (!['127.0.0.1', 'localhost'].includes(url.hostname)) throw new Error('db:local requires a loopback DATABASE_URL');
const port = Number(url.port || 5432);
const database = decodeURIComponent(url.pathname.slice(1));
if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(database)) throw new Error('Invalid local database name');
const probe = createServer();
await new Promise((resolve, reject) => {
  probe.once('error', reject);
  probe.listen(port, '127.0.0.1', resolve);
});
await new Promise((resolve) => probe.close(resolve));
const databaseDir = fileURLToPath(new URL('../.local-postgres', import.meta.url));
const postgres = new EmbeddedPostgres({
  databaseDir, port, persistent: true,
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  authMethod: 'scram-sha-256', postgresFlags: ['-h', '127.0.0.1'],
  onLog: () => {}, onError: () => {},
});
let started = false;
let stopping = false;
const stop = async () => {
  if (stopping) return;
  stopping = true;
  if (started) await postgres.stop();
};
process.once('SIGINT', () => { void stop(); });
process.once('SIGTERM', () => { void stop(); });
try {
  let initialized = true;
  try { await access(join(databaseDir, 'PG_VERSION')); } catch { initialized = false; }
  if (!initialized) await postgres.initialise();
  await postgres.start();
  started = true;
  const client = postgres.getPgClient();
  await client.connect();
  try {
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [database]);
    if (!result.rowCount) await postgres.createDatabase(database);
  } finally { await client.end(); }
  console.log('Local PostgreSQL ready on 127.0.0.1:' + port + '. Keep this terminal open. Ctrl+C stops it; data is preserved.');
} catch (error) {
  await stop();
  console.error('Local PostgreSQL failed (' + (error instanceof Error ? error.name : 'error') + '). Check the port, credentials and local database directory.');
  process.exitCode = 1;
}
