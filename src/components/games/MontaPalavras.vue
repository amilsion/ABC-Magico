<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { WORDS_EASY, WORDS_MEDIUM, WORDS_HARD, type WordItem } from '@/lib/literacy-data'
import { speak, playSound, playWinFanfare } from '@/lib/speech'
import GameHeader from '@/components/games/GameHeader.vue'
import { rewardStars } from '@/components/StarReward.vue'

const emit = defineEmits<{ back: []; score: [score: number, stars: number] }>()

type Level = 1 | 2 | 3
const LEVEL_WORDS: Record<Level, WordItem[]> = {
  1: WORDS_EASY,
  2: WORDS_MEDIUM,
  3: WORDS_HARD,
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const level = ref<Level>(1)
const wordIndex = ref(0)
const slots = ref<(string | null)[]>([])
const bank = ref<{ letter: string; id: number; used: boolean }[]>([])
const score = ref(0)
const solved = ref(0)
const solvedIds = ref(new Set<string>())

const wordList = computed(() => LEVEL_WORDS[level.value])
const current = computed(() => wordList.value[wordIndex.value % wordList.value.length])
const isComplete = computed(() => slots.value.length > 0 && slots.value.every((s) => s !== null))

function setupWord(w: WordItem) {
  const letters = w.word.split('')
  slots.value = Array(letters.length).fill(null)
  bank.value = shuffle(letters.map((letter, id) => ({ letter, id, used: false })))
}

watch(current, (w) => setupWord(w), { immediate: true })

watch(isComplete, (val) => {
  if (!val) return
  const timer = setTimeout(() => checkWord(), 400)
  return () => clearTimeout(timer)
})

function checkWord() {
  const formed = slots.value.join('')
  if (formed === current.value.word) {
    playWinFanfare()
    const points = 10 + level.value * 5
    score.value += points
    rewardStars(points)
    solved.value++
    solvedIds.value.add(`${level.value}-${current.value.word}`)
    emit('score', score.value, solvedIds.value.size >= 6 ? 3 : solvedIds.value.size >= 3 ? 2 : 1)
    setTimeout(() => speak(`Muito bem! ${current.value.word}!`, { rate: 0.85 }), 400)
    setTimeout(() => (wordIndex.value += 1), 2200)
  } else {
    playSound('wrong')
    setTimeout(() => {
      slots.value = Array(current.value.word.length).fill(null)
      bank.value = bank.value.map((b) => ({ ...b, used: false }))
    }, 600)
  }
}

function placeLetter(id: number, letter: string) {
  const emptyIdx = slots.value.findIndex((s) => s === null)
  if (emptyIdx === -1) return
  playSound('pop')
  slots.value[emptyIdx] = letter
  bank.value = bank.value.map((b) => (b.id === id ? { ...b, used: true } : b))
}

function removeLetter(slotIdx: number) {
  const letter = slots.value[slotIdx]
  if (!letter) return
  playSound('click')
  slots.value[slotIdx] = null
  const target = bank.value.find((b) => b.used && b.letter === letter)
  if (target) target.used = false
}

function changeLevel(l: Level) {
  level.value = l
  wordIndex.value = 0
  solved.value = 0
  solvedIds.value = new Set()
  playSound('click')
}

const levels = [
  { l: 1 as Level, label: '🌱 Fácil', color: '#10b981' },
  { l: 2 as Level, label: '🌿 Médio', color: '#f59e0b' },
  { l: 3 as Level, label: '🌳 Difícil', color: '#ef4444' },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-cyan-50 via-teal-50 to-emerald-50">
    <GameHeader title="Monta Palavras" emoji="🧩" color="#4ECDC4" :score="score" @back="emit('back')" />

    <main class="mx-auto max-w-3xl px-4 py-5 sm:py-7">
      <!-- Level selector -->
      <div class="mb-5 flex flex-wrap justify-center gap-2">
        <button
          v-for="lv in levels"
          :key="lv.l"
          class="rounded-full px-4 py-2 text-sm font-bold shadow-md transition hover:scale-105 active:scale-95"
          :style="{
            background: level === lv.l ? lv.color : 'white',
            color: level === lv.l ? 'white' : lv.color,
            border: `2px solid ${lv.color}`,
          }"
          @click="changeLevel(lv.l)"
        >
          {{ lv.label }}
        </button>
      </div>

      <!-- Emoji, hint, and listen button -->
      <div class="flex flex-col items-center gap-3">
        <div
          class="text-7xl sm:text-8xl select-none animate-[bounce_2s_ease-in-out_infinite] drop-shadow-md"
        >
          {{ current.emoji }}
        </div>
        <div class="rounded-full bg-white px-5 py-2 text-base font-bold text-teal-700 shadow sm:text-lg">
          {{ current.hint }}
        </div>
        <button
          class="rounded-full bg-teal-500 px-5 py-2 text-sm font-bold text-white shadow transition hover:scale-105 active:scale-95"
          @click="speak(`A palavra é ${current.word}.`, { rate: 0.75 })"
        >
          🔊 Ouvir dica
        </button>
      </div>

      <!-- Slots row (answer area) -->
      <div class="mt-6 flex flex-wrap justify-center gap-2">
        <button
          v-for="(s, i) in slots"
          :key="i"
          class="flex h-14 w-14 items-center justify-center rounded-xl text-3xl font-black text-teal-700 shadow-md transition hover:bg-teal-50 sm:h-16 sm:w-16 sm:text-4xl"
          :style="{
            border: s ? '3px solid #14b8a6' : '3px dashed #5eead4',
            background: s ? '#f0fdfa' : 'white',
          }"
          @click="s && removeLetter(i)"
        >
          {{ s }}
        </button>
      </div>

      <!-- Bank row (letter buttons) -->
      <div class="mt-6 flex flex-wrap justify-center gap-2">
        <button
          v-for="b in bank"
          :key="b.id"
          class="flex h-14 w-14 items-center justify-center rounded-xl text-3xl font-black shadow-md transition sm:h-16 sm:w-16 sm:text-4xl"
          :style="{
            background: b.used ? '#e2e8f0' : 'white',
            color: b.used ? '#cbd5e1' : '#0f766e',
            border: '3px solid #14b8a6',
            transform: b.used ? 'scale(0.85)' : 'scale(1)',
            cursor: b.used ? 'default' : 'pointer',
          }"
          :disabled="b.used"
          @click="!b.used && placeLetter(b.id, b.letter)"
        >
          {{ b.letter }}
        </button>
      </div>

      <!-- Status text -->
      <div class="mt-6 text-center text-sm font-bold text-teal-700">
        Palavras formadas: <span class="text-teal-900">{{ solved }}</span> · Dica: toque numa
        letra colocada para remover.
      </div>
    </main>
  </div>
</template>