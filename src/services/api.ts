import { createAdminApi } from './admin-api';
import { ClinicApi, ClinicApiError, type User } from '../../frontend-client/src/index';
import type { ApiResponse, AuthUser, BookingConfirmation, BookingRequest, Doctor, RegisterRequest, TimeSlot, Treatment, UserCredentials } from '@/types';

export const clinic = new ClinicApi(import.meta.env.VITE_API_BASE_URL || '/api');
const clock = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Bahia', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const profile = (user: User): AuthUser => ({ ...user, cpf: user.cpf ?? '', phone: user.phone ?? '' });

async function response<T>(work: () => Promise<T>): Promise<ApiResponse<T>> {
  try { return { success: true, data: await work() }; }
  catch (error) {
    const status = error instanceof ClinicApiError ? error.status : 0;
    return {
      success: false,
      message: status === 401 ? 'Entre na sua conta para continuar.'
        : status === 409 ? 'O horário ou os dados entraram em conflito. Atualize a seleção e tente novamente.'
        : status === 429 ? 'Muitas tentativas. Aguarde um minuto.'
        : error instanceof ClinicApiError ? error.message : 'Não foi possível conectar à clínica. Tente novamente.',
      errorCode: String(status || 'NETWORK_ERROR'),
    };
  }
}

export const api = {
  auth: {
    login: (input: UserCredentials) => response(async () => profile(await clinic.login(input.email, input.password ?? ''))),
    register: (input: RegisterRequest) => response(async () => profile(await clinic.register({
      name: input.fullName, email: input.email, password: input.password ?? '', phone: input.phone, cpf: input.cpf,
    }))),
    logout: () => response(() => clinic.logout()),
  },
  booking: {
    getTreatments: () => response<Treatment[]>(async () => (await clinic.treatments()).map((item) => ({
      id: item.id, name: item.name, category: 'reabilitacao', categoryLabel: 'Atendimento odontológico',
      shortDescription: 'Consulta de ' + item.duration_minutes + ' minutos.', fullDescription: '',
      duration: item.duration_minutes + ' minutos', discomfortLevel: 'Controlado', recoveryTime: 'Consultar profissional',
      recommendedSessions: 1, highlightTag: '', imageUrl: '/favicon.svg', features: [],
      startingPriceEstimate: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price_cents / 100),
    }))),
    getDoctors: (treatmentId?: string) => response<Doctor[]>(async () => (await clinic.dentists())
      .filter((item) => !treatmentId || item.treatment_ids.includes(treatmentId)).map((item) => ({
        id: item.id, name: item.name, cro: '', title: 'Cirurgião-dentista', specialty: 'Odontologia',
        bio: '', avatarUrl: '/favicon.svg', education: [], supportedTreatments: item.treatment_ids,
      }))),
    getAvailableSlots: (doctorId: string, date: string, treatmentId: string) => response<TimeSlot[]>(async () => {
      // This clinic operates in Bahia (UTC-03); backend receives explicit UTC instants.
      const from = new Date(date + 'T00:00:00-03:00');
      const to = new Date(+from + 86400000);
      const slots = await clinic.availability({ dentistId: doctorId, treatmentId, from: from.toISOString(), to: to.toISOString() });
      return slots.map((slot) => {
        const time = clock.format(new Date(slot.startsAt));
        const hour = Number(time.split(':')[0]);
        return { id: slot.startsAt, startsAt: slot.startsAt, time, available: true, period: hour < 12 ? 'manha' : hour < 18 ? 'tarde' : 'noite' };
      });
    }),
    createAppointment: (input: BookingRequest, idempotencyKey: string) => response<BookingConfirmation>(async () => {
      const user = await clinic.me();
      const appointment = await clinic.book({
        dentistId: input.doctorId, treatmentId: input.treatmentId, startsAt: input.startsAt,
        patientPhone: input.patientPhone, patientCpf: input.patientCpf, notes: input.notes, isFirstVisit: input.isFirstVisit,
      }, idempotencyKey);
      return {
        protocol: appointment.id, status: 'confirmed', treatmentName: input.treatmentName, doctorName: input.doctorName,
        date: input.date, time: clock.format(new Date(appointment.starts_at)), patientName: user.name,
        patientPhone: input.patientPhone, location: 'Consulte o endereço da clínica na seção de contato.', createdAt: new Date().toISOString(),
      };
    }),
  },
  admin: createAdminApi(clinic, response),
};

export default api;
