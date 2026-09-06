import type { ClinicApi, Appointment } from '../../frontend-client/src/index';
import type { AdminAppointment, ApiResponse, TimeSlot } from '@/types';

const clock = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Bahia', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bahia', year: 'numeric', month: '2-digit', day: '2-digit' });
type Wrap = <T>(work: () => Promise<T>) => Promise<ApiResponse<T>>;

export function createAdminApi(clinic: ClinicApi, response: Wrap) {
  const range = (date: string) => {
    const from = new Date(date + 'T00:00:00-03:00');
    return { from: from.toISOString(), to: new Date(+from + 86400000).toISOString() };
  };

  async function appointments(dentistId?: string, date?: string) {
    const result: Appointment[] = [];
    for (let page = 1; page <= 10000; page++) {
      const items = await clinic.managedAppointments({ dentistId, ...(date ? range(date) : {}), page, limit: 100 });
      result.push(...items);
      if (items.length < 100) break;
    }
    return result;
  }

  return {
    getAppointments: (dentistId?: string, date?: string) => response<AdminAppointment[]>(async () =>
      (await appointments(dentistId, date)).map((item) => ({
        id: item.id, patientName: item.patient_name ?? '', patientEmail: item.patient_email ?? '', patientPhone: item.patient_phone ?? '',
        treatmentId: item.treatment_id, treatmentName: item.treatment_name ?? '', doctorId: item.dentist_id, doctorName: item.dentist_name ?? '',
        date: day.format(new Date(item.starts_at)), time: clock.format(new Date(item.starts_at)), status: item.status,
        notes: item.notes ?? undefined, protocol: item.id, createdAt: item.created_at,
      }))),

    rescheduleAppointment: (id: string, date: string, time: string) => response(() =>
      clinic.rescheduleManagedAppointment(id, new Date(date + 'T' + time + ':00-03:00').toISOString())),
    cancelAppointment: (id: string) => response(() => clinic.cancel(id)),

    getSlotMatrix: (dentistId: string, date: string) => response<TimeSlot[]>(async () => {
      const period = range(date);
      const [windows, blocks, booked] = await Promise.all([
        clinic.schedule(dentistId, period), clinic.blockedSlots({ dentistId, ...period }), appointments(dentistId, date),
      ]);
      const slots: TimeSlot[] = [];
      for (const window of windows) {
        for (let start = +new Date(window.starts_at); start + 900000 <= +new Date(window.ends_at); start += 900000) {
          const end = start + 900000;
          if (start <= Date.now() || start < +new Date(period.from) || end > +new Date(period.to)) continue;
          const occupied = booked.some((item) => +new Date(item.starts_at) < end && +new Date(item.ends_at) > start);
          const blocked = blocks.some((item) => +new Date(item.starts_at) < end && +new Date(item.ends_at) > start);
          const time = clock.format(new Date(start));
          const hour = Number(time.slice(0, 2));
          slots.push({ id: new Date(start).toISOString(), time, available: !blocked && !occupied, occupied,
            period: hour < 12 ? 'manha' : hour < 18 ? 'tarde' : 'noite' });
        }
      }
      return slots;
    }),

    toggleSlotAvailability: (dentistId: string, date: string, time: string, available: boolean) => response(() => {
      const startsAt = new Date(date + 'T' + time + ':00-03:00');
      return clinic.setAvailability({ dentistId, startsAt: startsAt.toISOString(), endsAt: new Date(+startsAt + 900000).toISOString(), available });
    }),
  };
}
