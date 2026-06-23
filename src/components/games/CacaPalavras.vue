<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { WORDS_EASY } from '@/lib/literacy-data'
import { speak, playSound, playWinFanfare } from '@/lib/speech'
import { rewardStars } from '@/components/StarReward.vue'
import GameHeader from '@/components/games/GameHeader.vue'

const emit = defineEmits<{ back: []; score: [score: number, stars: number] }>()

const GRID_SIZE = 8
const NUM_WORDS = 4

interface Cell { letter: string; selected: boolean; inWord: boolean; wrong: boolean }
interface PlacedWord { word: string; cells: { row: number; col: number }[]; found: boolean }
interface Pos { row: number; col: number }

const DIRECTIONS = [
  { dr: 0, dc: 1 },   // right
  { dr: 1, dc: 0 },   // down
  { dr: 1, dc: 1 },   // diagonal-down-right
  { dr: 0, dc: -1 },  // left
]

function pickWords(): string[] {
  const shuffled = [...WORDS_EASY].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, NUM_WORDS).map((w) => w.word)
}

function buildGrid(words: string[]) {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''))
  const placed: PlacedWord[] = []

  const canPlace = (word: string, row: number, col: number, dir: { dr: number; dc: number }) => {
    for (let i = 0; i < word.length; i++) {
      const r = row + dir.dr * i
      const c = col + dir.dc * i
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false
      if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false
    }
    return true
  }

  for (const word of words) {
    let placedFlag = false
    for (let attempt = 0; attempt < 50 && !placedFlag; attempt++) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
      const maxR = dir.dr === 1 ? GRID_SIZE - word.length : GRID_SIZE - 1
      const minR = dir.dr === -1 ? word.length - 1 : 0
      const maxC = dir.dc === 1 ? GRID_SIZE - word.length : GRID_SIZE - 1
      const minC = dir.dc === -1 ? word.length - 1 : 0
      const row = minR + Math.floor(Math.random() * (maxR - minR + 1))
      const col = minC + Math.floor(Math.random() * (maxC - minC + 1))
      if (canPlace(word, row, col, dir)) {
        const cells: Pos[] = []
        for (let i = 0; i < word.length; i++) {
          const r = row + dir.dr * i
          const c = col + dir.dc * i
          grid[r][c] = word[i]
          cells.push({ row: r, col: c })
        }
        placed.push({ word, cells, found: false })
        placedFlag = true
      }
    }
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === '') grid[r][c] = letters[Math.floor(Math.random() * 26)]
    }
  }

  return { grid, placed }
}

const grid = ref<string[][]>([])
const placed = ref<PlacedWord[]>([])
const cells = ref<Cell[][]>([])
const score = ref(0)
const foundCount = ref(0)
const rounds = ref(0)
const selecting = ref(false)
const selStart = ref<Pos | null>(null)
const selEnd = ref<Pos | null>(null)

function startNew() {
  const words = pickWords()
  const { grid: g, placed: p } = buildGrid(words)
  grid.value = g
  placed.value = p
  cells.value = g.map((row) =>
    row.map((letter) => ({ letter, selected: false, inWord: false, wrong: false }))
  )
  foundCount.value = 0
}

function computeStars(): number {
  if (foundCount.value >= NUM_WORDS) return 3
  if (foundCount.value >= 2) return 2
  return 1
}

// Flatten cells for rendering
const flatCells = computed(() => {
  const result: { cell: Cell; row: number; col: number }[] = []
  for (let r = 0; r < cells.value.length; r++) {
    for (let ci = 0; ci < (cells.value[r]?.length || 0); ci++) {
      result.push({ cell: cells.value[r][ci], row: r, col: ci })
    }
  }
  return result
})

function getLine(start: Pos, end: Pos): Pos[] {
  const dr = end.row - start.row
  const dc = end.col - start.col
  if (dr === 0 && dc === 0) return [start]
  const isHoriz = dr === 0
  const isVert = dc === 0
  const isDiag = Math.abs(dr) === Math.abs(dc)
  if (!isHoriz && !isVert && !isDiag) return [start]
  const len = Math.max(Math.abs(dr), Math.abs(dc)) + 1
  const sr = Math.sign(dr)
  const sc = Math.sign(dc)
  return Array.from({ length: len }, (_, i) => ({
    row: start.row + sr * i,
    col: start.col + sc * i,
  }))
}

const highlighted = computed(() => {
  if (!selecting.value || !selStart.value || !selEnd.value) return new Set<string>()
  const line = getLine(selStart.value, selEnd.value)
  return new Set(line.map((p) => `${p.row}-${p.col}`))
})

function handleDown(pos: Pos) {
  selecting.value = true
  selStart.value = pos
  selEnd.value = pos
}

function handleEnter(pos: Pos) {
  if (selecting.value && selStart.value) selEnd.value = pos
}

function handleUp() {
  if (!selecting.value || !selStart.value || !selEnd.value) {
    selecting.value = false
    return
  }
  const line = getLine(selStart.value, selEnd.value)
  const formed = line.map((p) => grid.value[p.row]?.[p.col] || '').join('')
  const reversed = formed.split('').reverse().join('')
  const matched = placed.value.find(
    (p) => !p.found && (p.word === formed || p.word === reversed)
  )

  if (matched) {
    playSound('correct')
    speak(matched.word, { rate: 0.85 })
    const newScore = score.value + 15
    score.value = newScore
    rewardStars(15)
    const hlSet = new Set(line.map((p) => `${p.row}-${p.col}`))
    cells.value = cells.value.map((row, r) =>
      row.map((c, ci) =>
        hlSet.has(`${r}-${ci}`) ? { ...c, inWord: true, selected: false } : c
      )
    )
    placed.value = placed.value.map((p) =>
      p.word === matched.word ? { ...p, found: true } : p
    )
    const newFound = foundCount.value + 1
    foundCount.value = newFound
    emit('score', newScore, computeStars())
    if (newFound >= NUM_WORDS) {
      playWinFanfare()
      setTimeout(() => {
        rounds.value++
        startNew()
      }, 1800)
    }
  } else {
    playSound('wrong')
    const hlSet = new Set(line.map((p) => `${p.row}-${p.col}`))
    cells.value = cells.value.map((row, r) =>
      row.map((c, ci) =>
        hlSet.has(`${r}-${ci}`) ? { ...c, wrong: true, selected: false } : c
      )
    )
    setTimeout(() => {
      cells.value = cells.value.map((row) =>
        row.map((c) => ({ ...c, wrong: false, selected: false }))
      )
    }, 400)
  }

  selecting.value = false
  selStart.value = null
  selEnd.value = null
}

function cellStyle(c: Cell, r: number, ci: number) {
  const isHL = highlighted.value.has(`${r}-${ci}`)
  return {
    background: c.inWord ? '#10b981' : c.wrong ? '#ef4444' : isHL ? '#fdba74' : 'white',
    color: c.inWord || c.wrong ? 'white' : '#7c2d12',
    border: `2px solid ${c.inWord ? '#047857' : c.wrong ? '#b91c1c' : '#fed7aa'}`,
  }
}

onMounted(() => {
  startNew()
})

onUnmounted(() => {
  if (score.value > 0) {
    emit('score', score.value, computeStars())
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50">
    <GameHeader
      title="Caça Palavras"
      emoji="🆎"
      color="#FFA07A"
      :score="score"
      @back="emit('back')"
    />

    <main class="mx-auto max-w-2xl px-4 py-5 sm:py-7">
      <div class="mb-3 text-center text-sm font-bold text-orange-700">
        Arraste (ou clique e segure) para selecionar as palavras!
      </div>

      <!-- Word list badges -->
      <div class="mb-4 flex flex-wrap justify-center gap-2">
        <span
          v-for="p in placed"
          :key="p.word"
          class="rounded-full px-3 py-1.5 text-sm font-bold transition"
          :style="{
            background: p.found ? '#10b981' : 'white',
            color: p.found ? 'white' : '#c2410c',
            border: '2px solid #fb923c',
            textDecoration: p.found ? 'line-through' : 'none',
          }"
        >
          {{ p.word }}
        </span>
      </div>

      <!-- 8x8 Grid -->
      <div
        class="mx-auto grid select-none gap-1 touch-none"
        :style="{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, maxWidth: 'min(420px, 92vw)' }"
        @pointerleave="selecting = false"
        @pointerup="handleUp"
        @touchend.prevent="handleUp"
      >
        <button
          v-for="{ cell: c, row: r, col: ci } in flatCells"
          :key="`${r}-${ci}`"
          @pointerdown="handleDown({ row: r, col: ci })"
          @pointerenter="handleEnter({ row: r, col: ci })"
          class="flex aspect-square items-center justify-center rounded-md text-base sm:text-lg font-black shadow-sm transition"
          :style="cellStyle(c, r, ci)"
        >
          {{ c.letter }}
        </button>
      </div>

      <!-- Status -->
      <div class="mt-5 text-center">
        <div class="inline-block rounded-full bg-white px-5 py-2 text-base font-bold text-orange-700 shadow">
          Encontradas: <span class="text-orange-900">{{ foundCount }}</span> / {{ NUM_WORDS }}
        </div>
        <div class="mt-2 text-sm text-orange-600">Rodadas: {{ rounds }}</div>
      </div>
    </main>
  </div>
</template>