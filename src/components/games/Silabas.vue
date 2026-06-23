<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { SYLLABLE_WORDS, type SyllableWord } from '@/lib/literacy-data'
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

const round = ref<SyllableWord | null>(null)
const picked = ref<number | null>(null)
const score = ref(0)
const solved = ref(0)
const attempts = ref(0)
const clapCount = ref(0)
const clapping = ref(false)
let syllableTimers: ReturnType<typeof setTimeout>[] = []

const options = computed(() => {
  if (!round.value) return []
  const correct = round.value.syllables
  const counts = [...new Set(SYLLABLE_WORDS.map((w) => w.syllables))].sort((a, b) => a - b)
  const available = counts.filter((n) => n !== correct)
  const wrong = shuffle(available).slice(0, 3)
  return shuffle([correct, ...wrong])
})

function computeStars(): number {
  if (solved.value >= 8) return 3
  if (solved.value >= 4) return 2
  return 1
}

function clearSyllableTimers() {
  syllableTimers.forEach((t) => clearTimeout(t))
  syllableTimers = []
}

function buildRound() {
  clearSyllableTimers()
  picked.value = null
  clapCount.value = 0
  clapping.value = false

  const word = SYLLABLE_WORDS[Math.floor(Math.random() * SYLLABLE_WORDS.length)]
  round.value = word
}

function showClaps() {
  if (!round.value || clapping.value) return
  clapping.value = true
  clearSyllableTimers()

  const breakdown = round.value.syllableBreakdown
  breakdown.forEach((syllable, i) => {
    const t1 = setTimeout(() => {
      clapCount.value = i + 1
      playSound('pop')
      speak(syllable, { rate: 0.7 })
    }, i * 700)
    syllableTimers.push(t1)
  })

  const tEnd = setTimeout(() => {
    clapCount.value = 0
    clapping.value = false
  }, breakdown.length * 700 + 500)
  syllableTimers.push(tEnd)
}

function handlePick(n: number) {
  if (!round.value || picked.value !== null) return

  if (n === round.value.syllables) {
    // Correct
    picked.value = n
    playSound('correct')
    score.value += 10
    rewardStars(10)
    solved.value++

    speak(`${round.value.syllables} sílabas! Muito bem!`)

    if (solved.value % 5 === 0) {
      playWinFanfare()
    }

    emit('score', score.value, computeStars())

    setTimeout(() => {
      buildRound()
    }, 1800)
  } else {
    // Wrong
    picked.value = n
    attempts.value++
    playSound('wrong')
    speak('Quase!')

    setTimeout(() => {
      picked.value = null
    }, 1200)
  }
}

watch(round, () => {
  if (round.value) {
    setTimeout(() => speak(`Quantas sílabas tem ${round.value!.word}?`, { rate: 0.85 }), 300)
  }
})

onMounted(() => {
  buildRound()
})

onUnmounted(() => {
  clearSyllableTimers()
  if (score.value > 0) {
    emit('score', score.value, computeStars())
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-yellow-50 via-amber-50 to-orange-50">
    <GameHeader
      title="Sílabas"
      emoji="👏"
      color="#FFD93D"
      :score="score"
      @back="emit('back')"
    />

    <main class="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <div v-if="round" class="flex flex-col items-center gap-5">
        <!-- Bouncing emoji -->
        <div
          class="text-7xl sm:text-8xl select-none animate-bounce drop-shadow-md"
        >
          {{ round.emoji }}
        </div>

        <!-- Word button -->
        <div
          class="rounded-3xl bg-gradient-to-br from-amber-400 to-orange-400 px-8 py-4 text-3xl font-black text-white shadow-xl"
        >
          {{ round.word }}
        </div>

        <!-- Ouvir as sílabas button -->
        <button
          @click="showClaps"
          :disabled="clapping"
          class="rounded-full bg-amber-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-amber-600 active:scale-95 disabled:opacity-50"
        >
          👏 Ouvir as sílabas
        </button>

        <!-- Clap animation row (👏 + syllable labels) -->
        <div class="flex justify-center gap-2 flex-wrap">
          <span
            v-for="(syllable, i) in round.syllableBreakdown"
            :key="i"
            class="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-lg font-bold transition-all duration-200"
            :style="
              clapCount > i
                ? 'background: #fbbf24; color: #78350f; transform: scale(1.2); box-shadow: 0 4px 14px rgba(251,191,36,0.6)'
                : 'background: #f1f5f9; color: #94a3b8'
            "
          >
            👏 {{ syllable }}
          </span>
        </div>

        <!-- 4 option buttons (1-4 sílabas) -->
        <div class="flex flex-wrap justify-center gap-3 mt-2">
          <button
            v-for="n in options"
            :key="n"
            @click="handlePick(n)"
            class="w-24 h-24 rounded-2xl flex flex-col items-center justify-center text-center font-black shadow-lg transition-all duration-150 active:scale-90 hover:scale-105"
            :style="{
              background: picked === n
                ? n === round.syllables
                  ? '#16a34a'
                  : '#ef4444'
                : 'white',
              color: picked === n ? 'white' : '#1e293b',
              border: picked === n
                ? '3px solid ' + (n === round.syllables ? '#15803d' : '#b91c1c')
                : '3px solid #e2e8f0',
              boxShadow: picked === n && n === round.syllables
                ? '0 0 20px rgba(22,163,74,0.5)'
                : 'none',
            }"
          >
            <span class="text-4xl">{{ n }}</span>
            <span class="text-xs mt-0.5">sílaba{{ n > 1 ? 's' : '' }}</span>
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="mt-6 flex gap-6 text-sm font-bold text-amber-700 justify-center">
        <span>Acertos: {{ solved }}</span>
        <span>Tentativas: {{ attempts }}</span>
      </div>
    </main>
  </div>
</template>