<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ALPHABET } from '@/lib/literacy-data'
import { speak, playSound } from '@/lib/speech'
import { rewardStars } from '@/components/StarReward.vue'
import GameHeader from '@/components/games/GameHeader.vue'

const emit = defineEmits<{
  back: []
  score: [score: number, stars: number]
}>()

const index = ref(0)
const visited = ref(new Set<number>([0]))
const score = ref(0)
const speaking = ref(false)

const current = computed(() => ALPHABET[index.value])

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function computeStars(size: number): number {
  if (size >= 26) return 3
  if (size >= 14) return 2
  return 1
}

function markVisited(i: number) {
  if (visited.value.has(i)) return
  const next = new Set(visited.value)
  next.add(i)
  visited.value = next
  const newScore = score.value + 5
  score.value = newScore
  rewardStars(5)
  playSound('correct')
  emit('score', newScore, computeStars(next.size))
}

/* ------------------------------------------------------------------ */
/*  Speech                                                             */
/* ------------------------------------------------------------------ */

const speakAll = () => {
  speaking.value = true
  playSound('click')
  speak(`${current.value.letter}. ${current.value.word}.`, { rate: 0.8 })
  setTimeout(() => (speaking.value = false), 1800)
}

const speakWord = () => {
  speaking.value = true
  playSound('click')
  speak(current.value.word, { rate: 0.7 })
  setTimeout(() => (speaking.value = false), 1500)
}

const speakLetter = () => {
  speaking.value = true
  playSound('click')
  speak(current.value.letter, { rate: 0.6 })
  setTimeout(() => (speaking.value = false), 1000)
}

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */

const goNext = () => {
  const next = (index.value + 1) % ALPHABET.length
  index.value = next
  markVisited(next)
  playSound('pop')
}

const goPrev = () => {
  index.value = (index.value - 1 + ALPHABET.length) % ALPHABET.length
  playSound('pop')
}

const jumpTo = (i: number) => {
  if (i === index.value) return
  index.value = i
  markVisited(i)
  playSound('pop')
}

/* ------------------------------------------------------------------ */
/*  Auto-speak on letter change                                        */
/* ------------------------------------------------------------------ */

watch(index, () => {
  setTimeout(() => speak(`${current.value.letter}.`, { rate: 0.75 }), 150)
})

onMounted(() => {
  setTimeout(() => speak(`${current.value.letter}.`, { rate: 0.75 }), 150)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-rose-50 via-orange-50 to-amber-50">
    <GameHeader
      title="ABC Vivo"
      emoji="🔠"
      color="#FF6B6B"
      :score="score"
      @back="emit('back')"
    />

    <main class="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <!-- Letter card -->
      <div
        class="relative overflow-hidden rounded-3xl p-6 sm:p-10 shadow-xl"
        :style="{
          background: `linear-gradient(135deg, ${current.color}33, ${current.color}11)`,
          border: `4px solid ${current.color}`,
        }"
      >
        <div class="flex flex-col items-center gap-4">
          <!-- Uppercase + lowercase letter -->
          <div
            class="flex h-32 w-32 sm:h-44 sm:w-44 items-center justify-center rounded-3xl text-7xl sm:text-9xl font-black shadow-inner"
            :style="{
              background: 'white',
              color: current.color,
              textShadow: `0 4px 0 ${current.color}55`,
            }"
          >
            {{ current.letter }}
            <span
              class="ml-1 text-5xl sm:text-7xl"
              :style="{ color: current.color }"
            >{{ current.lower }}</span>
          </div>

          <!-- Emoji -->
          <div class="text-7xl sm:text-9xl drop-shadow-md select-none">
            {{ current.emoji }}
          </div>

          <!-- Word badge -->
          <div
            class="rounded-full px-6 py-2 text-2xl sm:text-3xl font-extrabold text-white shadow-md"
            :style="{ background: current.color }"
          >
            {{ current.word }}
          </div>

          <!-- Voice wave animation bars -->
          <div class="flex h-6 items-end gap-1" aria-hidden="true">
            <span
              v-for="i in 5"
              :key="i"
              class="w-1.5 rounded-full transition-all duration-200"
              :style="{
                background: current.color,
                height: speaking ? undefined : '4px',
                animation: speaking
                  ? `wave 0.6s ease-in-out ${i * 0.08}s infinite`
                  : 'none',
              }"
            />
          </div>
        </div>
      </div>

      <!-- Audio buttons -->
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <button
          @click="speakAll"
          class="rounded-full bg-rose-500 px-6 py-3 text-lg font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
        >
          🔊 Ouvir
        </button>
        <button
          @click="speakWord"
          class="rounded-full bg-amber-500 px-6 py-3 text-lg font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
        >
          🗣️ Palavra
        </button>
        <button
          @click="speakLetter"
          class="rounded-full bg-teal-500 px-6 py-3 text-lg font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
        >
          🔤 Letra
        </button>
      </div>

      <!-- Prev / Next navigation -->
      <div class="mt-6 flex items-center justify-between gap-4">
        <button
          @click="goPrev"
          class="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl font-bold text-rose-500 shadow-md transition hover:scale-110 active:scale-95"
          aria-label="Letra anterior"
        >
          ◀
        </button>
        <div class="text-lg font-bold text-rose-700">
          {{ index + 1 }}
          <span class="text-rose-300">/</span>
          {{ ALPHABET.length }}
        </div>
        <button
          @click="goNext"
          class="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-2xl font-bold text-white shadow-md transition hover:scale-110 active:scale-95"
          aria-label="Próxima letra"
        >
          ▶
        </button>
      </div>

      <!-- Letter selection grid -->
      <div class="mt-6">
        <div class="mb-2 text-center text-sm font-bold text-rose-700">
          Letras visitadas: {{ visited.size }} / {{ ALPHABET.length }}
        </div>
        <div class="flex flex-wrap justify-center gap-1.5">
          <button
            v-for="(l, i) in ALPHABET"
            :key="l.letter"
            @click="jumpTo(i)"
            class="flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold transition"
            :style="{
              background: visited.has(i) ? l.color : '#f1f5f9',
              color: visited.has(i) ? 'white' : '#94a3b8',
              border: i === index ? '2px solid #1e293b' : '2px solid transparent',
            }"
          >
            {{ l.letter }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@keyframes wave {
  0%,
  100% {
    height: 8px;
  }
  50% {
    height: 28px;
  }
}
</style>