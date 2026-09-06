import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { AvailabilityService } from './availability.service';

@Module({ controllers: [ScheduleController], providers: [ScheduleService, AvailabilityService], exports: [ScheduleService, AvailabilityService] })
export class ScheduleModule {}
