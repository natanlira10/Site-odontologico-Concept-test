import { Body, Controller, Get, Headers, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { z } from 'zod';
import { Staff } from '../auth/access.guard';
import { AuthRequest } from '../auth/auth.types';
import { cpf, instant, parse, phone, uuid } from '../common/validation';
import { BookingsService } from './bookings.service';
import { appointmentQuery } from './appointment-query';

@Controller('appointments')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post()
  book(@Req() request: AuthRequest, @Body() body: unknown, @Headers('idempotency-key') key: unknown) {
    const input = parse(z.object({
      dentistId: uuid, treatmentId: uuid, startsAt: instant, patientPhone: phone, patientCpf: cpf,
      notes: z.string().trim().max(2000).optional(), isFirstVisit: z.boolean().default(true),
    }).strict(), body);
    return this.bookings.book(request.user, input, parse(uuid, key));
  }

  @Get()
  list(@Req() request: AuthRequest, @Query() query: unknown) {
    const input = parse(appointmentQuery, query);
    return this.bookings.list(request.user, input);
  }

  @Patch(':id/reschedule')
  reschedule(@Req() request: AuthRequest, @Param('id') id: string, @Body() body: unknown) {
    const { startsAt } = parse(z.object({ startsAt: instant }).strict(), body);
    return this.bookings.reschedule(request.user, parse(uuid, id), startsAt);
  }

  @Patch(':id/cancel')
  cancel(@Req() request: AuthRequest, @Param('id') id: string, @Body() body: unknown) {
    parse(z.object({}).strict(), body ?? {});
    return this.bookings.cancel(request.user, parse(uuid, id));
  }

  @Staff() @Patch(':id/complete')
  complete(@Req() request: AuthRequest, @Param('id') id: string, @Body() body: unknown) {
    parse(z.object({}).strict(), body ?? {});
    return this.bookings.complete(request.user, parse(uuid, id));
  }
}
