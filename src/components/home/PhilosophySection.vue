<script setup lang="ts">
import { Scan, Sparkles, Feather, ShieldCheck, HeartPulse, Microscope } from 'lucide-vue-next';

const differentials = [
  {
    icon: Scan,
    title: 'Escaneamento Óptico 3D',
    description: 'Eliminamos as incômodas moldagens convencionais. O scanner intraoral digitaliza todo o arco em segundos com precisão micrométrica.',
    tag: 'Tecnologia Alemã'
  },
  {
    icon: Microscope,
    title: 'Odontologia Biomimética',
    description: 'Respeito irrestrito à biologia dental. Usamos microscópios cirúrgicos para preservar o máximo de esmalte e dentina sadios.',
    tag: 'Preservação Máxima'
  },
  {
    icon: Feather,
    title: 'Protocolo Conforto Zero Ansiedade',
    description: 'Sedação consciente inalatória e ambiente planejado com aromaterapia, fones anti-ruído e climatização controlada.',
    tag: 'Experiência Spa'
  },
  {
    icon: ShieldCheck,
    title: 'Biossegurança Hospitalar Nível 4',
    description: 'Autoclaves de última geração com monitoramento biológico em tempo real e salas estéreis para procedimentos cirúrgicos.',
    tag: 'Padrão Internacional'
  }
];
</script>

<template>
  <section id="diferenciais" class="py-24 bg-pearl-50 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div class="inline-flex items-center space-x-2 text-xs font-semibold tracking-widest text-gold-600 uppercase">
          <Sparkles class="w-3.5 h-3.5" />
          <span>Filosofia & Rigor Clínico</span>
        </div>
        <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-navy-950 tracking-tight">
          A fusão perfeita entre alta tecnologia e acolhimento humano
        </h2>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
          Cada detalhe no Atelier Dental foi concebido para elevar a experiência odontológica a um novo patamar de tranquilidade, sofisticação e precisão.
        </p>
      </div>

      <!-- Bento Grid Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="(item, idx) in differentials"
          :key="idx"
          class="group relative rounded-2xl bg-white border border-slate-200/80 p-8 shadow-sm hover:shadow-xl hover:border-gold-400/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
        >
          <!-- Accent Top Bar -->
          <div class="w-12 h-1 bg-gold-400/30 group-hover:bg-gold-500 rounded-full mb-6 transition-all duration-300"></div>

          <div class="space-y-4">
            <div class="w-12 h-12 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-white transition-colors duration-300 shadow-sm">
              <component :is="item.icon" class="w-6 h-6" />
            </div>

            <span class="inline-block text-[11px] font-bold uppercase tracking-wider text-gold-700 bg-gold-50 px-2.5 py-1 rounded-full">
              {{ item.tag }}
            </span>

            <h3 class="font-serif text-xl font-bold text-navy-900 group-hover:text-gold-700 transition-colors">
              {{ item.title }}
            </h3>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
              {{ item.description }}
            </p>
          </div>

          <div class="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-gold-600">
            <span>Padrão Ouro</span>
            <HeartPulse class="w-4 h-4 text-gold-500 opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
