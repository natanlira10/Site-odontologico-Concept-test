export type User = { id: string; name: string; email: string; role: 'patient' | 'admin' | 'dentist'; dentistId?: string | null; phone?: string | null; cpf?: string | null };
export type Session = { user: User; accessToken: string; expiresAt: string };
export type Dentist = { id: string; name: string; treatment_ids: string[] };
export type Treatment = { id: string; name: string; duration_minutes: number; price_cents: number };
export type Slot = { startsAt: string; endsAt: string };
export type WorkWindow = { id: string; dentist_id: string; starts_at: string; ends_at: string };
export type Appointment = {
  id: string; patient_id: string; dentist_id: string; treatment_id: string;
  starts_at: string; ends_at: string; price_cents: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  dentist_name?: string; treatment_name?: string;
  patient_name?: string; patient_email?: string; patient_phone?: string | null; notes?: string | null; created_at: string;
};
export type BookingInput = {
  dentistId: string; treatmentId: string; startsAt: string;
  patientPhone?: string; patientCpf?: string; notes?: string; isFirstVisit?: boolean;
};
export type AvailabilityQuery = { dentistId: string; treatmentId: string; from: string; to: string };

export class ClinicApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
    this.name = 'ClinicApiError';
  }
}

export class ClinicApi {
  private accessToken: string | undefined;
  private readonly baseUrl: string;

  constructor(baseUrl = 'http://localhost:3001/api') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(path: string, method = 'GET', body?: unknown, headers: Record<string, string> = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      credentials: 'omit',
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) {
      if (response.status === 401) this.accessToken = undefined;
      const error = await response.json().catch(() => null);
      throw new ClinicApiError(response.status, error?.code ?? 'HTTP_ERROR', error?.error ?? 'Request failed');
    }
    return response.status === 204 ? undefined as T : response.json();
  }

  async register(input: { name: string; email: string; password: string; phone?: string; cpf?: string }) {
    const session = await this.request<Session>('/auth/register', 'POST', input);
    this.accessToken = session.accessToken;
    return session.user;
  }

  async login(email: string, password: string) {
    const session = await this.request<Session>('/auth/login', 'POST', { email, password });
    this.accessToken = session.accessToken; // Memory only: no localStorage or URLs.
    return session.user;
  }

  async logout() {
    try { await this.request<void>('/auth/logout', 'POST'); }
    finally { this.accessToken = undefined; }
  }

  me() { return this.request<User>('/auth/me'); }
  dentists() { return this.request<Dentist[]>('/dentists'); }
  treatments() { return this.request<Treatment[]>('/treatments'); }
  availability(query: AvailabilityQuery) {
    return this.request<Slot[]>(`/availability?${new URLSearchParams(query)}`);
  }
  appointments(query: { page?: number; limit?: number; from?: string; to?: string; dentistId?: string } = {}) {
    const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)]));
    return this.request<Appointment[]>(`/appointments?${params}`);
  }

  // Create ONE UUID per booking attempt and reuse it for network retries/double clicks.
  book(input: BookingInput, idempotencyKey: string) {
    return this.request<Appointment>('/appointments', 'POST', input, { 'Idempotency-Key': idempotencyKey });
  }
  reschedule(id: string, startsAt: string) {
    return this.request<Appointment>(`/appointments/${encodeURIComponent(id)}/reschedule`, 'PATCH', { startsAt });
  }
  cancel(id: string) {
    return this.request<Appointment>(`/appointments/${encodeURIComponent(id)}/cancel`, 'PATCH');
  }
  complete(id: string) {
    return this.request<Appointment>(`/appointments/${encodeURIComponent(id)}/complete`, 'PATCH');
  }
  createDentist(name: string) { return this.request<Dentist>('/dentists', 'POST', { name }); }
  createDentistAccount(dentistId: string, input: { email: string; password: string }) {
    return this.request<User>(`/dentists/${encodeURIComponent(dentistId)}/account`, 'POST', input);
  }
  managedAppointments(query: { page?: number; limit?: number; from?: string; to?: string; dentistId?: string; status?: Appointment['status'] } = {}) {
    const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)]));
    return this.request<Appointment[]>(`/management/appointments?${params}`);
  }
  rescheduleManagedAppointment(id: string, startsAt: string) {
    return this.request<Appointment>(`/management/appointments/${encodeURIComponent(id)}/reschedule`, 'PATCH', { startsAt });
  }
  blockedSlots(query: { dentistId?: string; from: string; to: string }) {
    const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value !== undefined) as [string, string][]);
    return this.request<WorkWindow[]>(`/management/availability?${params}`);
  }
  setAvailability(input: { dentistId?: string; startsAt: string; endsAt: string; available: boolean }) {
    return this.request<typeof input & { dentistId: string }>('/management/availability', 'PATCH', input);
  }
  createTreatment(input: { name: string; durationMinutes: number; priceCents: number }) {
    return this.request<Treatment>('/treatments', 'POST', input);
  }
  assignTreatment(dentistId: string, treatmentId: string) {
    return this.request<void>(`/dentists/${encodeURIComponent(dentistId)}/treatments/${encodeURIComponent(treatmentId)}`, 'POST');
  }
  schedule(dentistId: string, query: { from: string; to: string }) {
    return this.request<WorkWindow[]>(`/schedule/${encodeURIComponent(dentistId)}?${new URLSearchParams(query)}`);
  }
  createWorkWindow(input: { dentistId: string; startsAt: string; endsAt: string }) {
    return this.request<WorkWindow>('/schedule', 'POST', input);
  }
  removeWorkWindow(id: string) { return this.request<void>(`/schedule/${encodeURIComponent(id)}`, 'DELETE'); }
}
