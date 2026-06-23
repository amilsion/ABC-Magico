<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps<{ trigger: number }>()

interface Particle {
  id: number
  x: number
  y: number
  dx: number
  dy: number
  rot: number
  rotSpeed: number
  color: string
  emoji: string
  size: number
}

const COLORS = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#95E1D3', '#FFA07A', '#AA96DA', '#FFD93D']
const EMOJIS = ['⭐', '🎉', '✨', '🌟', '💫', '🎈', '🌈']

const particles = ref<Particle[]>([])
let intervalId: ReturnType<typeof setInterval> | null = null
let startMs = 0

watch(() => props.trigger, (t) => {
  if (t === 0) return
  const count = 36
  const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
    const speed = 6 + Math.random() * 8
    return {
      id: t * 1000 + i,
      x: 50, y: 50,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed - 4,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 25,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      size: 20 + Math.random() * 18,
    }
  })
  particles.value = newParticles
  startMs = Date.now()

  if (intervalId) clearInterval(intervalId)
  intervalId = setInterval(() => {
    const elapsed = (Date.now() - startMs) / 1000
    particles.value = particles.value.map((p) => ({
      ...p,
      x: p.x + p.dx * 0.4,
      y: p.y + p.dy * 0.4 + elapsed * elapsed * 12,
      rot: p.rot + p.rotSpeed,
    }))
    if (elapsed > 2.2) {
      if (intervalId) clearInterval(intervalId)
      particles.value = []
    }
  }, 30)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div v-if="particles.length > 0" class="pointer-events-none fixed inset-0 z-50 overflow-hidden">
    <span
      v-for="p in particles"
      :key="p.id"
      class="absolute select-none"
      :style="{
        left: p.x + '%',
        top: p.y + '%',
        fontSize: p.size + 'px',
        transform: 'translate(-50%,-50%) rotate(' + p.rot + 'deg)',
      }"
    >{{ p.emoji }}</span>
  </div>
</template>