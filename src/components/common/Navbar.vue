<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import {
  User,
  Calendar,
  Menu,
  X,
  Sparkles,
  LogOut,
  ChevronDown
} from 'lucide-vue-next';

const { currentUser, openLoginModal, logout } = useAuth();

const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const isUserDropdownOpen = ref(false);

const navLinks = [
  { label: 'Tratamentos', href: '#tratamentos' },
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Antes & Depois', href: '#resultados' },
  { label: 'Especialistas', href: '#especialistas' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Painel Clínico', href: '#painel-clinico' },
];

const handleScroll = () => {
  isScrolled.value = window.scrollY > 40;
};

const scrollToSection = (href: string) => {
  isMobileMenuOpen.value = false;
  const element = document.querySelector(href);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out',
      isScrolled
        ? 'bg-navy-950/85 backdrop-blur-xl border-b border-gold-500/20 py-3 shadow-2xl'
        : 'bg-gradient-to-b from-navy-950/80 to-transparent py-5'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <a
          href="#"
          class="group flex items-center space-x-3 text-left focus:outline-none"
        >
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 p-0.5 shadow-glow-gold transition-transform duration-300 group-hover:scale-105"
          >
            <div class="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
              <Sparkles class="w-5 h-5 text-gold-400 animate-pulse-subtle" />
            </div>
          </div>
          <div>
            <span class="block font-serif text-xl tracking-wider font-bold text-white uppercase group-hover:text-gold-300 transition-colors">
              Atelier Dental
            </span>
            <span class="block text-[10px] tracking-[0.25em] text-gold-400/90 font-sans uppercase">
              Haute Odontologie
            </span>
          </div>
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center space-x-8">
          <button
            v-for="link in navLinks"
            :key="link.href"
            @click="scrollToSection(link.href)"
            class="text-sm tracking-wide text-pearl-200 hover:text-gold-300 transition-colors duration-200 font-medium cursor-pointer relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gold-400 hover:after:w-full after:transition-all after:duration-300"
          >
            {{ link.label }}
          </button>
        </nav>

        <!-- Right Side CTAs & Auth -->
        <div class="hidden sm:flex items-center space-x-4">
          <!-- Patient Portal Button -->
          <div v-if="currentUser" class="relative">
            <button
              @click="isUserDropdownOpen = !isUserDropdownOpen"
              class="flex items-center space-x-2 px-3 py-2 rounded-full border border-gold-500/40 bg-navy-900/60 text-gold-300 hover:bg-navy-900 hover:border-gold-400 text-xs font-semibold tracking-wider transition-all"
            >
              <User class="w-4 h-4 text-gold-400" />
              <span>{{ currentUser.name }}</span>
              <ChevronDown class="w-3 h-3 text-gold-400" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="isUserDropdownOpen"
              class="absolute right-0 mt-2 w-48 rounded-xl bg-navy-900 border border-gold-500/30 p-2 shadow-2xl z-50"
            >
              <div class="px-3 py-2 border-b border-navy-700 text-xs text-pearl-300">
                Prontuário Ativo
              </div>
              <button
                @click="logout(); isUserDropdownOpen = false"
                class="w-full mt-1 flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-rose-300 hover:bg-navy-800 transition-colors"
              >
                <LogOut class="w-3.5 h-3.5" />
                <span>Encerrar Sessão</span>
              </button>
            </div>
          </div>

          <button
            v-else
            @click="openLoginModal"
            class="flex items-center space-x-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-gold-400/60 text-pearl-100 hover:text-gold-200 text-xs tracking-wider uppercase font-semibold transition-all duration-300 cursor-pointer"
          >
            <User class="w-3.5 h-3.5 text-gold-400" />
            <span>Portal do Paciente</span>
          </button>

          <!-- Appointment Booking Button -->
          <button
            @click="scrollToSection('#agendamento')"
            class="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gold-gradient hover:bg-gold-gradient-hover text-navy-950 text-xs uppercase tracking-widest font-bold shadow-luxury hover:shadow-luxury-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <Calendar class="w-4 h-4" />
            <span>Agendar Consulta</span>
          </button>
        </div>

        <!-- Mobile Menu Hamburger -->
        <div class="flex items-center space-x-3 lg:hidden">
          <button
            @click="openLoginModal"
            class="sm:hidden p-2 rounded-lg border border-gold-500/30 text-gold-300 hover:bg-white/5"
            aria-label="Portal do Paciente"
          >
            <User class="w-4 h-4" />
          </button>

          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="p-2 rounded-lg border border-white/15 text-pearl-200 hover:text-gold-300 hover:border-gold-400 focus:outline-none transition-colors"
            aria-label="Abrir menu"
          >
            <component :is="isMobileMenuOpen ? X : Menu" class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Drawer / Menu -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-if="isMobileMenuOpen"
        class="lg:hidden bg-navy-950/95 backdrop-blur-2xl border-b border-gold-500/20 px-6 pt-4 pb-6 mt-3 space-y-4 shadow-2xl"
      >
        <div class="flex flex-col space-y-3">
          <button
            v-for="link in navLinks"
            :key="link.href"
            @click="scrollToSection(link.href)"
            class="text-left text-base font-medium text-pearl-200 hover:text-gold-300 py-2 border-b border-white/5"
          >
            {{ link.label }}
          </button>
        </div>

        <div class="pt-2 flex flex-col space-y-3">
          <button
            v-if="!currentUser"
            @click="openLoginModal(); isMobileMenuOpen = false"
            class="w-full flex items-center justify-center space-x-2 py-3 rounded-xl border border-gold-500/30 text-gold-300 bg-navy-900/60 font-semibold text-sm"
          >
            <User class="w-4 h-4" />
            <span>Acessar Portal do Paciente</span>
          </button>
          <button
            v-else
            @click="logout(); isMobileMenuOpen = false"
            class="w-full flex items-center justify-center space-x-2 py-3 rounded-xl border border-rose-500/30 text-rose-300 bg-navy-900/60 font-semibold text-sm"
          >
            <LogOut class="w-4 h-4" />
            <span>Sair da conta ({{ currentUser.name }})</span>
          </button>

          <button
            @click="scrollToSection('#agendamento')"
            class="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-gold-gradient text-navy-950 font-bold uppercase tracking-wider text-sm shadow-luxury"
          >
            <Calendar class="w-4 h-4" />
            <span>Agendar Consulta</span>
          </button>
        </div>
      </div>
    </transition>
  </header>
</template>
