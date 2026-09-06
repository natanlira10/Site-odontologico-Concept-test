import { ref, computed, reactive, watch } from 'vue';
import type { Treatment, Doctor, TimeSlot, BookingConfirmation } from '@/types';
import { api } from '@/services/api';
import { useAuth } from './useAuth';

const currentStep = ref(1);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const confirmation = ref<BookingConfirmation | null>(null);
const treatments = ref<Treatment[]>([]);
const doctors = ref<Doctor[]>([]);
const availableSlots = ref<TimeSlot[]>([]);
const selectedTreatmentId = ref('');
const selectedDoctorId = ref('');
const selectedDate = ref(new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10));
const selectedTimeSlot = ref('');
const patientForm = reactive({ name: '', email: '', phone: '', cpf: '', notes: '', isFirstVisit: true });
let slotRequest = 0;
let lastAttempt: { payload: string; key: string } | undefined;

export function useBooking() {
  const { currentUser, openLoginModal } = useAuth();
  const selectedTreatment = computed(() => treatments.value.find((item) => item.id === selectedTreatmentId.value));
  const selectedDoctor = computed(() => doctors.value.find((item) => item.id === selectedDoctorId.value));
  const selectedSlot = computed(() => availableSlots.value.find((item) => item.time === selectedTimeSlot.value && item.available));
  const isStep1Valid = computed(() => !!selectedTreatment.value);
  const isStep2Valid = computed(() => !!selectedDoctor.value?.supportedTreatments.includes(selectedTreatmentId.value) && !!selectedSlot.value?.startsAt);
  const isStep3Valid = computed(() => !currentUser.value || patientForm.phone.trim().length >= 10);

  watch(currentUser, (user) => {
    patientForm.name = user?.name ?? '';
    patientForm.email = user?.email ?? '';
    patientForm.phone = user?.phone ?? '';
    patientForm.cpf = user?.cpf ?? '';
    lastAttempt = undefined;
  }, { immediate: true });

  const loadSlots = async () => {
    const requestId = ++slotRequest;
    const previousSelection = selectedTimeSlot.value;
    availableSlots.value = [];
    selectedTimeSlot.value = '';
    if (!selectedDoctorId.value || !selectedDate.value || !selectedTreatmentId.value) return;
    const result = await api.booking.getAvailableSlots(selectedDoctorId.value, selectedDate.value, selectedTreatmentId.value);
    if (requestId !== slotRequest) return;
    if (!result.success || !result.data) { errorMessage.value = result.message ?? 'Falha ao consultar horários.'; return; }
    availableSlots.value = result.data;
    selectedTimeSlot.value = result.data.find((slot) => slot.time === previousSelection)?.time ?? result.data[0]?.time ?? '';
    errorMessage.value = result.data.length ? null : 'Não há horários disponíveis nesta data.';
  };

  const loadInitialData = async () => {
    isLoading.value = true;
    try {
      const [treatmentResult, doctorResult] = await Promise.all([api.booking.getTreatments(), api.booking.getDoctors()]);
      if (!treatmentResult.success || !doctorResult.success) {
        errorMessage.value = treatmentResult.message ?? doctorResult.message ?? 'Não foi possível carregar a agenda.';
        return;
      }
      treatments.value = treatmentResult.data ?? [];
      doctors.value = doctorResult.data ?? [];
      selectedTreatmentId.value = treatments.value[0]?.id ?? '';
      selectedDoctorId.value = doctors.value.find((doctor) => doctor.supportedTreatments.includes(selectedTreatmentId.value))?.id ?? '';
      await loadSlots();
    } finally { isLoading.value = false; }
  };

  const selectTreatment = async (id: string) => {
    selectedTreatmentId.value = id;
    selectedDoctorId.value = doctors.value.find((doctor) => doctor.supportedTreatments.includes(id))?.id ?? '';
    await loadSlots();
  };
  const goToStep = (step: number) => {
    if (step === 2 && !isStep1Valid.value) return;
    if (step === 3 && (!isStep1Valid.value || !isStep2Valid.value)) return;
    currentStep.value = step;
  };
  const nextStep = () => goToStep(Math.min(currentStep.value + 1, 3));
  const prevStep = () => { currentStep.value = Math.max(1, currentStep.value - 1); };

  const submitBooking = async () => {
    if (isLoading.value) return;
    if (!currentUser.value) { openLoginModal(); return; }
    if (!isStep1Valid.value || !isStep2Valid.value || !isStep3Valid.value) return;
    const payload = {
      treatmentId: selectedTreatmentId.value, doctorId: selectedDoctorId.value,
      treatmentName: selectedTreatment.value!.name, doctorName: selectedDoctor.value!.name,
      startsAt: selectedSlot.value!.startsAt!, date: selectedDate.value, timeSlot: selectedTimeSlot.value,
      patientName: currentUser.value.name, patientEmail: currentUser.value.email,
      patientPhone: patientForm.phone, patientCpf: patientForm.cpf, notes: patientForm.notes, isFirstVisit: patientForm.isFirstVisit,
    };
    const serialized = JSON.stringify(payload);
    if (lastAttempt?.payload !== serialized) lastAttempt = { payload: serialized, key: crypto.randomUUID() };
    isLoading.value = true;
    errorMessage.value = null;
    try {
      const result = await api.booking.createAppointment(payload, lastAttempt!.key);
      if (result.success && result.data) { confirmation.value = result.data; currentStep.value = 4; }
      else {
        if (result.errorCode === '401') { currentUser.value = null; openLoginModal(); }
        if (result.errorCode === '409') { currentStep.value = 2; await loadSlots(); }
        errorMessage.value = result.message ?? 'Falha ao confirmar agendamento.';
      }
    } finally { isLoading.value = false; }
  };

  const resetBooking = async () => {
    currentStep.value = 1;
    confirmation.value = null;
    patientForm.notes = '';
    lastAttempt = undefined;
    await loadSlots();
  };

  return {
    currentStep, isLoading, errorMessage, confirmation, treatments, doctors, availableSlots,
    selectedTreatmentId, selectedDoctorId, selectedDate, selectedTimeSlot, patientForm, currentUser, openLoginModal,
    selectedTreatment, selectedDoctor, isStep1Valid, isStep2Valid, isStep3Valid,
    loadInitialData, loadSlots, selectTreatment, goToStep, nextStep, prevStep, submitBooking, resetBooking,
  };
}
