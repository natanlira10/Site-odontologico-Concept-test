import { randomBytes } from 'node:crypto';
import { chmod, readFile, writeFile } from 'node:fs/promises';

const databasePassword = randomBytes(24).toString('hex');
const adminPassword = randomBytes(24).toString('base64url');
const template = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
const content = template.replaceAll('CHANGE_ME', databasePassword)
  .replace(`ADMIN_PASSWORD=${databasePassword}`, `ADMIN_PASSWORD=${adminPassword}`);
const target = new URL('../.env', import.meta.url);
let existing = '';
try { existing = await readFile(target, 'utf8'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const keys = new Set(existing.split('\n').filter((line) => /^[A-Z_]+=/.test(line)).map((line) => line.split('=')[0]));
const missing = content.split('\n').filter((line) => /^[A-Z_]+=/.test(line) && !keys.has(line.split('=')[0]));
await writeFile(target, existing ? `${existing.trimEnd()}\n${missing.join('\n')}\n` : content, { mode: 0o600 });
await chmod(target, 0o600);
console.log('.env ready; existing values preserved. Initial admin credentials are in .env.');
