<script setup lang="ts">
import { Calendar, ChevronRight, ShieldCheck, Sparkles, Star, Award } from 'lucide-vue-next';

const scrollTo = (selector: string) => {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};
</script>

<template>
  <section class="relative min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden bg-navy-950">
    <!-- Ambient Lighting & Glow -->
    <div class="absolute top-1/4 -left-48 w-96 h-96 bg-gold-600/10 rounded-full blur-[140px] pointer-events-none"></div>
    <div class="absolute bottom-10 right-0 w-[500px] h-[500px] bg-gold-400/10 rounded-full blur-[160px] pointer-events-none"></div>

    <!-- Geometric architectural lines (SVG subtle grid) -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <!-- Left Column: Copy & CTAs -->
        <div class="lg:col-span-7 text-center lg:text-left space-y-8">
          <!-- Prestige Pill Badge -->
          <div class="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
            <Sparkles class="w-3.5 h-3.5 text-gold-400" />
            <span>Odontologia de Alta Precisão & Arte Estética</span>
          </div>

          <!-- Hero Headline -->
          <h1 class="font-serif text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Onde a ciência médica encontra a
            <span class="block text-gold-gradient italic font-normal">
              harmonia do seu sorriso
            </span>
          </h1>

          <!-- Subheading -->
          <p class="text-base sm:text-lg text-pearl-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
            Tratamentos de assinatura mundialmente reconhecidos. Cirurgias guiadas por tomografia 3D, lentes cerâmicas ultrafinas e alinhadores invisíveis projetados sob medida para o seu perfil facial.
          </p>

          <!-- Dual Action CTAs -->
          <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              @click="scrollTo('#agendamento')"
              class="w-full sm:w-auto px-8 py-4 rounded-full bg-gold-gradient hover:bg-gold-gradient-hover text-navy-950 font-bold text-sm tracking-widest uppercase shadow-luxury hover:shadow-luxury-hover hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <Calendar class="w-4 h-4" />
              <span>Agendar Minha Avaliação</span>
            </button>

            <button
              @click="scrollTo('#tratamentos')"
              class="w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 hover:border-gold-400/80 bg-white/5 hover:bg-white/10 text-pearl-100 hover:text-gold-200 text-sm tracking-wider uppercase font-semibold transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Explorar Procedimentos</span>
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>

          <!-- Metrics Strip -->
          <div class="pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center lg:text-left">
            <div>
              <div class="font-serif text-2xl sm:text-3xl font-bold text-white">
                +15 <span class="text-gold-400 font-sans text-xl">Anos</span>
              </div>
              <p class="text-xs text-pearl-400 uppercase tracking-wider mt-1">
                Dedicação Exclusiva
              </p>
            </div>
            <div>
              <div class="font-serif text-2xl sm:text-3xl font-bold text-white">
                12k<span class="text-gold-400 font-sans text-xl">+</span>
              </div>
              <p class="text-xs text-pearl-400 uppercase tracking-wider mt-1">
                Sorrisos Transformados
              </p>
            </div>
            <div>
              <div class="font-serif text-2xl sm:text-3xl font-bold text-white">
                99.8<span class="text-gold-400 font-sans text-xl">%</span>
              </div>
              <p class="text-xs text-pearl-400 uppercase tracking-wider mt-1">
                Índice de Satisfação
              </p>
            </div>
          </div>
        </div>

        <!-- Right Column: Visual Showcase Card -->
        <div class="lg:col-span-5 relative">
          <!-- Main Hero Image Frame -->
          <div class="relative mx-auto max-w-md lg:max-w-none">
            <div class="relative rounded-3xl overflow-hidden border border-gold-500/30 shadow-2xl p-2 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-xl">
              <div class="relative rounded-2xl overflow-hidden aspect-[4/5] bg-navy-900">
                <img
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=85"
                  alt="Clínica Odontológica de Alto Padrão - Sala Clínica 3D"
                  class="w-full h-full object-cover object-center transform transition-transform duration-700 hover:scale-105"
                  loading="eager"
                />
                <!-- Gradient Vignette Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent"></div>

                <!-- Bottom Badge inside image -->
                <div class="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-dark border border-gold-500/30">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-xl bg-gold-gradient p-0.5 shrink-0 flex items-center justify-center shadow-glow-gold">
                      <Award class="w-5 h-5 text-navy-950" />
                    </div>
                    <div>
                      <p class="text-xs font-bold text-white tracking-wide uppercase">
                        Tecnologia Straumann & Cerec 3D
                      </p>
                      <p class="text-[11px] text-gold-300">
                        Escaneamento óptico intraoral sem moldagem física
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Floating Micro-Badge Top Right -->
            <div class="absolute -top-4 -right-4 sm:-right-6 bg-navy-900/90 border border-gold-400/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-center space-x-3 animate-float-slow">
              <div class="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <ShieldCheck class="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p class="text-[10px] text-pearl-400 uppercase font-semibold">Garantia Clínica</p>
                <p class="text-xs font-bold text-white">Cerâmicas Suíças</p>
              </div>
            </div>

            <!-- Floating Micro-Badge Bottom Left -->
            <div class="absolute -bottom-6 -left-4 sm:-left-6 bg-navy-900/90 border border-gold-400/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-center space-x-3">
              <div class="flex -space-x-1">
                <Star class="w-4 h-4 text-amber-400 fill-amber-400" />
                <Star class="w-4 h-4 text-amber-400 fill-amber-400" />
                <Star class="w-4 h-4 text-amber-400 fill-amber-400" />
                <Star class="w-4 h-4 text-amber-400 fill-amber-400" />
                <Star class="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div class="text-left">
                <p class="text-xs font-bold text-white">5.0 / 5.0</p>
                <p class="text-[10px] text-pearl-400">Avaliação Google VIP</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
