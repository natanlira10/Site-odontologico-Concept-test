<script setup lang="ts">
import { ref, computed } from 'vue';
import { useBooking } from '@/composables/useBooking';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Calendar
} from 'lucide-vue-next';

const { treatments, selectTreatment } = useBooking();

const activeFilter = ref<string>('todos');
const currentIndex = ref<number>(0);

const filters = [
  { id: 'todos', label: 'Todos os Procedimentos' },
  { id: 'estetica', label: 'Estética & Cerâmicas' },
  { id: 'ortodontia', label: 'Ortodontia Digital' },
  { id: 'implantes', label: 'Implantes & Cirurgia 3D' },
  { id: 'reabilitacao', label: 'Reabilitação Biomimética' },
];

const filteredTreatments = computed(() => {
  if (activeFilter.value === 'todos') return treatments.value;
  return treatments.value.filter((t) => t.category === activeFilter.value);
});

const maxIndex = computed(() => {
  return Math.max(0, filteredTreatments.value.length - 1);
});

const nextSlide = () => {
  if (currentIndex.value < maxIndex.value) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0; // Loop back
  }
};

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = maxIndex.value;
  }
};

const setFilter = (filterId: string) => {
  activeFilter.value = filterId;
  currentIndex.value = 0;
};

const handleBookTreatment = (treatmentId: string) => {
  selectTreatment(treatmentId);
  const bookingEl = document.querySelector('#agendamento');
  if (bookingEl) {
    bookingEl.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<template>
  <section id="tratamentos" class="py-28 bg-navy-900 text-white relative overflow-hidden">
    <!-- Ambient backdrops -->
    <div class="absolute top-1/2 left-0 w-96 h-96 bg-gold-600/10 rounded-full blur-[140px] pointer-events-none"></div>
    <div class="absolute -bottom-20 right-0 w-96 h-96 bg-gold-400/10 rounded-full blur-[140px] pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <!-- Section Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div class="space-y-4 max-w-2xl">
          <div class="inline-flex items-center space-x-2 text-xs font-semibold tracking-widest text-gold-400 uppercase">
            <Sparkles class="w-3.5 h-3.5" />
            <span>Procedimentos Exclusivos</span>
          </div>
          <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Tratamentos de assinatura sob medida
          </h2>
          <p class="text-sm sm:text-base text-pearl-300 font-light leading-relaxed">
            Planejamento estético e funcional milimétrico, unindo os melhores laboratórios de cerâmica da Europa a tecnologias de navegação cirúrgica computadorizada.
          </p>
        </div>

        <!-- Carousel Navigation Controls -->
        <div class="flex items-center space-x-3 self-start md:self-end">
          <button
            @click="prevSlide"
            class="w-12 h-12 rounded-full border border-gold-500/40 bg-navy-950/60 hover:bg-gold-500 hover:text-navy-950 text-gold-300 flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer group"
            aria-label="Tratamento anterior"
          >
            <ChevronLeft class="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <button
            @click="nextSlide"
            class="w-12 h-12 rounded-full border border-gold-500/40 bg-navy-950/60 hover:bg-gold-500 hover:text-navy-950 text-gold-300 flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer group"
            aria-label="Próximo tratamento"
          >
            <ChevronRight class="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center space-x-2 pb-6 overflow-x-auto hide-scrollbar">
        <button
          v-for="filter in filters"
          :key="filter.id"
          @click="setFilter(filter.id)"
          :class="[
            'px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 cursor-pointer',
            activeFilter === filter.id
              ? 'bg-gold-gradient text-navy-950 shadow-glow-gold font-bold scale-105'
              : 'bg-navy-950/80 text-pearl-300 border border-white/10 hover:border-gold-500/40 hover:text-gold-200'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Carousel Track Container -->
      <div class="relative mt-6 overflow-hidden">
        <div
          class="flex transition-transform duration-500 ease-out gap-6"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <div
            v-for="treatment in filteredTreatments"
            :key="treatment.id"
            class="w-full shrink-0 max-w-full"
          >
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-navy-950/80 border border-gold-500/20 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
              <!-- Left: Treatment Image Showcase -->
              <div class="lg:col-span-5 relative group overflow-hidden rounded-2xl border border-white/10">
                <div class="aspect-[4/3] lg:aspect-auto lg:h-full w-full relative">
                  <img
                    :src="treatment.imageUrl"
                    :alt="treatment.name"
                    class="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-black/30"></div>

                  <!-- Badge -->
                  <div class="absolute top-4 left-4 bg-navy-950/90 border border-gold-400/40 text-gold-300 text-xs uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-full backdrop-blur-md">
                    {{ treatment.highlightTag }}
                  </div>

                  <div class="absolute bottom-4 left-4 right-4">
                    <span class="text-[11px] uppercase tracking-widest text-gold-400 font-semibold block mb-1">
                      {{ treatment.categoryLabel }}
                    </span>
                    <h3 class="font-serif text-xl sm:text-2xl font-bold text-white">
                      {{ treatment.name }}
                    </h3>
                  </div>
                </div>
              </div>

              <!-- Right: Detailed Specs & Booking Hook -->
              <div class="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div class="space-y-4">
                  <h3 class="hidden lg:block font-serif text-2xl sm:text-3xl font-bold text-white">
                    {{ treatment.name }}
                  </h3>

                  <p class="text-sm sm:text-base text-pearl-200 leading-relaxed font-light">
                    {{ treatment.fullDescription }}
                  </p>

                  <!-- Technical Indicator Badges -->
                  <div class="grid grid-cols-3 gap-3 pt-2">
                    <div class="bg-navy-900 border border-white/10 rounded-xl p-3 text-center">
                      <div class="flex items-center justify-center space-x-1.5 text-gold-400 mb-1">
                        <Clock class="w-3.5 h-3.5" />
                        <span class="text-[10px] uppercase font-bold tracking-wider">Tempo</span>
                      </div>
                      <p class="text-xs sm:text-sm font-semibold text-white">
                        {{ treatment.duration }}
                      </p>
                    </div>

                    <div class="bg-navy-900 border border-white/10 rounded-xl p-3 text-center">
                      <div class="flex items-center justify-center space-x-1.5 text-gold-400 mb-1">
                        <ShieldAlert class="w-3.5 h-3.5" />
                        <span class="text-[10px] uppercase font-bold tracking-wider">Desconforto</span>
                      </div>
                      <p class="text-xs sm:text-sm font-semibold text-emerald-400">
                        {{ treatment.discomfortLevel }}
                      </p>
                    </div>

                    <div class="bg-navy-900 border border-white/10 rounded-xl p-3 text-center">
                      <div class="flex items-center justify-center space-x-1.5 text-gold-400 mb-1">
                        <Activity class="w-3.5 h-3.5" />
                        <span class="text-[10px] uppercase font-bold tracking-wider">Retorno</span>
                      </div>
                      <p class="text-xs sm:text-sm font-semibold text-white">
                        {{ treatment.recoveryTime }}
                      </p>
                    </div>
                  </div>

                  <!-- Key Technical Features List -->
                  <div class="space-y-2 pt-2">
                    <h4 class="text-xs uppercase font-bold tracking-wider text-gold-400">
                      Diferenciais deste procedimento:
                    </h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div
                        v-for="(feature, fIdx) in treatment.features"
                        :key="fIdx"
                        class="flex items-center space-x-2 text-xs text-pearl-200"
                      >
                        <CheckCircle2 class="w-4 h-4 text-gold-400 shrink-0" />
                        <span>{{ feature }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Strip -->
                <div class="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div class="text-xs text-pearl-400 text-center sm:text-left">
                    <span class="block font-semibold text-gold-300">
                      {{ treatment.startingPriceEstimate }}
                    </span>
                    <span>Planejamento digital incluso na consulta inicial</span>
                  </div>

                  <button
                    @click="handleBookTreatment(treatment.id)"
                    class="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gold-gradient hover:bg-gold-gradient-hover text-navy-950 font-bold uppercase tracking-wider text-xs shadow-luxury hover:shadow-luxury-hover hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Calendar class="w-4 h-4" />
                    <span>Agendar Este Procedimento</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Carousel Pagination Dots -->
      <div class="flex items-center justify-center space-x-2.5 mt-8">
        <button
          v-for="(_, index) in filteredTreatments"
          :key="index"
          @click="currentIndex = index"
          class="h-2 rounded-full transition-all duration-300 cursor-pointer"
          :class="[
            currentIndex === index
              ? 'w-8 bg-gold-400 shadow-glow-gold'
              : 'w-2 bg-white/20 hover:bg-white/40'
          ]"
          :aria-label="`Ir para slide ${index + 1}`"
        />
      </div>
    </div>
  </section>
</template>
