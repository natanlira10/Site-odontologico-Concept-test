import { CanActivate, ExecutionContext, HttpException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { Database } from '../database/database.service';
import { hashToken } from './password';

export const AuthLimit = () => SetMetadata('authLimit', true);

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly db: Database, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const auth = this.reflector.getAllAndOverride<boolean>('authLimit', [context.getHandler(), context.getClass()]);
    const bucket = Math.floor(Date.now() / 60000);
    const limit = auth ? 10 : 120;
    const key = hashToken(`${auth ? 'auth' : 'api'}:${request.ip}:${bucket}`);
    const { rows: [result] } = await this.db.query<{ hits: number }>(
      `INSERT INTO rate_limits (key, hits, expires_at) VALUES ($1, 1, now() + interval '2 minutes')
       ON CONFLICT (key) DO UPDATE SET hits = rate_limits.hits + 1 RETURNING hits`, [key]);
    if (result.hits > limit) {
      response.setHeader('Retry-After', 60 - Math.floor(Date.now() / 1000) % 60);
      throw new HttpException('Too many requests; try again shortly', 429);
    }
    return true;
  }
}
