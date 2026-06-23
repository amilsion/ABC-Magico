<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { initVoices } from '@/lib/speech'

const unlockedRef = ref(false)

onMounted(() => {
  initVoices()
  const unlock = () => {
    if (unlockedRef.value) return
    unlockedRef.value = true
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext
      if (AC) {
        const ctx = new AC()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        gain.gain.value = 0.0001
        osc.start()
        osc.stop(ctx.currentTime + 0.01)
      }
    } catch {
      // ignore
    }
  }
  window.addEventListener('pointerdown', unlock)
  window.addEventListener('keydown', unlock)
})
</script>

<template>
  <slot />
</template>