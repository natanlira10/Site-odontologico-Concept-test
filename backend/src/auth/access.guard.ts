import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Database } from '../database/database.service';
import { AuthRequest, Role, User } from './auth.types';
import { hashToken } from './password';

export const Public = () => SetMetadata('public', true);
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
export const Admin = () => Roles('admin');
export const Staff = () => Roles('admin', 'dentist');

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(private readonly db: Database, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>('public', targets)) return true;
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(request.headers.authorization ?? '');
    if (!match) throw new UnauthorizedException('Authentication required');
    const tokenHash = hashToken(match[1]);
    const { rows: [user] } = await this.db.query<User>(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.cpf, d.id AS "dentistId"
       FROM sessions s JOIN users u ON u.id = s.user_id LEFT JOIN dentists d ON d.user_id = u.id
       WHERE s.token_hash = $1 AND s.expires_at > now()`, [tokenHash]);
    if (!user) throw new UnauthorizedException('Session expired or invalid');
    const roles = this.reflector.getAllAndOverride<Role[]>('roles', targets);
    if (roles && !roles.includes(user.role)) throw new ForbiddenException('Insufficient permissions');
    if (user.role === 'dentist' && !user.dentistId) throw new ForbiddenException('Dentist account is not linked');
    request.user = user;
    request.tokenHash = tokenHash;
    return true;
  }
}
