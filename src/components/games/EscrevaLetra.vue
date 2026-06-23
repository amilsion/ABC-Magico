<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ALPHABET } from '@/lib/literacy-data'
import { speak, playSound, playWinFanfare } from '@/lib/speech'
import { rewardStars } from '@/components/StarReward.vue'
import GameHeader from '@/components/games/GameHeader.vue'

const emit = defineEmits<{
  back: []
  score: [score: number, stars: number]
}>()

const index = ref(0)
const score = ref(0)
const attempts = ref(0)
const canvasRef = ref<HTMLCanvasElement>()
const drawing = ref(false)
const hasDrawn = ref(false)
let dpr = 1

const currentLetter = computed(() => ALPHABET[index.value])

function computeStars(): number {
  if (score.value >= 100) return 3
  if (score.value >= 50) return 2
  return 1
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const container = canvas.parentElement
  if (!container) return
  dpr = window.devicePixelRatio || 1
  const rect = container.getBoundingClientRect()
  const w = rect.width
  const h = rect.height
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 18
    ctx.strokeStyle = '#1e40af'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }
  drawGhost()
}

function clearCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.restore()
}

function drawGhost() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width / dpr
  const h = canvas.height / dpr
  const fontSize = Math.min(w, h) * 0.65
  ctx.save()
  ctx.font = `bold ${fontSize}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#cbd5e1'
  ctx.fillText(currentLetter.value.letter, w / 2, h / 2)
  ctx.restore()
}

function getCanvasPos(e: PointerEvent) {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

function startDraw(e: PointerEvent) {
  drawing.value = true
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.setPointerCapture(e.pointerId)

  if (!hasDrawn.value) {
    clearCanvas()
  }

  hasDrawn.value = true
  const pos = getCanvasPos(e)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.beginPath()
  ctx.moveTo(pos.x, pos.y)
}

function moveDraw(e: PointerEvent) {
  if (!drawing.value) return
  const canvas = canvasRef.value
  if (!canvas) return
  const pos = getCanvasPos(e)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
}

function endDraw() {
  drawing.value = false
}

function handleClear() {
  playSound('click')
  clearCanvas()
  const ctx = canvasRef.value?.getContext('2d')
  if (ctx) {
    ctx.save()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.lineWidth = 18
    ctx.strokeStyle = '#1e40af'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.restore()
  }
  drawGhost()
  hasDrawn.value = false
}

function next() {
  if (!hasDrawn.value) return
  score.value += 5
  rewardStars(5)
  playSound('correct')
  emit('score', score.value, computeStars())

  if (index.value < 25) {
    index.value++
    hasDrawn.value = false
  }
}

function prev() {
  if (index.value > 0) {
    index.value--
    hasDrawn.value = false
  }
}

let resizeHandler: (() => void) | null = null

onMounted(() => {
  nextTick(() => {
    resizeCanvas()
    speak(`Escreva a letra ${currentLetter.value.letter}`)
  })
  resizeHandler = () => resizeCanvas()
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  if (score.value > 0) emit('score', score.value, computeStars())
})

watch(index, () => {
  nextTick(() => {
    resizeCanvas()
    speak(`Escreva a letra ${currentLetter.value.letter}`)
  })
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-fuchsia-50">
    <GameHeader
      title="Escreva a Letra"
      emoji="✏️"
      color="#F38181"
      :score="score"
      @back="emit('back')"
    />

    <main class="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <!-- Target letter display -->
      <div class="mb-4 flex flex-col items-center gap-2">
        <div class="rounded-full bg-rose-500 px-6 py-2 text-base font-bold text-white shadow-lg">
          Escreva a letra:
        </div>
        <div
          class="flex h-28 w-28 items-center justify-center rounded-3xl bg-white text-7xl font-black text-rose-600 shadow-xl"
          style="border: 4px solid #f43f5e"
        >
          {{ currentLetter.letter }}
        </div>
      </div>

      <!-- Canvas area -->
      <div class="mx-auto max-w-sm aspect-square">
        <div class="relative h-full w-full overflow-hidden rounded-3xl border-4 border-dashed border-rose-200 bg-white shadow-lg">
          <canvas
            ref="canvasRef"
            class="absolute inset-0 h-full w-full cursor-crosshair touch-none"
            @pointerdown="startDraw"
            @pointermove="moveDraw"
            @pointerup="endDraw"
            @pointerleave="endDraw"
          />
        </div>
      </div>

      <!-- Hint -->
      <p class="mt-3 text-center text-xs italic text-rose-400">
        Dica: a letra cinza é um modelo. Escreva por cima com o dedo ou mouse!
      </p>

      <!-- Action buttons -->
      <div class="mt-5 flex justify-center gap-3">
        <button
          @click="handleClear"
          class="rounded-full bg-rose-200 px-6 py-3 text-lg font-bold text-rose-700 shadow-md transition hover:bg-rose-300 active:scale-95"
        >
          🗑️ Limpar
        </button>
        <button
          @click="next"
          class="rounded-full bg-rose-500 px-6 py-3 text-lg font-bold text-white shadow-md transition hover:bg-rose-600 active:scale-95 disabled:opacity-50"
          :disabled="!hasDrawn"
        >
          ✓ Próxima
        </button>
      </div>

      <!-- Navigation -->
      <div class="mt-5 flex items-center justify-center gap-6">
        <button
          @click="prev"
          :disabled="index === 0"
          class="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-xl font-bold text-rose-600 shadow transition hover:bg-rose-200 active:scale-95 disabled:opacity-30"
        >
          ◀
        </button>
        <span class="text-lg font-bold text-rose-700">
          {{ index + 1 }} <span class="text-rose-300">/</span> 26
        </span>
        <button
          @click="next"
          :disabled="index === 25"
          class="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-xl font-bold text-white shadow transition hover:bg-rose-600 active:scale-95 disabled:opacity-30"
        >
          ▶
        </button>
      </div>

      <!-- Status -->
      <div class="mt-4 text-center text-sm text-rose-600">
        Tentativas: {{ attempts }} · Letras escritas: {{ Math.floor(score / 5) }}
      </div>
    </main>
  </div>
</template>