<script setup lang="ts">
import { ref } from 'vue';
import { mockBeforeAfterCases } from '@/services/mockData';
import { Sparkles, MoveHorizontal, CheckCircle } from 'lucide-vue-next';

const cases = ref(mockBeforeAfterCases);
const selectedCaseIndex = ref(0);
const sliderPosition = ref(50); // percentage (0 to 100)

const activeCase = ref(cases.value[0]);

const setCase = (index: number) => {
  selectedCaseIndex.value = index;
  activeCase.value = cases.value[index];
  sliderPosition.value = 50;
};

const handleSliderInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  sliderPosition.value = Number(target.value);
};
</script>

<template>
  <section id="resultados" class="py-24 bg-pearl-100 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="text-center max-w-3xl mx-auto space-y-4 mb-14">
        <div class="inline-flex items-center space-x-2 text-xs font-semibold tracking-widest text-gold-600 uppercase">
          <Sparkles class="w-3.5 h-3.5" />
          <span>Galeria Clínica de Resultados</span>
        </div>
        <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-navy-950 tracking-tight">
          A transformação visível com precisão milimétrica
        </h2>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
          Arraste o cursor interativo para comparar a arquitetura dental inicial e a harmonia estética conquistada após os protocolos Atelier.
        </p>
      </div>

      <!-- Case Tabs -->
      <div class="flex items-center justify-center space-x-3 mb-10 overflow-x-auto pb-2">
        <button
          v-for="(item, idx) in cases"
          :key="item.id"
          @click="setCase(idx)"
          :class="[
            'px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer',
            selectedCaseIndex === idx
              ? 'bg-navy-950 text-gold-300 shadow-md scale-105'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-gold-400'
          ]"
        >
          {{ item.title }}
        </button>
      </div>

      <!-- Comparison Interactive Slider Container -->
      <div class="max-w-4xl mx-auto bg-white rounded-3xl p-4 sm:p-8 shadow-2xl border border-gold-500/20">
        <div class="relative w-full aspect-[16/9] sm:aspect-[21/10] rounded-2xl overflow-hidden select-none bg-navy-950">
          <!-- After Image (Background) -->
          <img
            :src="activeCase.afterImage"
            alt="Resultado Final Depois"
            class="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          <div class="absolute top-4 right-4 bg-navy-950/80 backdrop-blur-md border border-gold-400/40 text-gold-300 text-xs font-bold uppercase px-3 py-1 rounded-full pointer-events-none">
            Depois (Atelier)
          </div>

          <!-- Before Image (Clipped Overlay) -->
          <div
            class="absolute inset-0 overflow-hidden pointer-events-none"
            :style="{ width: `${sliderPosition}%` }"
          >
            <img
              :src="activeCase.beforeImage"
              alt="Condição Inicial Antes"
              class="absolute inset-0 w-full h-full object-cover max-w-none"
              :style="{ width: '100%', height: '100%' }"
            />
            <div class="absolute top-4 left-4 bg-navy-950/80 backdrop-blur-md border border-white/20 text-pearl-200 text-xs font-bold uppercase px-3 py-1 rounded-full pointer-events-none">
              Antes
            </div>
          </div>

          <!-- Divider Line -->
          <div
            class="absolute top-0 bottom-0 w-1 bg-gold-400 shadow-glow-gold pointer-events-none z-20"
            :style="{ left: `${sliderPosition}%` }"
          >
            <!-- Circular Center Handle -->
            <div class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-navy-950 border-2 border-gold-400 text-gold-400 flex items-center justify-center shadow-lg">
              <MoveHorizontal class="w-4 h-4" />
            </div>
          </div>

          <!-- Native Slider Input Overlay -->
          <input
            type="range"
            min="0"
            max="100"
            :value="sliderPosition"
            @input="handleSliderInput"
            class="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            aria-label="Controle deslizante de antes e depois"
          />
        </div>

        <!-- Case Summary -->
        <div class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div class="space-y-1 text-center sm:text-left">
            <h4 class="font-serif text-lg font-bold text-navy-900">
              {{ activeCase.title }}
            </h4>
            <p class="text-xs text-slate-600 font-light">
              {{ activeCase.summary }}
            </p>
          </div>
          <div class="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full">
            <CheckCircle class="w-4 h-4 text-emerald-600" />
            <span>Caso Documentado & Autorizado</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
