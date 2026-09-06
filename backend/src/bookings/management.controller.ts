import { Body, Controller, Get, Param, Patch, Query, Req } from '@nestjs/common';
import { z } from 'zod';
import { Staff } from '../auth/access.guard';
import { AuthRequest } from '../auth/auth.types';
import { instant, parse, period, uuid } from '../common/validation';
import { AvailabilityService } from '../schedule/availability.service';
import { BookingsService } from './bookings.service';
import { appointmentQuery } from './appointment-query';

@Staff()
@Controller('management')
export class ManagementController {
  constructor(private readonly bookings: BookingsService, private readonly availability: AvailabilityService) {}

  @Get('appointments')
  list(@Req() request: AuthRequest, @Query() query: unknown) {
    const input = parse(appointmentQuery, query);
    return this.bookings.list(request.user, { ...input, status: input.status ?? 'confirmed' });
  }

  @Patch('appointments/:id/reschedule')
  reschedule(@Req() request: AuthRequest, @Param('id') id: string, @Body() body: unknown) {
    const { startsAt } = parse(z.object({ startsAt: instant }).strict(), body);
    return this.bookings.reschedule(request.user, parse(uuid, id), startsAt);
  }

  @Get('availability')
  blocks(@Req() request: AuthRequest, @Query() query: unknown) {
    const input = parse(z.object({ dentistId: uuid.optional(), from: instant, to: instant }).strict(), query);
    parse(period, { from: input.from.toISOString(), to: input.to.toISOString() });
    return this.availability.blocks(request.user, input);
  }

  @Patch('availability')
  toggle(@Req() request: AuthRequest, @Body() body: unknown) {
    return this.availability.toggle(request.user, parse(z.object({
      dentistId: uuid.optional(), startsAt: instant, endsAt: instant, available: z.boolean(),
    }).strict(), body));
  }
}
