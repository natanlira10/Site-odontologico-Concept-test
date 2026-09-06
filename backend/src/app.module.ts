import { Controller, Get, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Database, DatabaseModule } from './database/database.service';
import { AuthModule } from './auth/auth.module';
import { AccessGuard, Public } from './auth/access.guard';
import { RateLimitGuard } from './auth/rate-limit.guard';
import { CatalogModule } from './catalog/catalog.module';
import { ScheduleModule } from './schedule/schedule.module';
import { BookingsModule } from './bookings/bookings.module';

@Controller('health')
class HealthController {
  constructor(private readonly db: Database) {}
  @Public() @Get()
  async health() {
    await this.db.query('SELECT 1');
    return { status: 'ok' };
  }
}

@Module({
  imports: [DatabaseModule, AuthModule, CatalogModule, ScheduleModule, BookingsModule],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: RateLimitGuard },
    { provide: APP_GUARD, useClass: AccessGuard },
  ],
})
export class AppModule {}
