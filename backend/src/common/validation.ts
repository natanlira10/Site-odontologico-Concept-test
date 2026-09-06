import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

export function parse<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new BadRequestException(result.error.issues.map((issue) =>
      `${issue.path.join('.') || 'request'}: ${issue.message}`).join('; '));
  }
  return result.data;
}

export const uuid = z.string().uuid();
export const instant = z.string().datetime({ offset: true }).transform((value) => new Date(value));
export const period = z.object({ from: instant, to: instant }).strict()
  .refine(({ from, to }) => to > from && +to - +from <= 31 * 86400000,
    'Provide a positive range of at most 31 days');
export const name = z.string().trim().min(2).max(120);
export const phone = z.string().trim().max(32).regex(/^[+\d\s()-]*$/).optional();
export const cpf = z.string().max(14).transform((value) => value.replace(/[.-]/g, ''))
  .pipe(z.string().regex(/^(\d{11})?$/)).optional();
