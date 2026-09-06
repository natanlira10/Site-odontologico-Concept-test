import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
import { z } from 'zod';
import { Staff, Public } from '../auth/access.guard';
import { AuthRequest } from '../auth/auth.types';
import { staffDentist } from '../auth/staff-access';
import { instant, parse, period, uuid } from '../common/validation';
import { ScheduleService } from './schedule.service';

@Controller()
export class ScheduleController {
  constructor(private readonly schedule: ScheduleService) {}

  @Public() @Get('availability')
  availability(@Query() query: unknown) {
    const schema = z.object({ dentistId: uuid, treatmentId: uuid, from: instant, to: instant }).strict();
    const input = parse(schema, query);
    parse(period, { from: input.from.toISOString(), to: input.to.toISOString() });
    return this.schedule.availability(input);
  }

  @Staff() @Get('schedule/:dentistId')
  list(@Req() request: AuthRequest, @Param('dentistId') dentistId: string, @Query() query: unknown) {
    const { from, to } = parse(period, query);
    return this.schedule.list(staffDentist(request.user, parse(uuid, dentistId)), from, to);
  }

  @Staff() @Post('schedule')
  create(@Req() request: AuthRequest, @Body() body: unknown) {
    return this.schedule.create(parse(z.object({ dentistId: uuid, startsAt: instant, endsAt: instant }).strict(), body), request.user);
  }

  @Staff() @Delete('schedule/:id') @HttpCode(204)
  remove(@Req() request: AuthRequest, @Param('id') id: string) { return this.schedule.remove(parse(uuid, id), request.user); }
}
