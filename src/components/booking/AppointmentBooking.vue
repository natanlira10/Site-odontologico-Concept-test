<script setup lang="ts">
import { onMounted } from 'vue';
import { useBooking } from '@/composables/useBooking';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  FileCheck,
  MapPin
} from 'lucide-vue-next';

const {
  currentStep,
  isLoading,
  errorMessage,
  confirmation,
  treatments,
  doctors,
  availableSlots,
  selectedTreatmentId,
  selectedDoctorId,
  selectedDate,
  selectedTimeSlot,
  patientForm,
  currentUser,
  openLoginModal,
  selectedTreatment,
  selectedDoctor,
  isStep1Valid,
  isStep2Valid,
  isStep3Valid,
  loadInitialData,
  loadSlots,
  selectTreatment,
  goToStep,
  nextStep,
  prevStep,
  submitBooking,
  resetBooking,
} = useBooking();

onMounted(async () => {
  await loadInitialData();
});

const handleDateChange = async () => {
  await loadSlots();
};

const handleDoctorChange = async (doctorId: string) => {
  selectedDoctorId.value = doctorId;
  await loadSlots();
};
</script>

<template>
  <section id="agendamento" class="py-24 bg-pearl-50 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto space-y-4 mb-14">
        <div class="inline-flex items-center space-x-2 text-xs font-semibold tracking-widest text-gold-600 uppercase">
          <Sparkles class="w-3.5 h-3.5" />
          <span>Agendamento Inteligente & Conectado</span>
        </div>
        <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-navy-950 tracking-tight">
          Reserve sua sessão exclusiva com nossos especialistas
        </h2>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
          Selecione o procedimento, escolha o especialista e reserve seu horário com confirmação digital instantânea.
        </p>
      </div>

      <!-- Main Booking Container Card -->
      <div class="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
        <!-- Wizard Step Indicator Header (Only on steps 1-3) -->
        <div v-if="currentStep < 4" class="bg-navy-950 text-white p-6 sm:p-8 border-b border-gold-500/20">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div
                @click="goToStep(1)"
                class="flex items-center space-x-2 cursor-pointer transition-opacity"
                :class="currentStep === 1 ? 'opacity-100' : 'opacity-60 hover:opacity-90'"
              >
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  :class="currentStep >= 1 ? 'bg-gold-gradient text-navy-950' : 'bg-navy-800 text-pearl-300'"
                >
                  1
                </div>
                <span class="hidden sm:inline text-xs font-semibold uppercase tracking-wider">
                  Procedimento
                </span>
              </div>

              <div class="w-8 sm:w-12 h-px bg-white/20"></div>

              <div
                @click="goToStep(2)"
                class="flex items-center space-x-2 transition-opacity"
                :class="[
                  currentStep === 2 ? 'opacity-100' : 'opacity-60',
                  isStep1Valid ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed'
                ]"
              >
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  :class="currentStep >= 2 ? 'bg-gold-gradient text-navy-950' : 'bg-navy-800 text-pearl-300'"
                >
                  2
                </div>
                <span class="hidden sm:inline text-xs font-semibold uppercase tracking-wider">
                  Especialista & Horário
                </span>
              </div>

              <div class="w-8 sm:w-12 h-px bg-white/20"></div>

              <div
                @click="goToStep(3)"
                class="flex items-center space-x-2 transition-opacity"
                :class="[
                  currentStep === 3 ? 'opacity-100' : 'opacity-60',
                  isStep1Valid && isStep2Valid ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed'
                ]"
              >
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  :class="currentStep === 3 ? 'bg-gold-gradient text-navy-950' : 'bg-navy-800 text-pearl-300'"
                >
                  3
                </div>
                <span class="hidden sm:inline text-xs font-semibold uppercase tracking-wider">
                  Identificação
                </span>
              </div>
            </div>

            <!-- Security Badge -->
            <div class="hidden md:flex items-center space-x-1.5 text-xs text-gold-400">
              <ShieldCheck class="w-4 h-4" />
              <span>Conexão Segura SSL</span>
            </div>
          </div>
        </div>

        <!-- Wizard Body -->
        <div class="p-6 sm:p-10">
          <!-- Error banner -->
          <div
            v-if="errorMessage"
            class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-3"
          >
            <AlertCircle class="w-5 h-5 shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- STEP 1: Select Treatment -->
          <div v-if="currentStep === 1" class="space-y-6">
            <div class="space-y-1">
              <h3 class="font-serif text-2xl font-bold text-navy-950">
                1. Escolha o procedimento desejado
              </h3>
              <p class="text-xs sm:text-sm text-slate-500 font-light">
                Indique o foco do seu atendimento para direcionarmos aos especialistas adequados.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="treatment in treatments"
                :key="treatment.id"
                @click="selectTreatment(treatment.id)"
                :class="[
                  'p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-left relative flex flex-col justify-between',
                  selectedTreatmentId === treatment.id
                    ? 'border-gold-500 bg-gold-50/40 shadow-md ring-2 ring-gold-400/20'
                    : 'border-slate-200 hover:border-gold-400/60 bg-white'
                ]"
              >
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-gold-700 bg-gold-100/70 px-2 py-0.5 rounded-full">
                      {{ treatment.categoryLabel }}
                    </span>
                    <CheckCircle2
                      class="w-5 h-5 transition-colors"
                      :class="selectedTreatmentId === treatment.id ? 'text-gold-600' : 'text-slate-200'"
                    />
                  </div>

                  <h4 class="font-serif text-base font-bold text-navy-900">
                    {{ treatment.name }}
                  </h4>

                  <p class="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {{ treatment.shortDescription }}
                  </p>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span class="flex items-center space-x-1">
                    <Clock class="w-3.5 h-3.5 text-gold-600" />
                    <span>{{ treatment.duration }}</span>
                  </span>
                  <span class="font-semibold text-gold-700">
                    Desconforto: {{ treatment.discomfortLevel }}
                  </span>
                </div>
              </div>
            </div>

            <div class="pt-6 flex justify-end">
              <button
                @click="nextStep"
                :disabled="!isStep1Valid"
                class="px-8 py-3.5 rounded-full bg-gold-gradient hover:bg-gold-gradient-hover text-navy-950 font-bold uppercase tracking-wider text-xs shadow-luxury hover:shadow-luxury-hover flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Avançar para Especialistas</span>
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- STEP 2: Doctor, Date & Time -->
          <div v-else-if="currentStep === 2" class="space-y-8">
            <div class="space-y-1">
              <h3 class="font-serif text-2xl font-bold text-navy-950">
                2. Selecione o especialista, a data e o horário
              </h3>
              <p class="text-xs sm:text-sm text-slate-500 font-light">
                Procedimento selecionado: <strong class="text-gold-700">{{ selectedTreatment?.name }}</strong>
              </p>
            </div>

            <!-- Doctor Selector Cards -->
            <div class="space-y-3">
              <label class="block text-xs uppercase font-bold tracking-wider text-slate-600">
                Especialista Responsável:
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  v-for="doctor in doctors"
                  :key="doctor.id"
                  @click="handleDoctorChange(doctor.id)"
                  :class="[
                    'p-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center space-x-3',
                    selectedDoctorId === doctor.id
                      ? 'border-gold-500 bg-gold-50/50 shadow-sm ring-1 ring-gold-400'
                      : 'border-slate-200 hover:border-gold-300 bg-white'
                  ]"
                >
                  <img
                    :src="doctor.avatarUrl"
                    :alt="doctor.name"
                    class="w-10 h-10 rounded-full object-cover border border-gold-300 shrink-0"
                  />
                  <div class="min-w-0">
                    <p class="font-serif text-xs font-bold text-navy-900 truncate">
                      {{ doctor.name }}
                    </p>
                    <p class="text-[10px] text-gold-700 truncate">
                      {{ doctor.cro }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Date & Time Picker -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
              <!-- Date Input -->
              <div class="md:col-span-5 space-y-2">
                <label class="block text-xs uppercase font-bold tracking-wider text-slate-600">
                  Data da Sessão:
                </label>
                <div class="relative">
                  <input
                    type="date"
                    v-model="selectedDate"
                    @change="handleDateChange"
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/20 text-sm font-medium text-navy-900 bg-pearl-50 outline-none transition-all"
                  />
                </div>
                <p class="text-[11px] text-slate-400">
                  Atendimentos com agendamento prévio.
                </p>
              </div>

              <!-- Available Time Slots -->
              <div class="md:col-span-7 space-y-2">
                <label class="block text-xs uppercase font-bold tracking-wider text-slate-600">
                  Horários Disponíveis:
                </label>
                <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  <button
                    v-for="slot in availableSlots"
                    :key="slot.id"
                    type="button"
                    :disabled="!slot.available"
                    @click="selectedTimeSlot = slot.time"
                    :class="[
                      'py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center',
                      !slot.available
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                        : selectedTimeSlot === slot.time
                        ? 'bg-navy-950 text-gold-300 font-bold shadow-md ring-2 ring-gold-400'
                        : 'bg-white border border-slate-200 text-navy-900 hover:border-gold-400 hover:bg-gold-50/30'
                    ]"
                  >
                    {{ slot.time }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Step 2 Navigation Buttons -->
            <div class="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                @click="prevStep"
                class="px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <ChevronLeft class="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                @click="nextStep"
                :disabled="!isStep2Valid"
                class="px-8 py-3.5 rounded-full bg-gold-gradient hover:bg-gold-gradient-hover text-navy-950 font-bold uppercase tracking-wider text-xs shadow-luxury hover:shadow-luxury-hover flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Avançar para Identificação</span>
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- STEP 3: Patient Form & Submit to API -->
          <div v-else-if="currentStep === 3" class="space-y-8">
            <div class="space-y-1">
              <h3 class="font-serif text-2xl font-bold text-navy-950">
                3. Dados do Paciente & Confirmação
              </h3>
              <p class="text-xs sm:text-sm text-slate-500 font-light">
                Preencha as informações para emissão do protocolo seguro de agendamento.
              </p>
            </div>

            <!-- Summary pill -->
            <div class="bg-gold-50/70 border border-gold-300/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span class="text-slate-500">Procedimento:</span>
                <strong class="ml-1 text-navy-900">{{ selectedTreatment?.name }}</strong>
              </div>
              <div>
                <span class="text-slate-500">Especialista:</span>
                <strong class="ml-1 text-navy-900">{{ selectedDoctor?.name }}</strong>
              </div>
              <div>
                <span class="text-slate-500">Data & Hora:</span>
                <strong class="ml-1 text-gold-700">{{ selectedDate }} às {{ selectedTimeSlot }}</strong>
              </div>
            </div>

            <div v-if="!currentUser" class="space-y-4 text-center">
              <p class="text-sm text-slate-600">Entre ou crie sua conta para confirmar esta reserva.</p>
              <button type="button" @click="openLoginModal" class="px-8 py-3 rounded-full bg-gold-gradient text-navy-950 font-bold">
                Entrar para agendar
              </button>
            </div>
            <form v-else @submit.prevent="submitBooking" class="space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    v-model="patientForm.name"
                    readonly
                    required
                    placeholder="Ex: Dra. Mariana Vasconcelos"
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/20 text-sm text-navy-900 outline-none bg-pearl-50 transition-all"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    E-mail para Confirmação *
                  </label>
                  <input
                    type="email"
                    v-model="patientForm.email"
                    readonly
                    required
                    placeholder="mariana@exemplo.com"
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/20 text-sm text-navy-900 outline-none bg-pearl-50 transition-all"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    v-model="patientForm.phone"
                    required
                    placeholder="(11) 98888-7777"
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/20 text-sm text-navy-900 outline-none bg-pearl-50 transition-all"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    CPF (Opcional para ficha cadastral)
                  </label>
                  <input
                    type="text"
                    v-model="patientForm.cpf"
                    placeholder="000.000.000-00"
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/20 text-sm text-navy-900 outline-none bg-pearl-50 transition-all"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Observações ou Histórico Relevante
                </label>
                <textarea
                  v-model="patientForm.notes"
                  maxlength="2000"
                  rows="3"
                  placeholder="Informe se possui sensibilidade, bruxismo, receio de procedimentos ou histórico prévio..."
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/20 text-sm text-navy-900 outline-none bg-pearl-50 transition-all resize-none"
                ></textarea>
              </div>

              <div class="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="firstVisit"
                  v-model="patientForm.isFirstVisit"
                  class="rounded border-slate-300 text-gold-600 focus:ring-gold-500"
                />
                <label for="firstVisit" class="text-xs text-slate-600 cursor-pointer">
                  Esta será minha primeira consulta no Atelier Dental (inclui protocolo de boas-vindas).
                </label>
              </div>

              <!-- Step 3 Action Buttons -->
              <div class="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  @click="prevStep"
                  class="px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronLeft class="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                <button
                  type="submit"
                  :disabled="isLoading || !isStep3Valid"
                  class="px-10 py-4 rounded-full bg-gold-gradient hover:bg-gold-gradient-hover text-navy-950 font-bold uppercase tracking-wider text-xs shadow-luxury hover:shadow-luxury-hover flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
                  <Calendar v-else class="w-4 h-4" />
                  <span>{{ isLoading ? 'Confirmando...' : 'Confirmar agendamento' }}</span>
                </button>
              </div>
            </form>
          </div>

          <!-- STEP 4: Success Confirmation Screen -->
          <div v-else-if="currentStep === 4 && confirmation" class="py-8 text-center space-y-6">
            <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <FileCheck class="w-8 h-8" />
            </div>

            <div class="space-y-2">
              <span class="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Protocolo Gerado com Sucesso
              </span>
              <h3 class="font-serif text-3xl font-bold text-navy-950">
                Consulta Confirmada no Atelier Dental
              </h3>
              <p class="text-sm text-slate-500 max-w-md mx-auto font-light">
                Sua reserva foi registrada. Guarde o protocolo e os detalhes abaixo.
              </p>
            </div>

            <!-- Confirmation Voucher Card -->
            <div class="max-w-md mx-auto bg-pearl-100/70 border border-gold-400/40 rounded-2xl p-6 text-left space-y-4 shadow-sm">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <span class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Código do Protocolo</span>
                <span class="font-mono font-bold text-sm text-navy-950">{{ confirmation.protocol }}</span>
              </div>

              <div class="space-y-2 text-xs">
                <div class="flex justify-between">
                  <span class="text-slate-500">Paciente:</span>
                  <span class="font-bold text-navy-900">{{ confirmation.patientName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Procedimento:</span>
                  <span class="font-bold text-gold-700">{{ confirmation.treatmentName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Especialista:</span>
                  <span class="font-bold text-navy-900">{{ confirmation.doctorName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Data e Horário:</span>
                  <span class="font-bold text-navy-900">{{ confirmation.date }} às {{ confirmation.time }}</span>
                </div>
                <div class="flex items-start justify-between pt-2 border-t border-slate-200 text-slate-600">
                  <span class="flex items-center space-x-1 shrink-0">
                    <MapPin class="w-3.5 h-3.5 text-gold-600" />
                    <span>Local:</span>
                  </span>
                  <span class="text-right pl-3 text-[11px]">{{ confirmation.location }}</span>
                </div>
              </div>
            </div>

            <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                @click="resetBooking"
                class="px-8 py-3 rounded-full border border-gold-500 text-navy-950 font-semibold text-xs uppercase tracking-wider hover:bg-gold-50 transition-colors cursor-pointer"
              >
                Realizar Novo Agendamento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
