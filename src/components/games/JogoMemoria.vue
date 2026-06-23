<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ALPHABET } from '@/lib/literacy-data'
import { speak, playSound, playWinFanfare } from '@/lib/speech'
import { rewardStars } from '@/components/StarReward.vue'
import GameHeader from '@/components/games/GameHeader.vue'

const emit = defineEmits<{
  back: []
  score: [score: number, stars: number]
}>()

const LEVELS = [
  { level: 1, pairs: 4, cols: 4, label: 'Iniciante' },
  { level: 2, pairs: 6, cols: 4, label: 'Fácil' },
  { level: 3, pairs: 8, cols: 4, label: 'Médio' },
  { level: 4, pairs: 10, cols: 5, label: 'Difícil' },
  { level: 5, pairs: 13, cols: 5, label: 'Mestre' },
]

interface Card {
  id: number
  letter: string
  kind: 'upper' | 'lower'
  emoji: string
  color: string
  flipped: boolean
  matched: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const levelIdx = ref(0)
const deck = ref<Card[]>([])
const flipped = ref<number[]>([])
const moves = ref(0)
const matches = ref(0)
const score = ref(0)
const rounds = ref(0)
const lock = ref(false)
const completedLevels = ref(new Set<number>())
const showLevelUp = ref(false)

const currentLevel = computed(() => LEVELS[levelIdx.value])
const maxPairs = computed(() => currentLevel.value.pairs)
const unlockedLevels = computed(() => {
  let count = 1
  for (let i = 1; i < LEVELS.length; i++) {
    if (completedLevels.value.has(i - 1)) count++
    else break
  }
  return count
})

function computeStars(): number {
  if (rounds.value >= 3) return 3
  if (rounds.value >= 1) return 2
  return 1
}

function buildDeck(pairs: number) {
  const shuffledLetters = shuffle([...ALPHABET]).slice(0, pairs)
  const cardPairs: Card[] = []
  let id = 0
  for (const l of shuffledLetters) {
    cardPairs.push({
      id: id++,
      letter: l.letter,
      kind: 'upper',
      emoji: l.emoji,
      color: l.color,
      flipped: false,
      matched: false,
    })
    cardPairs.push({
      id: id++,
      letter: l.lower,
      kind: 'lower',
      emoji: l.emoji,
      color: l.color,
      flipped: false,
      matched: false,
    })
  }
  return shuffle(cardPairs)
}

function newGame() {
  deck.value = buildDeck(currentLevel.value.pairs)
  flipped.value = []
  lock.value = false
  matches.value = 0
  moves.value = 0
  showLevelUp.value = false
}

function handleClick(cardId: number) {
  if (lock.value) return
  const card = deck.value.find((c) => c.id === cardId)
  if (!card) return
  if (card.flipped || card.matched) return

  playSound('pop')
  card.flipped = true
  flipped.value = [...flipped.value, cardId]

  if (flipped.value.length === 2) {
    moves.value++
    lock.value = true
    const [id1, id2] = flipped.value
    const c1 = deck.value.find((c) => c.id === id1)!
    const c2 = deck.value.find((c) => c.id === id2)!

    // Match: same emoji, different kind (upper vs lower)
    if (c1.emoji === c2.emoji && c1.kind !== c2.kind) {
      setTimeout(() => {
        c1.matched = true
        c2.matched = true
        matches.value++
        const points = 10 + levelIdx.value * 3
        score.value += points
        playSound('correct')
        rewardStars(points)
        speak(c1.letter.toUpperCase())
        flipped.value = []
        lock.value = false

        if (matches.value === maxPairs.value) {
          handleLevelComplete()
        }
      }, 400)
    } else {
      setTimeout(() => {
        c1.flipped = false
        c2.flipped = false
        flipped.value = []
        lock.value = false
      }, 1100)
    }
  }
}

function handleLevelComplete() {
  playWinFanfare()
  completedLevels.value = new Set([...completedLevels.value, levelIdx.value])
  rounds.value++
  showLevelUp.value = true
  emit('score', score.value, computeStars())

  setTimeout(() => {
    showLevelUp.value = false
    const nextLvl = (levelIdx.value + 1) % LEVELS.length
    levelIdx.value = nextLvl
  }, 2800)
}

function selectLevel(lvlIdx: number) {
  if (lvlIdx > unlockedLevels.value - 1) return
  playSound('click')
  levelIdx.value = lvlIdx
}

watch(levelIdx, () => {
  newGame()
  speak(`Nível ${LEVELS[levelIdx.value].label}. Encontre os pares!`, { rate: 0.85 })
})

onMounted(() => {
  newGame()
})

onUnmounted(() => {
  if (score.value > 0) {
    emit('score', score.value, computeStars())
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-violet-50 via-purple-50 to-indigo-50">
    <GameHeader
      title="Jogo da Memória"
      emoji="🧠"
      color="#AA96DA"
      :score="score"
      @back="emit('back')"
    />

    <main class="mx-auto max-w-2xl px-4 py-5 sm:py-7">
      <!-- Level selector -->
      <div class="mb-4 flex flex-wrap justify-center gap-2">
        <button
          v-for="(lvl, i) in LEVELS"
          :key="lvl.level"
          @click="selectLevel(i)"
          :disabled="i > unlockedLevels - 1"
          class="rounded-full px-4 py-2 text-sm font-bold shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-30"
          :style="{
            background: i === levelIdx ? '#7c3aed' : 'white',
            color: i === levelIdx ? 'white' : '#7c3aed',
            border: '2px solid #7c3aed',
          }"
        >
          {{ lvl.level }}. {{ lvl.label }}
          <span v-if="completedLevels.has(i)"> ✓</span>
        </button>
      </div>

      <!-- Status bar -->
      <div class="mb-3 flex items-center justify-center gap-4 text-sm font-bold text-violet-700">
        <span class="inline-block rounded-full bg-white px-4 py-1.5 shadow">
          Pares: {{ matches }} / {{ maxPairs }}
        </span>
        <span class="inline-block rounded-full bg-white px-4 py-1.5 shadow">
          Jogadas: {{ moves }}
        </span>
      </div>

      <!-- Hint -->
      <p class="mb-4 text-center text-xs italic text-violet-400">
        Encontre os pares: MAIÚSCULA ↔ minúscula
      </p>

      <!-- Card grid -->
      <div
        class="mx-auto grid max-w-md gap-2"
        :style="{ gridTemplateColumns: `repeat(${currentLevel.cols}, 1fr)` }"
      >
        <button
          v-for="card in deck"
          :key="card.id"
          @click="handleClick(card.id)"
          class="aspect-square rounded-xl text-center shadow-md transition-all duration-300 active:scale-95"
          :class="{
            'opacity-50 pointer-events-none': card.matched,
          }"
          :style="
            card.flipped || card.matched
              ? { background: card.color, color: 'white' }
              : { background: '#7c3aed', color: 'white' }
          "
        >
          <template v-if="card.flipped || card.matched">
            <div class="flex flex-col items-center justify-center h-full">
              <span class="text-xs leading-none mb-0.5 sm:text-sm">{{ card.emoji }}</span>
              <span class="text-xl font-black leading-none sm:text-3xl">{{ card.letter }}</span>
            </div>
          </template>
          <template v-else>
            <div class="flex h-full items-center justify-center">
              <span class="text-2xl sm:text-3xl">❓</span>
            </div>
          </template>
        </button>
      </div>

      <!-- Footer stats -->
      <div class="mt-5 text-center text-sm font-bold text-violet-600">
        Rodadas completas: {{ rounds }} · Níveis desbloqueados: {{ unlockedLevels }} / 5
      </div>
    </main>

    <!-- Level-up modal overlay -->
    <Transition name="fade">
      <div
        v-if="showLevelUp"
        class="fixed inset-0 z-30 flex items-center justify-center bg-black/40"
        @click.stop
      >
        <div class="rounded-3xl bg-white px-10 py-8 text-center shadow-2xl animate-bounce">
          <p class="text-5xl mb-2">🎉</p>
          <p class="text-2xl font-black text-gray-800">Nível Completo!</p>
          <p class="mt-1 text-sm text-gray-500">
            Próximo: {{ LEVELS[(levelIdx + 1) % LEVELS.length].label }}
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>