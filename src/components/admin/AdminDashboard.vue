<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdminDashboard } from '@/composables/useAdminDashboard';
import { useAuth } from '@/composables/useAuth';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Calendar,
  Clock,
  Phone,
  Sparkles,
  CalendarCheck,
  CalendarX,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  ToggleRight
} from 'lucide-vue-next';

const {
  isUnlocked,
  selectedDentistId,
  selectedDate,
  appointments,
  slots,
  doctors,
  toastMessage,
  rescheduleTarget,
  rescheduleForm,
  selectedDoctor,
  totalAppointments,
  confirmedCount,
  openSlotsCount,
  lock,
  setDentist,
  setDate,
  loadDashboardData,
  cancelAppointment,
  openRescheduleModal,
  closeRescheduleModal,
  confirmReschedule,
  toggleSlot,
} = useAdminDashboard();

const { currentUser, logout, openLoginModal } = useAuth();

const switchToAdminLogin = async () => {
  if (currentUser.value) {
    await logout();
  }
  openLoginModal();
};

const activeView = ref<'agenda' | 'grade'>('agenda');

onMounted(() => {
  if (isUnlocked.value) {
    loadDashboardData();
  }
});

const setQuickDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  setDate(d.toISOString().split('T')[0]);
};
</script>

<template>
  <section id="painel-clinico" class="py-24 bg-navy-950 text-white relative overflow-hidden border-t border-gold-500/20">
    <!-- Ambient gold background glow -->
    <div class="absolute top-1/3 -right-48 w-96 h-96 bg-gold-600/10 rounded-full blur-[140px] pointer-events-none"></div>
    <div class="absolute bottom-10 -left-48 w-96 h-96 bg-gold-400/10 rounded-full blur-[140px] pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto space-y-3 mb-12">
        <div class="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-widest">
          <ShieldCheck class="w-3.5 h-3.5 text-gold-400" />
          <span>Área Restrita & Governança Clínica</span>
        </div>
        <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
          Painel de Controle do Especialista
        </h2>
        <p class="text-xs sm:text-sm text-pearl-300 font-light max-w-xl mx-auto">
          Gestão centralizada de atendimentos, controle de cancelamentos, remarcações e liberação de grade horária em tempo real.
        </p>
      </div>

      <!-- Toast Feedback Floating Pill -->
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="toastMessage"
          class="fixed top-24 right-6 z-50 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center space-x-3 text-xs font-semibold max-w-sm"
          :class="toastMessage.type === 'error' ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' : 'bg-navy-900/90 border-gold-500/50 text-pearl-100 shadow-glow-gold'"
        >
          <AlertCircle v-if="toastMessage.type === 'error'" class="w-4 h-4 text-rose-400 shrink-0" />
          <CheckCircle2 v-else class="w-4 h-4 text-gold-400 shrink-0" />
          <span>{{ toastMessage.text }}</span>
        </div>
      </transition>

      <!-- 1. LOCKED STATE (Security Barrier) -->
      <div v-if="!isUnlocked" class="max-w-md mx-auto">
        <div class="bg-navy-900/90 border border-gold-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl text-center space-y-6">
          <div class="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/40 text-gold-400 flex items-center justify-center mx-auto shadow-glow-gold">
            <Lock class="w-7 h-7" />
          </div>

          <div class="space-y-2">
            <h3 class="font-serif text-2xl font-bold text-white">
              Acesso Seguro ao Consultório
            </h3>
            <p v-if="currentUser?.role === 'patient'" class="text-xs text-amber-300/90 font-light leading-relaxed">
              Você está conectado com conta de paciente (<strong class="font-semibold text-white">{{ currentUser.name }}</strong>). Esta área é exclusiva para o corpo clínico e administração.
            </p>
            <p v-else class="text-xs text-pearl-300 font-light leading-relaxed">
              Use sua conta de dentista ou administrador para gerenciar a agenda e os horários.
            </p>
          </div>

          <button
            type="button"
            @click="switchToAdminLogin"
            class="w-full py-3.5 rounded-xl bg-gold-gradient hover:bg-gold-gradient-hover text-navy-950 font-bold uppercase tracking-wider text-xs shadow-luxury hover:shadow-luxury-hover flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Unlock class="w-4 h-4" />
            <span>{{ currentUser?.role === 'patient' ? 'Trocar para Conta de Administrador' : 'Entrar com conta da clínica' }}</span>
          </button>

          <!-- Local dev credentials hint box -->
          <div class="p-4 rounded-2xl bg-navy-950/80 border border-gold-500/20 text-left space-y-1.5 text-xs">
            <p class="font-bold text-gold-400 flex items-center space-x-1.5 text-[11px] uppercase tracking-wider">
              <ShieldCheck class="w-3.5 h-3.5 text-gold-400" />
              <span>Credenciais da Clínica (Ambiente Local):</span>
            </p>
            <p class="text-pearl-200 text-[11px]">
              E-mail: <code class="text-gold-300 font-mono bg-white/5 px-1.5 py-0.5 rounded">admin@clinica.local</code>
            </p>
            <p class="text-pearl-200 text-[11px]">
              Senha: <code class="text-gold-300 font-mono bg-white/5 px-1.5 py-0.5 rounded">uRXV65YOtefn61fbUhHuY1RAWE3IRfKz</code>
            </p>
          </div>
        </div>
      </div>

      <!-- 2. UNLOCKED STATE (Full Luxury Dashboard) -->
      <div v-else class="space-y-8">
        <!-- Top Toolbar Card: Doctor Selector, Date & Lock -->
        <div class="bg-navy-900/80 border border-gold-500/20 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <!-- Active Clinician Profile Selector -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span class="text-xs font-bold uppercase tracking-wider text-gold-400">
              Especialista:
            </span>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="doc in doctors"
                :key="doc.id"
                @click="setDentist(doc.id)"
                :class="[
                  'px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2',
                  selectedDentistId === doc.id
                    ? 'bg-gold-gradient text-navy-950 font-bold shadow-md ring-1 ring-gold-400'
                    : 'bg-navy-950 text-pearl-300 border border-white/10 hover:border-gold-500/40 hover:text-white'
                ]"
              >
                <span>{{ doc.name.split(' ')[0] }} {{ doc.name.split(' ')[1] }}</span>
              </button>
            </div>
          </div>

          <!-- Date Selector & Shortcuts -->
          <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div class="flex items-center space-x-1 bg-navy-950 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <Calendar class="w-4 h-4 text-gold-400 shrink-0" />
              <input
                type="date"
                :value="selectedDate"
                @change="setDate(($event.target as HTMLInputElement).value)"
                class="bg-transparent text-pearl-100 font-medium outline-none cursor-pointer text-xs"
              />
            </div>

            <button
              @click="setQuickDate(0)"
              class="px-3 py-1.5 rounded-xl bg-navy-950 border border-white/10 hover:border-gold-400 text-xs text-pearl-200 transition-colors"
            >
              Hoje
            </button>
            <button
              @click="setQuickDate(1)"
              class="px-3 py-1.5 rounded-xl bg-navy-950 border border-white/10 hover:border-gold-400 text-xs text-pearl-200 transition-colors"
            >
              Amanhã
            </button>

            <!-- Lock Button -->
            <button
              @click="lock"
              class="ml-auto lg:ml-2 px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-950/40 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              title="Bloquear painel"
            >
              <Lock class="w-3.5 h-3.5" />
              <span>Bloquear</span>
            </button>
          </div>
        </div>

        <!-- Metric Strips -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-navy-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <div class="flex items-center justify-between text-xs text-pearl-400">
              <span>Atendimentos Agendados</span>
              <CalendarCheck class="w-4 h-4 text-gold-400" />
            </div>
            <p class="font-serif text-3xl font-bold text-white mt-2">
              {{ totalAppointments }}
            </p>
            <p class="text-[11px] text-pearl-400 mt-1">Para o dia {{ selectedDate }}</p>
          </div>

          <div class="bg-navy-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <div class="flex items-center justify-between text-xs text-pearl-400">
              <span>Sessões Confirmadas</span>
              <CheckCircle2 class="w-4 h-4 text-emerald-400" />
            </div>
            <p class="font-serif text-3xl font-bold text-emerald-400 mt-2">
              {{ confirmedCount }}
            </p>
            <p class="text-[11px] text-pearl-400 mt-1">Prontos para atendimento</p>
          </div>

          <div class="bg-navy-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <div class="flex items-center justify-between text-xs text-pearl-400">
              <span>Vagas Abertas Online</span>
              <Sparkles class="w-4 h-4 text-gold-400" />
            </div>
            <p class="font-serif text-3xl font-bold text-gold-300 mt-2">
              {{ openSlotsCount }} <span class="text-sm font-sans font-normal text-pearl-400">/ {{ slots.length }}</span>
            </p>
            <p class="text-[11px] text-pearl-400 mt-1">Disponíveis no agendamento público</p>
          </div>
        </div>

        <!-- Tab Controls -->
        <div class="flex items-center space-x-3 border-b border-white/10 pb-3">
          <button
            @click="activeView = 'agenda'"
            class="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-2"
            :class="[
              activeView === 'agenda'
                ? 'bg-gold-gradient text-navy-950 shadow-glow-gold'
                : 'bg-navy-900 text-pearl-300 hover:text-white border border-white/10'
            ]"
          >
            <Calendar class="w-4 h-4" />
            <span>1. Agenda de Consultas ({{ appointments.length }})</span>
          </button>

          <button
            @click="activeView = 'grade'"
            class="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-2"
            :class="[
              activeView === 'grade'
                ? 'bg-gold-gradient text-navy-950 shadow-glow-gold'
                : 'bg-navy-900 text-pearl-300 hover:text-white border border-white/10'
            ]"
          >
            <ToggleRight class="w-4 h-4" />
            <span>2. Gestão de Grade de Horários (Toggle Switches)</span>
          </button>
        </div>

        <!-- TAB 1: AGENDA DE CONSULTAS -->
        <div v-if="activeView === 'agenda'" class="space-y-4">
          <div v-if="appointments.length === 0" class="text-center py-16 bg-navy-900/40 border border-white/10 rounded-3xl p-8">
            <CalendarX class="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p class="text-pearl-300 text-sm font-medium">Nenhum atendimento agendado para esta data.</p>
            <p class="text-slate-500 text-xs mt-1">Selecione outra data ou verifique a grade de horários.</p>
          </div>

          <div v-else class="grid grid-cols-1 gap-4">
            <div
              v-for="apt in appointments"
              :key="apt.id"
              class="bg-navy-900/90 border rounded-2xl p-5 sm:p-6 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
              :class="[
                apt.status === 'cancelled'
                  ? 'border-rose-500/30 opacity-60 bg-navy-950/80'
                  : apt.status === 'rescheduled'
                  ? 'border-amber-500/40 bg-navy-900/90'
                  : 'border-gold-500/20 hover:border-gold-500/40'
              ]"
            >
              <!-- Left Details -->
              <div class="flex items-start space-x-4">
                <!-- Time Box -->
                <div class="w-16 h-16 rounded-xl bg-navy-950 border border-gold-500/30 flex flex-col items-center justify-center shrink-0">
                  <Clock class="w-4 h-4 text-gold-400 mb-0.5" />
                  <span class="font-mono text-sm font-bold text-white">{{ apt.time }}</span>
                </div>

                <div class="space-y-1.5">
                  <div class="flex items-center space-x-2.5">
                    <h4
                      class="font-serif text-lg font-bold text-white"
                      :class="apt.status === 'cancelled' ? 'line-through text-slate-400' : ''"
                    >
                      {{ apt.patientName }}
                    </h4>
                    <!-- Status Badge -->
                    <span
                      class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                      :class="[
                        apt.status === 'confirmed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : apt.status === 'rescheduled'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      ]"
                    >
                      {{ apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'rescheduled' ? 'Remarcado' : 'Cancelado' }}
                    </span>
                  </div>

                  <p class="text-xs text-gold-300 font-medium">
                    {{ apt.treatmentName }}
                  </p>

                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-pearl-400">
                    <span class="flex items-center space-x-1">
                      <Phone class="w-3.5 h-3.5 text-gold-400" />
                      <span>{{ apt.patientPhone }}</span>
                    </span>
                    <span class="font-mono text-[11px] text-slate-400">
                      Prot: {{ apt.protocol }}
                    </span>
                  </div>

                  <p v-if="apt.notes" class="text-xs text-slate-400 italic pt-1 font-light">
                    "{{ apt.notes }}"
                  </p>
                </div>
              </div>

              <!-- Right Actions: Reschedule & Cancel -->
              <div class="flex items-center space-x-2.5 self-end md:self-center shrink-0">
                <button
                  v-if="apt.status !== 'cancelled'"
                  @click="openRescheduleModal(apt)"
                  class="px-4 py-2 rounded-xl bg-navy-950 border border-gold-500/40 hover:bg-gold-500 hover:text-navy-950 text-gold-300 text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw class="w-3.5 h-3.5" />
                  <span>Remarcar</span>
                </button>

                <button
                  v-if="apt.status !== 'cancelled'"
                  @click="cancelAppointment(apt.id)"
                  class="px-4 py-2 rounded-xl border border-rose-500/40 hover:bg-rose-950/60 text-rose-300 text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <X class="w-3.5 h-3.5" />
                  <span>Cancelar</span>
                </button>

                <span v-else class="text-xs text-rose-400 font-semibold italic">
                  Atendimento Cancelado
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: GESTÃO DE GRADE DE HORÁRIOS (Toggle Switch Interface) -->
        <div v-else-if="activeView === 'grade'" class="space-y-6">
          <div class="bg-navy-900/60 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
            <div class="space-y-1">
              <h4 class="font-serif text-base font-bold text-white">
                Controle de Vagas para {{ selectedDoctor?.name }}
              </h4>
              <p class="text-xs text-pearl-300 font-light">
                Alterne as chaves para liberar ou bloquear horários específicos na agenda pública do dia {{ selectedDate }}.
              </p>
            </div>
            <div class="hidden sm:flex items-center space-x-2 text-xs text-gold-400">
              <Sparkles class="w-4 h-4" />
              <span>Sincronização Ativa</span>
            </div>
          </div>

          <!-- Slots grouped into periods -->
          <div class="space-y-6">
            <!-- Period 1: Manhã -->
            <div class="bg-navy-900/90 border border-gold-500/20 rounded-3xl p-6 shadow-md space-y-4">
              <div class="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gold-400 border-b border-white/10 pb-3">
                <Clock class="w-4 h-4" />
                <span>Turno da Manhã (08:00 às 11:30)</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  v-for="slot in slots.filter(s => s.period === 'manha')"
                  :key="slot.time"
                  class="bg-navy-950 p-4 rounded-2xl border transition-all flex items-center justify-between"
                  :class="slot.available ? 'border-gold-500/30 shadow-sm' : 'border-white/5 opacity-50'"
                >
                  <div>
                    <span class="font-mono text-base font-bold text-white block">
                      {{ slot.time }}
                    </span>
                    <span
                      class="text-[10px] font-semibold block"
                      :class="slot.available ? 'text-emerald-400' : 'text-slate-500'"
                    >
                      {{ slot.occupied ? 'Ocupado' : slot.available ? 'Vaga Liberada' : 'Bloqueado' }}
                    </span>
                  </div>

                  <!-- Toggle Switch Button -->
                  <button
                    type="button"
                    @click="toggleSlot(slot.time, slot.available)"
                    :disabled="slot.occupied"
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                    :class="slot.available ? 'bg-gold-500 shadow-glow-gold' : 'bg-slate-700'"
                    :aria-label="`Alternar vaga de ${slot.time}`"
                  >
                    <span
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                      :class="slot.available ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </div>
              </div>
            </div>

            <!-- Period 2: Tarde -->
            <div class="bg-navy-900/90 border border-gold-500/20 rounded-3xl p-6 shadow-md space-y-4">
              <div class="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gold-400 border-b border-white/10 pb-3">
                <Clock class="w-4 h-4" />
                <span>Turno da Tarde (14:00 às 17:30)</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  v-for="slot in slots.filter(s => s.period === 'tarde')"
                  :key="slot.time"
                  class="bg-navy-950 p-4 rounded-2xl border transition-all flex items-center justify-between"
                  :class="slot.available ? 'border-gold-500/30 shadow-sm' : 'border-white/5 opacity-50'"
                >
                  <div>
                    <span class="font-mono text-base font-bold text-white block">
                      {{ slot.time }}
                    </span>
                    <span
                      class="text-[10px] font-semibold block"
                      :class="slot.available ? 'text-emerald-400' : 'text-slate-500'"
                    >
                      {{ slot.occupied ? 'Ocupado' : slot.available ? 'Vaga Liberada' : 'Bloqueado' }}
                    </span>
                  </div>

                  <!-- Toggle Switch Button -->
                  <button
                    type="button"
                    @click="toggleSlot(slot.time, slot.available)"
                    :disabled="slot.occupied"
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                    :class="slot.available ? 'bg-gold-500 shadow-glow-gold' : 'bg-slate-700'"
                    :aria-label="`Alternar vaga de ${slot.time}`"
                  >
                    <span
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                      :class="slot.available ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </div>
              </div>
            </div>

            <!-- Period 3: Noite -->
            <div class="bg-navy-900/90 border border-gold-500/20 rounded-3xl p-6 shadow-md space-y-4">
              <div class="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gold-400 border-b border-white/10 pb-3">
                <Clock class="w-4 h-4" />
                <span>Turno da Noite (18:00 às 18:30 - VIP)</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  v-for="slot in slots.filter(s => s.period === 'noite')"
                  :key="slot.time"
                  class="bg-navy-950 p-4 rounded-2xl border transition-all flex items-center justify-between"
                  :class="slot.available ? 'border-gold-500/30 shadow-sm' : 'border-white/5 opacity-50'"
                >
                  <div>
                    <span class="font-mono text-base font-bold text-white block">
                      {{ slot.time }}
                    </span>
                    <span
                      class="text-[10px] font-semibold block"
                      :class="slot.available ? 'text-emerald-400' : 'text-slate-500'"
                    >
                      {{ slot.occupied ? 'Ocupado' : slot.available ? 'Vaga Liberada' : 'Bloqueado' }}
                    </span>
                  </div>

                  <!-- Toggle Switch Button -->
                  <button
                    type="button"
                    @click="toggleSlot(slot.time, slot.available)"
                    :disabled="slot.occupied"
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                    :class="slot.available ? 'bg-gold-500 shadow-glow-gold' : 'bg-slate-700'"
                    :aria-label="`Alternar vaga de ${slot.time}`"
                  >
                    <span
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                      :class="slot.available ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RESCHEDULE MODAL -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="rescheduleTarget"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md"
        @click.self="closeRescheduleModal"
      >
        <div class="relative w-full max-w-md rounded-3xl bg-navy-900 border border-gold-500/30 p-8 shadow-2xl text-white">
          <button
            @click="closeRescheduleModal"
            class="absolute top-5 right-5 p-2 rounded-full text-pearl-400 hover:text-white transition-colors"
          >
            <X class="w-5 h-5" />
          </button>

          <div class="space-y-1.5 mb-6 text-left">
            <span class="text-xs font-bold uppercase tracking-wider text-gold-400">
              Remarcação de Consulta
            </span>
            <h3 class="font-serif text-2xl font-bold text-white">
              {{ rescheduleTarget.patientName }}
            </h3>
            <p class="text-xs text-pearl-300">
              Procedimento: {{ rescheduleTarget.treatmentName }}
            </p>
          </div>

          <form @submit.prevent="confirmReschedule" class="space-y-4 text-left">
            <div class="space-y-1">
              <label class="block text-xs uppercase font-bold tracking-wider text-pearl-300">
                Nova Data:
              </label>
              <input
                type="date"
                v-model="rescheduleForm.newDate"
                required
                class="w-full px-4 py-3 rounded-xl border border-white/10 bg-navy-950 text-white text-sm outline-none focus:border-gold-400 transition-all"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-xs uppercase font-bold tracking-wider text-pearl-300">
                Novo Horário:
              </label>
              <select
                v-model="rescheduleForm.newTime"
                required
                class="w-full px-4 py-3 rounded-xl border border-white/10 bg-navy-950 text-white text-sm outline-none focus:border-gold-400 transition-all cursor-pointer"
              >
                <option value="08:30">08:30</option>
                <option value="09:00">09:00</option>
                <option value="09:30">09:30</option>
                <option value="10:30">10:30</option>
                <option value="11:30">11:30</option>
                <option value="14:00">14:00</option>
                <option value="14:30">14:30</option>
                <option value="15:30">15:30</option>
                <option value="16:00">16:00</option>
                <option value="17:00">17:00</option>
                <option value="18:00">18:00</option>
              </select>
            </div>

            <div class="pt-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                @click="closeRescheduleModal"
                class="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-pearl-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-6 py-2.5 rounded-xl bg-gold-gradient hover:bg-gold-gradient-hover text-navy-950 text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Confirmar Remarcação
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </section>
</template>
