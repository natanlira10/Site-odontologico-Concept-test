import { config } from 'dotenv';
import { resolve } from 'node:path';
import { z } from 'zod';

config({ path: [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../.env')], quiet: true });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DATABASE_URL: z.string().url().regex(/^postgres(ql)?:\/\//),
  CORS_ORIGINS: z.string().default('http://localhost:5173').transform((value) =>
    value.split(',').map((origin) => z.string().url().parse(origin.trim()))),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(24).default(12),
  BOOKING_LEAD_MINUTES: z.coerce.number().int().min(0).max(1440).default(30),
  BOOKING_HORIZON_DAYS: z.coerce.number().int().min(1).max(365).default(180),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment keys: ${parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')}`);
}
export const env = parsed.data;
