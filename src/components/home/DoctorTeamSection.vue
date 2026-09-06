<script setup lang="ts">
import { useBooking } from '@/composables/useBooking';
import { Sparkles, Award, GraduationCap, Calendar } from 'lucide-vue-next';

const { doctors, selectedDoctorId, selectedTreatmentId, loadSlots } = useBooking();

const handleSelectDoctor = async (docId: string) => {
  selectedDoctorId.value = docId;
  const doctor = doctors.value.find((item) => item.id === docId);
  if (!doctor?.supportedTreatments.includes(selectedTreatmentId.value)) {
    selectedTreatmentId.value = doctor?.supportedTreatments[0] ?? '';
  }
  await loadSlots();
  const bookingEl = document.querySelector('#agendamento');
  if (bookingEl) {
    bookingEl.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<template>
  <section id="especialistas" class="py-24 bg-pearl-50 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div class="inline-flex items-center space-x-2 text-xs font-semibold tracking-widest text-gold-600 uppercase">
          <Sparkles class="w-3.5 h-3.5" />
          <span>Corpo Clínico Permanente</span>
        </div>
        <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-navy-950 tracking-tight">
          Especialistas dedicados à excelência sem concessões
        </h2>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
          Nossa equipe reúne mestres e doutores com titulações nas mais renomadas instituições da Europa e América Latina, atuando em sinergia multidisciplinar.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="doctor in doctors"
          :key="doctor.id"
          class="group rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-2xl hover:border-gold-400/50 transition-all duration-300 flex flex-col"
        >
          <!-- Doctor Portrait Frame -->
          <div class="relative aspect-[4/4] overflow-hidden bg-navy-900">
            <img
              :src="doctor.avatarUrl"
              :alt="doctor.name"
              class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent"></div>

            <div class="absolute bottom-4 left-4 right-4 text-white">
              <span class="text-[11px] font-bold text-gold-300 uppercase tracking-widest block mb-0.5">
                {{ doctor.cro }}
              </span>
              <h3 class="font-serif text-xl font-bold">
                {{ doctor.name }}
              </h3>
            </div>
          </div>

          <!-- Doctor Content & Credentials -->
          <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div class="space-y-3">
              <div class="inline-flex items-center space-x-1.5 text-xs font-semibold text-gold-700 bg-gold-50 px-3 py-1 rounded-full">
                <Award class="w-3.5 h-3.5 text-gold-600" />
                <span>{{ doctor.specialty }}</span>
              </div>

              <p class="text-xs text-slate-600 leading-relaxed">
                {{ doctor.bio }}
              </p>

              <!-- Education Bullets -->
              <div class="space-y-1.5 pt-2">
                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Formação Acadêmica:
                </p>
                <div
                  v-for="(edu, eIdx) in doctor.education"
                  :key="eIdx"
                  class="flex items-start space-x-2 text-xs text-slate-700"
                >
                  <GraduationCap class="w-3.5 h-3.5 text-gold-500 mt-0.5 shrink-0" />
                  <span>{{ edu }}</span>
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100">
              <button
                @click="handleSelectDoctor(doctor.id)"
                class="w-full py-3 rounded-xl border border-gold-500/40 text-navy-950 hover:bg-gold-500 hover:text-white font-semibold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Calendar class="w-4 h-4 text-gold-600 group-hover:text-white" />
                <span>Agendar com {{ doctor.name.split(' ')[0] }} {{ doctor.name.split(' ')[1] }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
