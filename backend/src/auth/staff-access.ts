import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { User } from './auth.types';

export function staffScope(user: User, requestedId?: string) {
  if (user.role === 'admin') return requestedId;
  if (user.role !== 'dentist' || !user.dentistId) throw new ForbiddenException('Staff access required');
  if (requestedId && requestedId !== user.dentistId) throw new ForbiddenException('Cannot manage another dentist');
  return user.dentistId;
}

export function staffDentist(user: User, requestedId?: string) {
  const id = staffScope(user, requestedId);
  if (!id) throw new BadRequestException('dentistId is required for administrators');
  return id;
}
