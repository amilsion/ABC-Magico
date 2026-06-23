<script setup lang="ts">
import { ref, watch } from 'vue'

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

watch(() => props.trigger, (trigger) => {
  if (trigger === 0) return
  const count = 36
  const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
    const speed = 6 + Math.random() * 8
    return {
      id: trigger * 1000 + i,
      x: 50,
      y: 50,
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

  const start = Date.now()
  const interval = setInterval(() => {
    const elapsed = (Date.now() - start) / 1000
    particles.value = particles.value.map((p) => ({
      ...p,
      x: p.x + p.dx * 0.4,
      y: p.y + p.dy * 0.4 + elapsed * elapsed * 12,
      rot: p.rot + p.rotSpeed,
    }))
    if (elapsed > 2.2) {
      clearInterval(interval)
      particles.value = []
    }
  }, 30)
})
</script>

<template>
  <div v-if="particles.length > 0" class="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
    <div
      v-for="p in particles"
      :key="p.id"
      class="absolute"
      :style="{
        left: `${p.x}%`,
        top: `${p.y}%`,
        transform: `translate(-50%, -50%) rotate(${p.rot}deg)`,
        fontSize: `${p.size}px`,
      }"
    >
      <span class="select-none" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2))">
        {{ p.emoji }}
      </span>
    </div>
  </div>
</template>