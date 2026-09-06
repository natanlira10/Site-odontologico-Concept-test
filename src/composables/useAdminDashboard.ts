import { ref, reactive, computed, watch } from 'vue';
import type { AdminAppointment, Doctor, TimeSlot, ApiResponse } from '@/types';
import { api } from '@/services/api';
import { useAuth } from './useAuth';

const panelLocked = ref(false);
const selectedDentistId = ref('');
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const appointments = ref<AdminAppointment[]>([]);
const slots = ref<TimeSlot[]>([]);
const doctors = ref<Doctor[]>([]);
const isLoading = ref(false);
const isSavingSlot = ref<string | null>(null);
const toastMessage = ref<{ text: string; type: 'success' | 'error' } | null>(null);
const rescheduleTarget = ref<AdminAppointment | null>(null);
const rescheduleForm = reactive({ newDate: '', newTime: '' });
let requestSequence = 0;

export function useAdminDashboard() {
  const { currentUser, openLoginModal } = useAuth();
  const isUnlocked = computed(() => !panelLocked.value && (
    currentUser.value?.role === 'admin' || (currentUser.value?.role === 'dentist' && !!currentUser.value.dentistId)
  ));
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    toastMessage.value = { text, type };
  };
  const clear = () => { appointments.value = []; slots.value = []; rescheduleTarget.value = null; };
  const unwrap = <T>(result: ApiResponse<T>): T => {
    if (!result.success) {
      if (result.errorCode === '401' || result.errorCode === '403') { panelLocked.value = true; clear(); }
      throw new Error(result.message ?? 'Não foi possível concluir a operação.');
    }
    return result.data as T;
  };

  const loadDashboardData = async () => {
    if (!isUnlocked.value) { clear(); return; }
    const sequence = ++requestSequence;
    const user = currentUser.value!;
    isLoading.value = true;
    try {
      const allDoctors = unwrap(await api.booking.getDoctors());
      if (sequence !== requestSequence || !isUnlocked.value || currentUser.value?.id !== user.id) return;
      doctors.value = allDoctors.filter((doctor) => user.role === 'admin' || doctor.id === user.dentistId);
      if (!doctors.value.some((doctor) => doctor.id === selectedDentistId.value)) {
        selectedDentistId.value = doctors.value[0]?.id ?? '';
      }
      if (!selectedDentistId.value) { clear(); return; }
      const [appointmentResult, slotResult] = await Promise.all([
        api.admin.getAppointments(selectedDentistId.value, selectedDate.value),
        api.admin.getSlotMatrix(selectedDentistId.value, selectedDate.value),
      ]);
      if (sequence !== requestSequence || !isUnlocked.value || currentUser.value?.id !== user.id) return;
      appointments.value = unwrap(appointmentResult);
      slots.value = unwrap(slotResult);
    } catch (error) {
      if (sequence === requestSequence) { clear(); showToast(error instanceof Error ? error.message : 'Erro ao carregar agenda.', 'error'); }
    } finally { if (sequence === requestSequence) isLoading.value = false; }
  };

  const unlock = async () => {
    panelLocked.value = false;
    if (!isUnlocked.value) { openLoginModal(); return; }
    await loadDashboardData();
  };
  const lock = () => { panelLocked.value = true; requestSequence++; clear(); };
  watch(currentUser, () => {
    requestSequence++;
    clear();
    doctors.value = [];
    selectedDentistId.value = currentUser.value?.dentistId ?? '';
    panelLocked.value = false;
    if (isUnlocked.value) void loadDashboardData();
  });

  const setDentist = (id: string) => {
    if (!doctors.value.some((doctor) => doctor.id === id)) return;
    selectedDentistId.value = id;
    void loadDashboardData();
  };
  const setDate = (date: string) => { selectedDate.value = date; void loadDashboardData(); };
  const cancelAppointment = async (id: string) => {
    if (!isUnlocked.value || isLoading.value) return;
    isLoading.value = true;
    try {
      unwrap(await api.admin.cancelAppointment(id));
      await loadDashboardData();
      showToast('Consulta cancelada.');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Erro ao cancelar.', 'error'); }
    finally { isLoading.value = false; }
  };
  const openRescheduleModal = (appointment: AdminAppointment) => {
    rescheduleTarget.value = appointment;
    rescheduleForm.newDate = appointment.date;
    rescheduleForm.newTime = appointment.time;
  };
  const closeRescheduleModal = () => { rescheduleTarget.value = null; };
  const confirmReschedule = async () => {
    if (!isUnlocked.value || !rescheduleTarget.value || isLoading.value) return;
    isLoading.value = true;
    try {
      unwrap(await api.admin.rescheduleAppointment(rescheduleTarget.value.id, rescheduleForm.newDate, rescheduleForm.newTime));
      closeRescheduleModal();
      await loadDashboardData();
      showToast('Consulta reagendada.');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Erro ao reagendar.', 'error'); }
    finally { isLoading.value = false; }
  };
  const toggleSlot = async (time: string, available: boolean) => {
    if (!isUnlocked.value || isSavingSlot.value || slots.value.find((slot) => slot.time === time)?.occupied) return;
    isSavingSlot.value = time;
    try {
      unwrap(await api.admin.toggleSlotAvailability(selectedDentistId.value, selectedDate.value, time, !available));
      await loadDashboardData();
      showToast(available ? 'Horário bloqueado.' : 'Horário reaberto.');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Erro ao alterar horário.', 'error'); }
    finally { isSavingSlot.value = null; }
  };

  return {
    isUnlocked, selectedDentistId, selectedDate, appointments, slots, doctors, isLoading, isSavingSlot, toastMessage,
    rescheduleTarget, rescheduleForm,
    selectedDoctor: computed(() => doctors.value.find((doctor) => doctor.id === selectedDentistId.value)),
    totalAppointments: computed(() => appointments.value.length),
    confirmedCount: computed(() => appointments.value.filter((appointment) => appointment.status === 'confirmed').length),
    openSlotsCount: computed(() => slots.value.filter((slot) => slot.available).length),
    unlock, lock, setDentist, setDate, loadDashboardData, cancelAppointment, openRescheduleModal, closeRescheduleModal, confirmReschedule, toggleSlot,
  };
}
