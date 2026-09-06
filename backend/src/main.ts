import { Logger } from '@nestjs/common';
import { createApp } from './app';
import { Database } from './database/database.service';
import { env } from './config';

async function bootstrap() {
  const app = await createApp();
  await app.get(Database).query('SELECT id FROM migrations LIMIT 1');
  await app.listen(env.PORT, '0.0.0.0');
  Logger.log(`Clinic API listening on port ${env.PORT}`, 'Bootstrap');
}

bootstrap().catch(() => {
  Logger.error('Startup failed. Check environment, database connectivity and migrations.', 'Bootstrap');
  process.exit(1);
});
