import { Request } from 'express';

export type Role = 'patient' | 'admin' | 'dentist';
export type User = { id: string; name: string; email: string; role: Role; dentistId?: string | null; phone?: string | null; cpf?: string | null };
export type AuthRequest = Request & { user: User; tokenHash: string };
