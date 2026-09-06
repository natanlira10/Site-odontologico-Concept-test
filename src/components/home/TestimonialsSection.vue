<script setup lang="ts">
import { mockTestimonials } from '@/services/mockData';
import { Sparkles, Star, Quote } from 'lucide-vue-next';
</script>

<template>
  <section id="depoimentos" class="py-24 bg-navy-950 text-white relative overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-navy-950 to-navy-950 pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div class="inline-flex items-center space-x-2 text-xs font-semibold tracking-widest text-gold-400 uppercase">
          <Sparkles class="w-3.5 h-3.5" />
          <span>Experiências Reais</span>
        </div>
        <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
          A confiança de quem exige o mais alto padrão
        </h2>
        <p class="text-sm sm:text-base text-pearl-300 font-light leading-relaxed">
          Histórias de pacientes que transformaram não apenas o sorriso, mas a segurança e presença pessoal através de nossos cuidados integrados.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="item in mockTestimonials"
          :key="item.id"
          class="rounded-3xl bg-navy-900/80 border border-gold-500/20 p-8 shadow-xl backdrop-blur-md flex flex-col justify-between relative group hover:border-gold-500/50 transition-all duration-300"
        >
          <Quote class="absolute top-6 right-6 w-10 h-10 text-gold-500/15 pointer-events-none" />

          <div class="space-y-4">
            <!-- Stars -->
            <div class="flex items-center space-x-1">
              <Star
                v-for="s in item.rating"
                :key="s"
                class="w-4 h-4 text-amber-400 fill-amber-400"
              />
            </div>

            <!-- Comment -->
            <p class="text-xs sm:text-sm text-pearl-200 leading-relaxed font-light italic">
              "{{ item.comment }}"
            </p>
          </div>

          <!-- Author Info -->
          <div class="mt-8 pt-6 border-t border-white/10 flex items-center space-x-3.5">
            <img
              :src="item.avatarUrl"
              :alt="item.patientName"
              class="w-12 h-12 rounded-full object-cover border-2 border-gold-400/40 shrink-0"
            />
            <div>
              <h4 class="font-serif text-sm font-bold text-white">
                {{ item.patientName }}
              </h4>
              <p class="text-[11px] text-gold-300">
                {{ item.role }}
              </p>
              <p class="text-[10px] text-pearl-400 mt-0.5">
                Tratamento: {{ item.treatmentTaken }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
