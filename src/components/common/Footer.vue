<script setup lang="ts">
import { Sparkles, MapPin, Phone, Mail, Clock, ShieldCheck, Award } from 'lucide-vue-next';

const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="bg-navy-950 border-t border-gold-500/20 text-pearl-200 relative overflow-hidden pt-20 pb-12">
    <!-- Subtle luxury glow backdrop -->
    <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/5 blur-[120px] rounded-full pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10">
        <!-- Col 1: Brand & Credo -->
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-gold-gradient p-0.5 shadow-glow-gold">
              <div class="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Sparkles class="w-4 h-4 text-gold-400" />
              </div>
            </div>
            <div>
              <span class="block font-serif text-lg font-bold tracking-wider text-white uppercase">
                Atelier Dental
              </span>
              <span class="block text-[9px] tracking-[0.25em] text-gold-400 font-sans uppercase">
                Haute Odontologie
              </span>
            </div>
          </div>
          <p class="text-xs leading-relaxed text-pearl-300">
            A convergência entre a ciência biomimética, inteligência artificial diagnóstica e a arte da estética do sorriso. Atendimento exclusivo em ambiente privativo.
          </p>
          <div class="flex items-center space-x-4 pt-2">
            <div class="flex items-center space-x-1.5 text-xs text-gold-400">
              <Award class="w-4 h-4" />
              <span>Straumann Diamond Clinic</span>
            </div>
            <div class="flex items-center space-x-1.5 text-xs text-pearl-300">
              <ShieldCheck class="w-4 h-4 text-emerald-400" />
              <span>Biossegurança Nível 4</span>
            </div>
          </div>
        </div>

        <!-- Col 2: Navigation -->
        <div class="space-y-4">
          <h4 class="font-serif text-sm tracking-wider uppercase text-gold-300 font-semibold">
            Tratamentos de Assinatura
          </h4>
          <ul class="space-y-2.5 text-xs">
            <li>
              <a href="#tratamentos" class="hover:text-gold-300 transition-colors">
                Lentes em Porcelana Feldspática
              </a>
            </li>
            <li>
              <a href="#tratamentos" class="hover:text-gold-300 transition-colors">
                Alinhadores Invisíveis SmartTrack
              </a>
            </li>
            <li>
              <a href="#tratamentos" class="hover:text-gold-300 transition-colors">
                Cirurgia Guiada por Tomografia 3D
              </a>
            </li>
            <li>
              <a href="#tratamentos" class="hover:text-gold-300 transition-colors">
                Clareamento Laser Fotoativado
              </a>
            </li>
            <li>
              <a href="#tratamentos" class="hover:text-gold-300 transition-colors">
                Reabilitação Oral Biomimética
              </a>
            </li>
          </ul>
        </div>

        <!-- Col 3: Hours & Facility -->
        <div class="space-y-4">
          <h4 class="font-serif text-sm tracking-wider uppercase text-gold-300 font-semibold">
            Concierge & Horários
          </h4>
          <div class="space-y-3 text-xs text-pearl-300">
            <div class="flex items-start space-x-2.5">
              <Clock class="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
              <div>
                <p class="font-medium text-white">Segunda a Sexta-feira</p>
                <p>08:00 às 20:00 (Sessões com hora marcada)</p>
              </div>
            </div>
            <div class="flex items-start space-x-2.5">
              <Clock class="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
              <div>
                <p class="font-medium text-white">Sábados (Exclusivo VIP)</p>
                <p>08:30 às 13:30 (Tratamentos de assinatura)</p>
              </div>
            </div>
            <p class="text-[11px] text-pearl-400 pt-1">
              * Estacionamento privativo com serviço de manobrista no subsolo.
            </p>
          </div>
        </div>

        <!-- Col 4: Location & Contact -->
        <div class="space-y-4">
          <h4 class="font-serif text-sm tracking-wider uppercase text-gold-300 font-semibold">
            Unidade Jardins
          </h4>
          <div class="space-y-3 text-xs text-pearl-300">
            <div class="flex items-start space-x-2.5">
              <MapPin class="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
              <span>Av. Brigadeiro Faria Lima, 3477 - 14º andar<br>Itaim Bibi / Jardins - São Paulo, SP</span>
            </div>
            <div class="flex items-center space-x-2.5">
              <Phone class="w-4 h-4 text-gold-400 shrink-0" />
              <span>+55 (11) 3892-8000</span>
            </div>
            <div class="flex items-center space-x-2.5">
              <Mail class="w-4 h-4 text-gold-400 shrink-0" />
              <span>concierge@atelierdental.com.br</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-pearl-400 space-y-4 md:space-y-0">
        <div>
          © {{ currentYear }} Atelier Dental Clínicas Especializadas Ltda. Todos os direitos reservados.
        </div>
        <div class="flex items-center space-x-6">
          <span>Resp. Técnico: Dr. Alexandre Valença - CRO/SP 92.418</span>
          <span class="text-white/20">|</span>
          <a href="#" class="hover:text-gold-300 transition-colors">Termos de Privacidade</a>
          <span class="text-white/20">|</span>
          <a href="#" class="hover:text-gold-300 transition-colors">Código de Ética CFO</a>
        </div>
      </div>
    </div>
  </footer>
</template>
