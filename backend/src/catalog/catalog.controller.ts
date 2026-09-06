import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import { Admin, Public } from '../auth/access.guard';
import { name, parse, uuid } from '../common/validation';
import { CatalogService } from './catalog.service';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Public() @Get('dentists')
  dentists() { return this.catalog.dentists(); }

  @Public() @Get('treatments')
  treatments() { return this.catalog.treatments(); }

  @Admin() @Post('dentists')
  createDentist(@Body() body: unknown) {
    return this.catalog.createDentist(parse(z.object({ name }).strict(), body).name);
  }

  @Admin() @Post('treatments')
  createTreatment(@Body() body: unknown) {
    return this.catalog.createTreatment(parse(z.object({
      name,
      durationMinutes: z.number().int().min(15).max(240).multipleOf(15),
      priceCents: z.number().int().min(0).max(100000000),
    }).strict(), body));
  }

  @Admin() @Post('dentists/:dentistId/account')
  createAccount(@Param('dentistId') dentistId: string, @Body() body: unknown) {
    return this.catalog.createAccount(parse(uuid, dentistId), parse(z.object({
      email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
      password: z.string().min(12).max(128),
    }).strict(), body));
  }

  @Admin() @Post('dentists/:dentistId/treatments/:treatmentId') @HttpCode(204)
  assign(@Param('dentistId') dentistId: string, @Param('treatmentId') treatmentId: string) {
    return this.catalog.assign(parse(uuid, dentistId), parse(uuid, treatmentId));
  }
}
