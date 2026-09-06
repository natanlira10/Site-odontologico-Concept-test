import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { z } from 'zod';
import { cpf, name, parse, phone } from '../common/validation';
import { AuthService } from './auth.service';
import { Public } from './access.guard';
import { AuthLimit } from './rate-limit.guard';
import { AuthRequest } from './auth.types';

const credentials = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(128),
}).strict();

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public() @AuthLimit() @Post('register')
  register(@Body() body: unknown) {
    return this.auth.register(parse(credentials.extend({ name, phone, cpf }).strict(), body));
  }

  @Public() @AuthLimit() @Post('login') @HttpCode(200)
  login(@Body() body: unknown) {
    const { email, password } = parse(credentials, body);
    return this.auth.login(email, password);
  }

  @Get('me')
  me(@Req() request: AuthRequest) { return request.user; }

  @Post('logout') @HttpCode(204)
  logout(@Req() request: AuthRequest) { return this.auth.logout(request.tokenHash); }
}
