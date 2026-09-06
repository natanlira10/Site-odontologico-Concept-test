<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import {
  X,
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from 'lucide-vue-next';

const {
  isAuthModalOpen,
  activeTab,
  isLoading,
  statusMessage,
  closeAuthModal,
  setTab,
  login,
  register,
} = useAuth();

const showPassword = ref(false);

const loginForm = reactive({
  email: '',
  password: '',
});

const fillAdminCredentials = () => {
  loginForm.email = 'admin@clinica.local';
  loginForm.password = 'uRXV65YOtefn61fbUhHuY1RAWE3IRfKz';
};

const registerForm = reactive({
  fullName: '',
  email: '',
  cpf: '',
  phone: '',
  password: '',
});

const handleLoginSubmit = async () => {
  await login({
    email: loginForm.email,
    password: loginForm.password,
  });
};

const handleRegisterSubmit = async () => {
  await register({
    fullName: registerForm.fullName,
    email: registerForm.email,
    cpf: registerForm.cpf,
    phone: registerForm.phone,
    password: registerForm.password,
  });
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isAuthModalOpen.value) {
    closeAuthModal();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isAuthModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto"
      @click.self="closeAuthModal"
    >
      <div
        class="relative w-full max-w-md rounded-3xl bg-navy-900 border border-gold-500/30 p-8 shadow-2xl text-white transform transition-all"
      >
        <!-- Close Button -->
        <button
          @click="closeAuthModal"
          class="absolute top-5 right-5 p-2 rounded-full text-pearl-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Fechar modal"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Header -->
        <div class="text-center space-y-2 mb-6">
          <div class="w-10 h-10 rounded-xl bg-gold-gradient p-0.5 mx-auto shadow-glow-gold flex items-center justify-center">
            <Sparkles class="w-5 h-5 text-navy-950" />
          </div>
          <h3 class="font-serif text-2xl font-bold text-white tracking-wide">
            Portal do Paciente
          </h3>
          <p class="text-xs text-pearl-300 font-light">
            Entre na sua conta para reservar sua consulta.
          </p>
        </div>

        <!-- Tabs Selector -->
        <div class="flex rounded-xl bg-navy-950/80 p-1 border border-white/10 mb-6">
          <button
            type="button"
            @click="setTab('login')"
            class="flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all"
            :class="[
              activeTab === 'login'
                ? 'bg-gold-gradient text-navy-950 font-bold shadow-md'
                : 'text-pearl-300 hover:text-white'
            ]"
          >
            Acessar Conta
          </button>
          <button
            type="button"
            @click="setTab('register')"
            class="flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all"
            :class="[
              activeTab === 'register'
                ? 'bg-gold-gradient text-navy-950 font-bold shadow-md'
                : 'text-pearl-300 hover:text-white'
            ]"
          >
            Novo Cadastro
          </button>
        </div>

        <!-- Status / Feedback Banner -->
        <div
          v-if="statusMessage"
          class="mb-4 p-3 rounded-xl text-xs flex items-center space-x-2"
          :class="[
            statusMessage.type === 'success'
              ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/70 border border-rose-500/40 text-rose-200'
          ]"
        >
          <CheckCircle2 v-if="statusMessage.type === 'success'" class="w-4 h-4 text-emerald-400 shrink-0" />
          <AlertCircle v-else class="w-4 h-4 text-rose-400 shrink-0" />
          <span>{{ statusMessage.text }}</span>
        </div>

        <!-- LOGIN FORM -->
        <form
          v-if="activeTab === 'login'"
          @submit.prevent="handleLoginSubmit"
          class="space-y-4"
        >
          <div class="space-y-1 text-left">
            <label class="block text-xs uppercase font-bold tracking-wider text-pearl-300">
              E-mail
            </label>
            <div class="relative">
              <input
                type="email"
                v-model="loginForm.email"
                required
                placeholder="paciente@exemplo.com"
                class="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 text-sm text-white bg-navy-950/60 outline-none transition-all placeholder:text-slate-500"
              />
              <Mail class="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div class="space-y-1 text-left">
            <div class="flex items-center justify-between">
              <label class="block text-xs uppercase font-bold tracking-wider text-pearl-300">
                Senha
              </label>
            </div>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="loginForm.password"
                required
                placeholder="••••••••"
                class="w-full pl-10 pr-10 py-3 rounded-xl border border-white/10 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 text-sm text-white bg-navy-950/60 outline-none transition-all placeholder:text-slate-500"
              />
              <Lock class="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3.5 top-3.5 text-pearl-400 hover:text-white"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs pt-1">
            <span class="text-[11px] text-pearl-400">Ambiente local</span>
            <button
              type="button"
              @click="fillAdminCredentials"
              class="text-[11px] text-gold-400 hover:text-gold-300 underline cursor-pointer"
            >
              Preencher Administrador (Demo)
            </button>
          </div>

          <p class="text-xs text-pearl-300">Ao recarregar ou fechar esta aba, entre novamente.</p>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full mt-2 py-3.5 rounded-full bg-gold-gradient hover:bg-gold-gradient-hover text-navy-950 font-bold uppercase tracking-wider text-xs shadow-luxury hover:shadow-luxury-hover flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
          >
            <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
            <Lock v-else class="w-4 h-4" />
            <span>{{ isLoading ? 'Autenticando via API...' : 'Entrar no Portal' }}</span>
          </button>
        </form>

        <!-- REGISTER FORM -->
        <form
          v-else
          @submit.prevent="handleRegisterSubmit"
          class="space-y-4"
        >
          <div class="space-y-1 text-left">
            <label class="block text-xs uppercase font-bold tracking-wider text-pearl-300">
              Nome Completo *
            </label>
            <div class="relative">
              <input
                type="text"
                v-model="registerForm.fullName"
                required
                placeholder="Ex: Dra. Mariana Vasconcelos"
                class="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 text-sm text-white bg-navy-950/60 outline-none transition-all placeholder:text-slate-500"
              />
              <User class="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div class="space-y-1 text-left">
            <label class="block text-xs uppercase font-bold tracking-wider text-pearl-300">
              E-mail *
            </label>
            <div class="relative">
              <input
                type="email"
                v-model="registerForm.email"
                required
                placeholder="paciente@exemplo.com"
                class="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 text-sm text-white bg-navy-950/60 outline-none transition-all placeholder:text-slate-500"
              />
              <Mail class="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1 text-left">
              <label class="block text-xs uppercase font-bold tracking-wider text-pearl-300">
                CPF *
              </label>
              <div class="relative">
                <input
                  type="text"
                  v-model="registerForm.cpf"
                  required
                  placeholder="000.000.000-00"
                  class="w-full pl-9 pr-3 py-3 rounded-xl border border-white/10 focus:border-gold-400 text-xs text-white bg-navy-950/60 outline-none transition-all placeholder:text-slate-500"
                />
                <CreditCard class="w-3.5 h-3.5 text-gold-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div class="space-y-1 text-left">
              <label class="block text-xs uppercase font-bold tracking-wider text-pearl-300">
                WhatsApp *
              </label>
              <div class="relative">
                <input
                  type="tel"
                  v-model="registerForm.phone"
                  required
                  placeholder="(11) 98888-7777"
                  class="w-full pl-9 pr-3 py-3 rounded-xl border border-white/10 focus:border-gold-400 text-xs text-white bg-navy-950/60 outline-none transition-all placeholder:text-slate-500"
                />
                <Phone class="w-3.5 h-3.5 text-gold-400 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>

          <div class="space-y-1 text-left">
            <label class="block text-xs uppercase font-bold tracking-wider text-pearl-300">
              Criar Senha Segura *
            </label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="registerForm.password"
                required
                minlength="12"
                maxlength="128"
                placeholder="Mínimo 12 caracteres"
                class="w-full pl-10 pr-10 py-3 rounded-xl border border-white/10 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 text-sm text-white bg-navy-950/60 outline-none transition-all placeholder:text-slate-500"
              />
              <Lock class="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3.5 top-3.5 text-pearl-400 hover:text-white"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full mt-3 py-3.5 rounded-full bg-gold-gradient hover:bg-gold-gradient-hover text-navy-950 font-bold uppercase tracking-wider text-xs shadow-luxury hover:shadow-luxury-hover flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
          >
            <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
            <User v-else class="w-4 h-4" />
            <span>{{ isLoading ? 'Registrando na API...' : 'Concluir Cadastro & Conectar' }}</span>
          </button>
        </form>

        <!-- Footer Security Note -->
        <div class="mt-6 pt-4 border-t border-white/10 flex items-center justify-center space-x-2 text-[11px] text-pearl-400">
          <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
          <span>Dados protegidos pela LGPD com criptografia AES-256</span>
        </div>
      </div>
    </div>
  </transition>
</template>
