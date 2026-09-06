<script setup lang="ts">
import { CheckCircle2, AlertCircle, X } from 'lucide-vue-next';

defineProps<{
  show: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-6 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-95"
  >
    <div
      v-if="show"
      class="fixed bottom-6 right-6 z-50 max-w-md w-full shadow-2xl rounded-2xl border p-4 backdrop-blur-xl flex items-start space-x-3.5"
      :class="[
        type === 'error'
          ? 'bg-rose-950/90 border-rose-500/40 text-rose-100'
          : 'bg-navy-900/90 border-gold-500/40 text-pearl-50 shadow-glow-gold'
      ]"
    >
      <div class="shrink-0 mt-0.5">
        <AlertCircle v-if="type === 'error'" class="w-5 h-5 text-rose-400" />
        <CheckCircle2 v-else class="w-5 h-5 text-gold-400" />
      </div>
      <div class="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
        {{ message }}
      </div>
      <button
        @click="emit('close')"
        class="shrink-0 text-pearl-400 hover:text-white p-1 transition-colors"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </transition>
</template>
