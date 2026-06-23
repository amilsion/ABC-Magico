<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { INITIAL_LETTER_WORDS, ALPHABET, type WordItem } from '@/lib/literacy-data'
import { speak, playSound, playWinFanfare } from '@/lib/speech'
import { rewardStars } from '@/components/StarReward.vue'
import GameHeader from '@/components/games/GameHeader.vue'

const emit = defineEmits<{
  back: []
  score: [score: number, stars: number]
}>()

const ALPHABET_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Round {
  word: WordItem
  options: string[]
  correct: string
}

const round = ref<Round | null>(null)
const picked = ref<string | null>(null)
const score = ref(0)
const solved = ref(0)
const attempts = ref(0)
const hasPlayed = ref(false)
let autoSpeakTimer: ReturnType<typeof setTimeout> | null = null
let advanceTimer: ReturnType<typeof setTimeout> | null = null
let replayTimer: ReturnType<typeof setTimeout> | null = null

function computeStars(): number {
  if (solved.value >= 10) return 3
  if (solved.value >= 5) return 2
  return 1
}

function clearTimers() {
  if (autoSpeakTimer) { clearTimeout(autoSpeakTimer); autoSpeakTimer = null }
  if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null }
  if (replayTimer) { clearTimeout(replayTimer); replayTimer = null }
}

function buildRound() {
  clearTimers()
  picked.value = null
  hasPlayed.value = false

  const item = INITIAL_LETTER_WORDS[Math.floor(Math.random() * INITIAL_LETTER_WORDS.length)]
  const correct = item.hint

  const distractors = shuffle(ALPHABET_LETTERS.filter((l) => l !== correct)).slice(0, 3)
  const options = shuffle([correct, ...distractors])

  round.value = { word: item, options, correct }
}

function playWord() {
  if (round.value) {
    speak(round.value.word.word, { rate: 0.75 })
  }
}

function handlePick(letter: string) {
  if (!round.value || picked.value) return

  if (letter === round.value.correct) {
    // Correct
    picked.value = letter
    playSound('correct')
    score.value += 12
    rewardStars(12)
    solved.value++

    speak(`Começa com ${round.value.correct}! Muito bem!`)

    if (solved.value % 5 === 0) {
      playWinFanfare()
    }

    emit('score', score.value, computeStars())

    advanceTimer = setTimeout(() => {
      buildRound()
    }, 1700)
  } else {
    // Wrong
    picked.value = letter
    attempts.value++
    playSound('wrong')
    speak('Quase!')

    setTimeout(() => {
      if (round.value) {
        picked.value = null
      }
    }, 1300)

    // Replay word after 1.3s
    replayTimer = setTimeout(() => {
      playWord()
    }, 1300)
  }
}

watch(round, () => {
  if (round.value) {
    hasPlayed.value = true
    autoSpeakTimer = setTimeout(() => {
      playWord()
    }, 400)
  }
})

onMounted(() => {
  buildRound()
})

onUnmounted(() => {
  clearTimers()
  if (score.value > 0) {
    emit('score', score.value, computeStars())
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-lime-50 via-green-50 to-emerald-50">
    <GameHeader
      title="Qual é a Letra?"
      emoji="🎧"
      color="#6BCB77"
      :score="score"
      @back="emit('back')"
    />

    <main class="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <div v-if="round" class="flex flex-col items-center gap-5">
        <!-- Bouncing emoji (text-8xl sm:text-9xl) -->
        <div
          class="text-8xl sm:text-9xl select-none animate-bounce drop-shadow-md"
        >
          {{ round.word.emoji }}
        </div>

        <!-- Ouvir palavra button -->
        <button
          @click="playWord()"
          class="rounded-full bg-emerald-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-emerald-600 active:scale-95"
        >
          🔊 Ouvir palavra
        </button>

        <p class="text-base font-bold text-emerald-700">Com qual letra começa?</p>

        <!-- 4 option buttons (letter in 6xl) -->
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="letter in round.options"
            :key="letter"
            @click="handlePick(letter)"
            class="w-24 h-24 rounded-2xl flex items-center justify-center text-6xl font-black text-white shadow-lg transition-all duration-150 active:scale-90 hover:scale-105"
            :style="{
              background: picked === letter
                ? letter === round.correct
                  ? '#16a34a'
                  : '#ef4444'
                : '#6BCB77',
              boxShadow: picked === letter && letter === round.correct
                ? '0 0 24px rgba(22,163,74,0.5)'
                : '0 4px 14px rgba(0,0,0,0.1)',
            }"
          >
            {{ letter }}
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="mt-6 flex gap-6 text-sm font-bold text-emerald-700 justify-center">
        <span>Acertos: {{ solved }}</span>
        <span>Tentativas: {{ attempts }}</span>
      </div>
    </main>
  </div>
</template>