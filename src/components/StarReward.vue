<script lang="ts">
export function rewardStars(amount: number) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('abc:star', { detail: amount }))
}
</script>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface FloatingStar {
  id: number
  amount: number
}

const stars = ref<FloatingStar[]>([])

function handler(e: Event) {
  const detail = (e as CustomEvent<number>).detail
  const id = Date.now() + Math.random()
  stars.value = [...stars.value, { id, amount: detail }]
  setTimeout(() => {
    stars.value = stars.value.filter((s) => s.id !== id)
  }, 1100)
}

onMounted(() => {
  window.addEventListener('abc:star', handler as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('abc:star', handler as EventListener)
})
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-[90] flex items-start justify-center">
    <div
      v-for="s in stars"
      :key="s.id"
      class="absolute top-1/3 text-4xl sm:text-5xl font-extrabold"
      style="color: #FFD93D; text-shadow: 0 4px 0 #FFA500, 0 8px 12px rgba(0,0,0,0.3); animation: starFloat 1.1s ease-out forwards;"
    >
      +{{ s.amount }} ⭐
    </div>
  </div>
</template>