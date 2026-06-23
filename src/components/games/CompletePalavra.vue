<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ALL_WORDS, ALPHABET, type WordItem } from '@/lib/literacy-data'
import { speak, playSound, playWinFanfare } from '@/lib/speech'
import { rewardStars } from '@/components/StarReward.vue'
import GameHeader from '@/components/games/GameHeader.vue'

const emit = defineEmits<{
  back: []
  score: [score: number, stars: number]
}>()

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
  missingIdx: number
  options: string[]
}

const round = ref<Round | null>(null)
const picked = ref<string | null>(null)
const score = ref(0)
const streak = ref(0)
const solved = ref(0)

const streakBadge = computed(() => (streak.value > 1 ? streak.value : 0))

function computeStars(): number {
  if (solved.value >= 10) return 3
  if (solved.value >= 5) return 2
  return 1
}

function buildRound(): Round {
  const word = shuffle([...ALL_WORDS])[0]
  const letters = word.word.split('')
  const missingIdx = Math.floor(Math.random() * letters.length)
  const correctLetter = letters[missingIdx]

  const allLetters = ALPHABET.map((a) => a.letter)
  const uniqueLetters = [...new Set(allLetters.filter((l) => l !== correctLetter))]
  const distractors = shuffle(uniqueLetters).slice(0, 3)
  const options = shuffle([correctLetter, ...distractors])

  return { word, missingIdx, options }
}

function startNewRound() {
  round.value = buildRound()
  picked.value = null
}

function handleSpeak() {
  if (!round.value) return
  playSound('click')
  speak(round.value.word.word, { rate: 0.7 })
}

function handlePick(letter: string) {
  if (!round.value || picked.value) return

  if (letter === round.value.word.word[round.value.missingIdx]) {
    // Correct
    picked.value = letter
    playSound('correct')
    const bonus = Math.min(streak.value, 5) * 2
    const points = 10 + bonus
    score.value += points
    solved.value++
    streak.value++
    rewardStars(points)

    speak(`${round.value.word.word}! Muito bem!`)

    if (streak.value > 1 && streak.value % 5 === 0) {
      playWinFanfare()
    }

    emit('score', score.value, computeStars())

    setTimeout(() => {
      startNewRound()
    }, 1500)
  } else {
    // Wrong
    picked.value = letter
    playSound('wrong')
    streak.value = 0
    speak('Tente de novo!')

    setTimeout(() => {
      if (round.value) {
        picked.value = null
      }
    }, 1200)
  }
}

watch(round, () => {
  if (round.value) {
    setTimeout(() => speak(round.value!.word.word, { rate: 0.75 }), 300)
  }
})

onMounted(() => {
  startNewRound()
})

onUnmounted(() => {
  if (score.value > 0) {
    emit('score', score.value, computeStars())
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-lime-50">
    <GameHeader
      title="Complete a Palavra"
      emoji="📝"
      color="#FFE66D"
      :score="score"
      @back="emit('back')"
    />

    <main class="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <!-- Streak badge in header area -->
      <div class="mb-4 text-center">
        <span v-if="streakBadge > 1" class="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-600">
          🔥 Sequência: {{ streakBadge }}
        </span>
        <span class="ml-2 text-sm font-bold text-amber-700">
          Palavras completas: {{ solved }}
        </span>
      </div>

      <div v-if="round" class="flex flex-col items-center gap-5">
        <!-- Bouncing emoji -->
        <div
          class="text-7xl sm:text-8xl select-none animate-bounce drop-shadow-md"
        >
          {{ round.word.emoji }}
        </div>

        <!-- Ouvir palavra button -->
        <button
          @click="handleSpeak"
          class="rounded-full bg-amber-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-amber-600 active:scale-95"
        >
          🔊 Ouvir palavra
        </button>

        <!-- Word display with ? for missing letter -->
        <div class="flex gap-1.5 items-end">
          <span
            v-for="(letter, i) in round.word.word.split('')"
            :key="i"
            class="inline-flex h-16 w-14 items-center justify-center rounded-xl text-3xl font-black shadow-sm transition-all duration-200 sm:h-18 sm:w-16 sm:text-4xl"
            :style="{
              background: i === round.missingIdx
                ? picked === letter
                  ? '#16a34a'
                  : picked && picked !== letter
                    ? '#ef4444'
                    : 'white'
                : 'white',
              color: i === round.missingIdx && !picked ? '#d1d5db' : '#1e293b',
              border: i === round.missingIdx
                ? '3px dashed #fbbf24'
                : '3px solid #e2e8f0',
            }"
          >
            <template v-if="i === round.missingIdx">
              {{ picked || '?' }}
            </template>
            <template v-else>
              {{ letter }}
            </template>
          </span>
        </div>

        <!-- 4 option buttons -->
        <div class="grid grid-cols-4 gap-3 mt-2">
          <button
            v-for="opt in round.options"
            :key="opt"
            @click="handlePick(opt)"
            class="w-20 h-20 rounded-2xl text-5xl font-black flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95"
            :style="{
              background: picked === opt
                ? opt === round.word.word[round.missingIdx]
                  ? '#16a34a'
                  : '#ef4444'
                : 'white',
              color: picked === opt ? 'white' : '#1e293b',
              border: picked === opt
                ? '3px solid ' + (opt === round.word.word[round.missingIdx] ? '#15803d' : '#b91c1c')
                : '3px solid #e2e8f0',
              boxShadow: picked === opt && opt === round.word.word[round.missingIdx]
                ? '0 0 20px rgba(22,163,74,0.5)'
                : 'none',
            }"
          >
            {{ opt }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>