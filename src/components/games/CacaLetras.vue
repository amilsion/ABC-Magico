<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ALPHABET } from '@/lib/literacy-data'
import { speak, playSound, playWinFanfare } from '@/lib/speech'
import { rewardStars } from '@/components/StarReward.vue'
import GameHeader from '@/components/games/GameHeader.vue'

const emit = defineEmits<{ back: []; score: [score: number, stars: number] }>()

const GRID_SIZE = 36
const TARGET_COUNT = 5

interface Cell {
  letter: string
  isTarget: boolean
  found: boolean
  wrong: boolean
}

function buildGrid(target: string): Cell[] {
  const cells: Cell[] = []
  const positions = new Set<number>()
  while (positions.size < TARGET_COUNT) {
    positions.add(Math.floor(Math.random() * GRID_SIZE))
  }
  for (let i = 0; i < GRID_SIZE; i++) {
    cells.push({
      letter: positions.has(i) ? target : ALPHABET[Math.floor(Math.random() * 26)].letter,
      isTarget: positions.has(i),
      found: false,
      wrong: false,
    })
  }
  return cells
}

const targetIdx = ref(0)
const cells = ref<Cell[]>([])
const found = ref(0)
const score = ref(0)
const totalRounds = ref(0)

const target = computed(() => ALPHABET[targetIdx.value].letter)

function computeStars(): number {
  if (found.value >= TARGET_COUNT) return 3
  if (found.value >= 3) return 2
  return 1
}

function reset(idx: number) {
  cells.value = buildGrid(ALPHABET[idx].letter)
  found.value = 0
}

watch(targetIdx, (idx) => {
  reset(idx)
  speak(`Encontre a letra ${ALPHABET[idx].letter}`, { rate: 0.85 })
}, { immediate: true })

function handleClick(i: number) {
  const cell = cells.value[i]
  if (cell.found) return
  if (cell.isTarget) {
    playSound('correct')
    speak(cell.letter, { rate: 0.7 })
    cells.value[i] = { ...cell, found: true }
    found.value++
    const newScore = score.value + 5
    score.value = newScore
    rewardStars(5)
    emit('score', newScore, computeStars())
    if (found.value >= TARGET_COUNT) {
      playWinFanfare()
      setTimeout(() => {
        totalRounds.value++
        targetIdx.value = (targetIdx.value + 1) % ALPHABET.length
      }, 1500)
    }
  } else {
    playSound('wrong')
    cells.value[i] = { ...cell, wrong: true }
    setTimeout(() => {
      cells.value[i] = { ...cells.value[i], wrong: false }
    }, 400)
  }
}

function changeTarget() {
  targetIdx.value = (targetIdx.value + 1) % ALPHABET.length
}

onUnmounted(() => {
  if (score.value > 0) {
    emit('score', score.value, computeStars())
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50">
    <GameHeader
      title="Caça Letras"
      emoji="🔍"
      color="#95E1D3"
      :score="score"
      @back="emit('back')"
    />

    <main class="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <!-- Target letter display -->
      <div class="mb-5 flex flex-col items-center gap-2">
        <div class="rounded-full bg-emerald-500 px-6 py-3 text-lg font-bold text-white shadow-lg">
          Encontre a letra:
        </div>
        <button
          @click="speak(`Letra ${target}`, { rate: 0.7 })"
          class="flex h-24 w-24 items-center justify-center rounded-2xl bg-white text-7xl font-black text-emerald-600 shadow-xl"
          style="border: 4px solid #10b981"
        >
          {{ target }}
        </button>
        <button
          @click="changeTarget"
          class="mt-1 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-200 active:scale-95"
        >
          ↻ Trocar letra
        </button>
      </div>

      <!-- 6x6 Grid -->
      <div class="mx-auto grid max-w-md grid-cols-6 gap-2">
        <button
          v-for="(c, i) in cells"
          :key="i"
          @click="handleClick(i)"
          :disabled="c.found"
          class="flex aspect-square items-center justify-center rounded-lg text-2xl sm:text-3xl font-black shadow-sm transition"
          :style="{
            background: c.found ? '#10b981' : c.wrong ? '#ef4444' : 'white',
            color: c.found ? 'white' : c.wrong ? 'white' : '#0f766e',
            border: c.found ? '3px solid #047857' : c.wrong ? '3px solid #b91c1c' : '3px solid #a7f3d0',
            transform: c.found ? 'scale(0.95)' : 'scale(1)',
          }"
        >
          {{ c.letter }}
        </button>
      </div>

      <!-- Status -->
      <div class="mt-6 text-center">
        <div class="inline-block rounded-full bg-white px-5 py-2 text-base font-bold text-emerald-700 shadow">
          Encontradas: <span class="text-emerald-900">{{ found }}</span> / {{ TARGET_COUNT }}
        </div>
        <div class="mt-2 text-sm text-emerald-600">Rodadas completas: {{ totalRounds }}</div>
      </div>
    </main>
  </div>
</template>