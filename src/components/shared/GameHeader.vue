<script setup lang="ts">
defineProps<{
  title: string
  emoji: string
  color: string
  score: number
}>()

defineEmits<{
  back: []
}>()
</script>

<template>
  <div class="flex items-center justify-between rounded-2xl px-4 py-3 shadow-lg mb-4" :style="{ background: color }">
    <button
      @click="$emit('back')"
      class="rounded-full bg-white/25 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-white/40 active:scale-95"
    >
      ← Voltar
    </button>
    <div class="text-center text-white">
      <span class="text-lg">{{ emoji }}</span>
      <span class="text-sm font-bold ml-1">{{ title }}</span>
    </div>
    <div class="flex items-center gap-1 rounded-full bg-white/25 px-3 py-1.5 text-sm font-bold text-white">
      <span>⭐</span>
      <span>{{ score }}</span>
    </div>
  </div>
</template>