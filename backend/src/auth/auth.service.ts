import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { Database } from '../database/database.service';
import { env } from '../config';
import { hashPassword, hashToken, verifyPassword } from './password';
import { User } from './auth.types';

@Injectable()
export class AuthService {
  // Equal-cost password verification for unknown emails.
  private readonly dummyHash = hashPassword(randomBytes(32).toString('hex'));

  constructor(private readonly db: Database) {}

  async register(input: { name: string; email: string; password: string; phone?: string; cpf?: string }) {
    const passwordHash = await hashPassword(input.password);
    return this.db.transaction(async (client) => {
      const { rows: [user] } = await client.query<User>(
        `INSERT INTO users (name, email, password_hash, phone, cpf) VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, role, phone, cpf`, [input.name, input.email, passwordHash, input.phone ?? null, input.cpf ?? null]);
      return this.createSession(user, client);
    });
  }

  async login(email: string, password: string) {
    const { rows: [record] } = await this.db.query<User & { password_hash: string }>(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.cpf, u.password_hash, d.id AS "dentistId"
       FROM users u LEFT JOIN dentists d ON d.user_id = u.id WHERE u.email = $1`, [email]);
    const valid = await verifyPassword(password, record?.password_hash ?? await this.dummyHash);
    if (!record || !valid) throw new UnauthorizedException('Invalid email or password');
    const { id, name, role, phone, cpf, dentistId } = record;
    return this.createSession({ id, name, email: record.email, role, phone, cpf, dentistId }, this.db);
  }

  private async createSession(user: User, executor: Pick<Database, 'query'>) {
    const accessToken = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 3600000);
    await executor.query('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
      [hashToken(accessToken), user.id, expiresAt]);
    return { user, accessToken, expiresAt };
  }

  async logout(tokenHash: string) {
    await this.db.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash]);
  }
}
