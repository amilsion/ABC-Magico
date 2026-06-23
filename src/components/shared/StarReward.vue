<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface FloatingStar {
  id: number
  amount: number
}

const stars = ref<FloatingStar[]>([])

let handler: ((e: Event) => void) | null = null

onMounted(() => {
  handler = (e: Event) => {
    const detail = (e as CustomEvent<number>).detail
    const id = Date.now() + Math.random()
    stars.value = [...stars.value, { id, amount: detail }]
    setTimeout(() => {
      stars.value = stars.value.filter((s) => s.id !== id)
    }, 1100)
  }
  window.addEventListener('abc:star', handler as EventListener)
})

onUnmounted(() => {
  if (handler) window.removeEventListener('abc:star', handler as EventListener)
})


</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-40 overflow-hidden">
    <span
      v-for="s in stars"
      :key="s.id"
      class="absolute left-1/2 top-1/2 -translate-x-1/2 text-3xl font-black text-amber-400 drop-shadow-lg"
      style="animation: starFloat 1.1s ease-out forwards;"
    >+{{ s.amount }} ⭐</span>
  </div>
</template>