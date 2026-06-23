<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { ALPHABET } from '@/lib/literacy-data'
import { speak, playSound, playWinFanfare } from '@/lib/speech'
import { rewardStars } from '@/components/StarReward.vue'
import GameHeader from '@/components/games/GameHeader.vue'

const emit = defineEmits<{
  back: []
  score: [score: number, stars: number]
}>()

const COUNT = 4

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Round {
  letters: { letter: string; color: string; originalIdx: number }[]
  targetOrder: string[]
}

const round = ref<Round | null>(null)
const picked = ref<number[]>([])
const score = ref(0)
const solved = ref(0)
const attempts = ref(0)
const wrongIdx = ref<number | null>(null)

function computeStars(): number {
  if (solved.value >= 8) return 3
  if (solved.value >= 4) return 2
  return 1
}

function buildRound() {
  picked.value = []
  wrongIdx.value = null

  const pickedLetters = shuffle([...ALPHABET]).slice(0, COUNT)
  const sorted = [...pickedLetters].sort((a, b) => a.letter.localeCompare(b.letter))
  const targetOrder = sorted.map((l) => l.letter)

  // Ensure shuffled is NOT already in alphabetical order
  let shuffled: typeof pickedLetters
  do {
    shuffled = shuffle(pickedLetters)
  } while (shuffled.every((s, i) => s.letter === sorted[i].letter))

  round.value = {
    letters: shuffled.map((s, originalIdx) => ({
      letter: s.letter,
      color: s.color,
      originalIdx,
    })),
    targetOrder,
  }
}

function handlePick(originalIdx: number) {
  if (!round.value) return
  if (picked.value.includes(originalIdx)) return
  if (wrongIdx.value !== null) return

  const clicked = round.value.letters[originalIdx]
  const expectedLetter = round.value.targetOrder[picked.value.length]

  if (clicked.letter === expectedLetter) {
    // Correct
    picked.value = [...picked.value, originalIdx]
    score.value += 8
    rewardStars(8)
    playSound('correct')
    speak(clicked.letter)

    if (picked.value.length === COUNT) {
      solved.value++
      playWinFanfare()
      emit('score', score.value, computeStars())

      setTimeout(() => {
        buildRound()
      }, 1800)
    }
  } else {
    // Wrong
    wrongIdx.value = originalIdx
    attempts.value++
    playSound('wrong')

    setTimeout(() => {
      wrongIdx.value = null
    }, 500)
  }
}

watch(round, () => {
  if (round.value) {
    speak('Coloque as letras em ordem alfabética!', { rate: 0.85 })
  }
})

onMounted(() => {
  buildRound()
})

onUnmounted(() => {
  if (score.value > 0) {
    emit('score', score.value, computeStars())
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50">
    <GameHeader
      title="Ordem Alfabética"
      emoji="📚"
      color="#C7CEEA"
      :score="score"
      @back="emit('back')"
    />

    <main class="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <!-- Instruction -->
      <p class="mb-4 text-center text-base font-bold text-blue-700">
        Toque nas letras em ordem alfabética (A → Z)
      </p>

      <!-- Result row (showing picked letters in order) -->
      <div v-if="round" class="mb-6 flex justify-center gap-3 px-2">
        <div
          v-for="(slot, i) in COUNT"
          :key="i"
          class="relative w-20 h-20 rounded-2xl flex items-center justify-center text-5xl font-black transition-all duration-300"
          :style="
            round && i < picked.length
              ? {
                  background: ALPHABET.find((a) => a.letter === round!.letters[picked[i]].letter)?.color || '#94a3b8',
                  color: 'white',
                  border: '3px solid white',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                }
              : {
                  background: '#f1f5f9',
                  color: '#d1d5db',
                  border: '3px dashed #cbd5e1',
                }
          "
        >
          <template v-if="round && i < picked.length">
            {{ round.letters[picked[i]].letter }}
          </template>
          <template v-else>
            ?
          </template>
          <!-- Arrow indicator between slots -->
          <span
            v-if="i < COUNT - 1"
            class="absolute -right-4 top-1/2 -translate-y-1/2 text-2xl text-blue-300 pointer-events-none"
          >
            →
          </span>
        </div>
      </div>

      <!-- Letter buttons bank -->
      <div v-if="round" class="flex justify-center gap-3 flex-wrap mt-4">
        <button
          v-for="(item, idx) in round.letters"
          :key="item.letter"
          @click="handlePick(idx)"
          class="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl font-black text-white shadow-lg transition-all duration-150 active:scale-90 hover:scale-105"
          :class="{
            'opacity-30 pointer-events-none': picked.includes(idx),
          }"
          :style="{
            background: wrongIdx === idx ? '#ef4444' : item.color,
            boxShadow:
              wrongIdx === idx
                ? '0 0 20px rgba(239,68,68,0.6)'
                : `0 4px 14px ${item.color}44`,
            animation: wrongIdx === idx ? 'shake 0.4s ease' : 'none',
          }"
        >
          {{ item.letter }}
        </button>
      </div>

      <!-- Stats -->
      <div class="mt-8 flex gap-6 text-sm font-bold text-blue-700 justify-center">
        <span>Sequências: {{ solved }}</span>
        <span>Erros: {{ attempts }}</span>
      </div>
    </main>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-6px);
  }
  40% {
    transform: translateX(6px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}
</style>