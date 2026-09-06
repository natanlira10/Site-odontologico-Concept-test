import { z } from 'zod';
import { instant, uuid } from '../common/validation';

export const appointmentQuery = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  from: instant.optional(), to: instant.optional(), dentistId: uuid.optional(),
  status: z.enum(['confirmed', 'cancelled', 'completed']).optional(),
}).strict().refine((value) => !value.from || !value.to || value.to > value.from, 'to must be after from');

export type AppointmentQuery = z.infer<typeof appointmentQuery>;
