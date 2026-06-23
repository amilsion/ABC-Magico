<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ALPHABET } from '@/lib/literacy-data'
import { speak, playSound, playWinFanfare } from '@/lib/speech'
import { rewardStars } from '@/components/StarReward.vue'
import GameHeader from '@/components/games/GameHeader.vue'

const emit = defineEmits<{
  back: []
  score: [score: number, stars: number]
}>()

const CARD_SIZE = 9

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Cell {
  letter: string
  emoji: string
  color: string
  marked: boolean
}

const card = ref<Cell[]>([])
const called = ref<string | null>(null)
const score = ref(0)
const markedCount = ref(0)
const bingo = ref(false)
const rounds = ref(0)
const wrongFlash = ref<number | null>(null)
let autoDrawTimer: ReturnType<typeof setTimeout> | null = null
let newGameTimer: ReturnType<typeof setTimeout> | null = null

function computeStars(): number {
  if (rounds.value >= 2) return 3
  if (rounds.value >= 1) return 2
  return 1
}

function clearTimers() {
  if (autoDrawTimer) { clearTimeout(autoDrawTimer); autoDrawTimer = null }
  if (newGameTimer) { clearTimeout(newGameTimer); newGameTimer = null }
}

function buildCard() {
  clearTimers()
  bingo.value = false
  markedCount.value = 0
  called.value = null
  wrongFlash.value = null

  const picked = shuffle([...ALPHABET]).slice(0, CARD_SIZE)
  card.value = picked.map((p) => ({
    letter: p.letter,
    emoji: p.emoji,
    color: p.color,
    marked: false,
  }))

  // Auto-draw first letter
  drawNext(card.value)
}

function drawNext(currentCard: Cell[]) {
  if (bingo.value) return

  const unmarked = currentCard.filter((c) => !c.marked)
  let drawn: string

  if (unmarked.length > 0 && Math.random() < 0.7) {
    // 70% chance: pick from unmarked on card
    const pick = unmarked[Math.floor(Math.random() * unmarked.length)]
    drawn = pick.letter
  } else {
    // 30% chance: random
    drawn = ALPHABET[Math.floor(Math.random() * ALPHABET.length)].letter
  }

  called.value = drawn
  speak(`Letra ${drawn}`, { rate: 0.7 })
}

function handleRepeat() {
  if (called.value) {
    speak(`Letra ${called.value}`, { rate: 0.7 })
  }
}

function nextDraw() {
  if (bingo.value) return
  clearTimers()
  drawNext(card.value)
}

function handleMark(i: number) {
  if (bingo.value) return
  if (!called.value) return
  if (card.value[i].marked) return
  if (wrongFlash.value !== null) return

  const cell = card.value[i]

  if (called.value === cell.letter) {
    // Correct mark
    card.value[i] = { ...cell, marked: true }
    markedCount.value++
    score.value += 10
    rewardStars(10)
    playSound('correct')
    speak(`Letra ${cell.letter}!`)

    // Check bingo (all 9 marked)
    if (markedCount.value >= CARD_SIZE) {
      bingo.value = true
      rounds.value++
      score.value += 50
      rewardStars(50)
      playWinFanfare()
      speak('Bingo!')
      emit('score', score.value, computeStars())

      // New game after 3s
      newGameTimer = setTimeout(() => {
        buildCard()
      }, 3000)
    } else {
      // Auto-draw next letter after 1.2s
      autoDrawTimer = setTimeout(() => {
        drawNext(card.value)
      }, 1200)
    }
  } else {
    // Wrong
    wrongFlash.value = i
    playSound('wrong')

    setTimeout(() => {
      wrongFlash.value = null
    }, 500)
  }
}

onMounted(() => {
  buildCard()
})

onUnmounted(() => {
  clearTimers()
  if (score.value > 0) {
    emit('score', score.value, computeStars())
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-orange-50 via-red-50 to-rose-50 relative">
    <GameHeader
      title="Bingo das Letras"
      emoji="🎯"
      color="#FF9F68"
      :score="score"
      @back="emit('back')"
    />

    <main class="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <!-- Instruction -->
      <p class="mb-4 text-center text-sm font-bold text-orange-700">
        Escute a letra sorteada e marque na sua cartela!
      </p>

      <!-- Called letter display (big 7xl) -->
      <div v-if="called" class="mb-4 flex flex-col items-center gap-1">
        <span class="text-xs font-bold text-orange-400 uppercase tracking-wider">Letra sorteada:</span>
        <div
          class="flex h-28 w-28 items-center justify-center rounded-3xl bg-orange-400 text-7xl font-black text-white shadow-xl"
          style="box-shadow: 0 8px 30px rgba(251,146,60,0.5)"
        >
          {{ called }}
        </div>
        <span class="text-2xl">
          {{ ALPHABET.find((a) => a.letter === called)?.emoji || '' }}
        </span>
      </div>

      <!-- Repetir / Sortear outra buttons -->
      <div class="mb-6 flex justify-center gap-3">
        <button
          @click="handleRepeat"
          class="rounded-full bg-rose-400 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-rose-300 active:scale-95"
        >
          🔊 Repetir
        </button>
        <button
          @click="nextDraw"
          :disabled="bingo"
          class="rounded-full bg-indigo-400 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-300 active:scale-95 disabled:opacity-40"
        >
          ↻ Sortear outra
        </button>
      </div>

      <!-- 3x3 Bingo card -->
      <div class="flex justify-center">
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="(cell, idx) in card"
            :key="idx"
            @click="handleMark(idx)"
            class="w-24 h-24 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg transition-all duration-150 active:scale-90 hover:scale-105"
            :class="{
              'opacity-60 cursor-default': cell.marked && !bingo,
            }"
            :style="{
              background: cell.marked ? cell.color : wrongFlash === idx ? '#ef4444' : '#f1f5f9',
              boxShadow: cell.marked
                ? `0 0 16px ${cell.color}66`
                : wrongFlash === idx
                  ? '0 0 20px rgba(239,68,68,0.6)'
                  : '0 4px 14px rgba(0,0,0,0.08)',
              animation: wrongFlash === idx ? 'shake 0.4s ease' : 'none',
            }"
          >
            <span class="text-3xl">{{ cell.emoji }}</span>
            <span
              class="text-2xl font-black"
              :style="{ color: cell.marked ? 'white' : '#475569' }"
            >
              {{ cell.letter }}
            </span>
            <span v-if="cell.marked" class="text-sm font-bold text-white">✓</span>
          </button>
        </div>
      </div>

      <!-- Progress -->
      <div class="mt-6 flex gap-6 text-sm font-bold text-orange-700 justify-center">
        <span>Marcadas: {{ markedCount }} / {{ CARD_SIZE }}</span>
        <span>Bingos: {{ rounds }}</span>
      </div>
    </main>

    <!-- BINGO bounce text overlay -->
    <Transition name="bounce">
      <div
        v-if="bingo"
        class="fixed inset-0 z-30 flex items-center justify-center bg-black/30"
        @click.stop
      >
        <div class="rounded-3xl bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400 px-12 py-8 text-center shadow-2xl animate-bounce">
          <p class="text-5xl font-black text-white drop-shadow-lg" style="text-shadow: 2px 2px 0 rgba(0,0,0,0.2)">
            🎉 BINGO! 🎉
          </p>
          <p class="text-lg font-bold text-white/90 mt-2">+50 pontos bônus!</p>
        </div>
      </div>
    </Transition>
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

.bounce-enter-active {
  animation: bounceIn 0.5s ease;
}
.bounce-leave-active {
  animation: bounceIn 0.3s ease reverse;
}
@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>