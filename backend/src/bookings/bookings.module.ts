import { Module } from '@nestjs/common';
import { ScheduleModule } from '../schedule/schedule.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { ManagementController } from './management.controller';

@Module({ imports: [ScheduleModule], controllers: [BookingsController, ManagementController], providers: [BookingsService] })
export class BookingsModule {}
