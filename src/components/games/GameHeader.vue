<script setup lang="ts">
const props = defineProps<{
  title: string
  emoji: string
  color: string
  score: number
}>()

const emit = defineEmits<{ back: [] }>()
</script>

<template>
  <header
    class="sticky top-0 z-30 flex items-center justify-between gap-2 px-3 py-3 sm:px-5 sm:py-4 shadow-md text-white"
    :style="{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }"
  >
    <button
      @click="emit('back')"
      class="bg-white/25 hover:bg-white/40 text-white border-0 shadow-sm font-bold rounded-lg px-3 py-1.5 text-sm transition"
    >
      ← Voltar
    </button>
    <div class="flex items-center gap-2 font-extrabold text-base sm:text-xl">
      <span class="text-2xl sm:text-3xl">{{ emoji }}</span>
      <span class="tracking-tight drop-shadow-sm">{{ title }}</span>
    </div>
    <div class="flex items-center gap-1 rounded-full px-3 py-1.5 font-bold text-sm sm:text-base bg-white/25 backdrop-blur-sm min-w-[80px] justify-end">
      <span>⭐</span>
      <span>{{ score }}</span>
    </div>
  </header>
</template>