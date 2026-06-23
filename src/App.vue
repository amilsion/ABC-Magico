<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { GAME_LIST, type GameId } from '@/lib/literacy-data'
import { useProgress } from '@/hooks/useProgress'
import { playSound } from '@/lib/speech'
import GameShell from '@/components/GameShell.vue'
import Confetti from '@/components/Confetti.vue'
import StarReward from '@/components/StarReward.vue'

import ABCVivo from '@/components/games/ABCVivo.vue'
import MontaPalavras from '@/components/games/MontaPalavras.vue'
import CacaLetras from '@/components/games/CacaLetras.vue'
import CacaPalavras from '@/components/games/CacaPalavras.vue'
import EscrevaLetra from '@/components/games/EscrevaLetra.vue'
import JogoMemoria from '@/components/games/JogoMemoria.vue'
import CompletePalavra from '@/components/games/CompletePalavra.vue'
import OrdemAlfabetica from '@/components/games/OrdemAlfabetica.vue'
import Silabas from '@/components/games/Silabas.vue'
import QualLetra from '@/components/games/QualLetra.vue'
import BingoLetras from '@/components/games/BingoLetras.vue'

const active = ref<GameId | null>(null)
const confettiTrigger = ref(0)
const { progress, updateGame, totalStars, totalPlays, hydrated, resetAll } = useProgress()

const lastStarMilestone = ref(0)
watch(totalStars, (val) => {
  if (!hydrated.value) return
  const milestone = Math.floor(val / 50)
  if (milestone > lastStarMilestone.value && milestone > 0) {
    confettiTrigger.value++
  }
  lastStarMilestone.value = milestone
})

const handleScore = (gameId: string) => (score: number, stars: number) => {
  updateGame(gameId, score, stars)
  if (stars >= 3) {
    confettiTrigger.value++
  }
}

const goMenu = () => {
  active.value = null
  playSound('click')
}

const selectGame = (id: GameId) => {
  active.value = id
  playSound('pop')
}

const handleReset = () => {
  if (confirm('Apagar todo o progresso?')) {
    resetAll()
    playSound('click')
  }
}
</script>

<template>
  <GameShell>
    <Confetti :trigger="confettiTrigger" />
    <StarReward />

    <!-- Game View -->
    <template v-if="active">
      <ABCVivo
        v-if="active === 'abc'"
        @back="goMenu"
        @score="handleScore('abc')"
      />
      <MontaPalavras
        v-else-if="active === 'words'"
        @back="goMenu"
        @score="handleScore('words')"
      />
      <CompletePalavra
        v-else-if="active === 'complete'"
        @back="goMenu"
        @score="handleScore('complete')"
      />
      <CacaLetras
        v-else-if="active === 'hunt'"
        @back="goMenu"
        @score="handleScore('hunt')"
      />
      <CacaPalavras
        v-else-if="active === 'wordsearch'"
        @back="goMenu"
        @score="handleScore('wordsearch')"
      />
      <EscrevaLetra
        v-else-if="active === 'draw'"
        @back="goMenu"
        @score="handleScore('draw')"
      />
      <JogoMemoria
        v-else-if="active === 'memory'"
        @back="goMenu"
        @score="handleScore('memory')"
      />
      <OrdemAlfabetica
        v-else-if="active === 'order'"
        @back="goMenu"
        @score="handleScore('order')"
      />
      <Silabas
        v-else-if="active === 'syllables'"
        @back="goMenu"
        @score="handleScore('syllables')"
      />
      <QualLetra
        v-else-if="active === 'whatsletter'"
        @back="goMenu"
        @score="handleScore('whatsletter')"
      />
      <BingoLetras
        v-else-if="active === 'bingo'"
        @back="goMenu"
        @score="handleScore('bingo')"
      />
    </template>

    <!-- Menu View -->
    <div v-else class="min-h-screen bg-gradient-to-br from-rose-100 via-amber-50 to-cyan-100">
      <!-- Header -->
      <header class="relative overflow-hidden bg-gradient-to-r from-rose-400 via-purple-400 to-cyan-400 px-4 py-8 text-center text-white shadow-xl">
        <div
          class="absolute inset-0 opacity-20"
          :style="{
            backgroundImage: 'radial-gradient(circle at 20% 30%, white 2px, transparent 2px), radial-gradient(circle at 60% 70%, white 2px, transparent 2px), radial-gradient(circle at 80% 20%, white 2px, transparent 2px)',
            backgroundSize: '120px 120px, 90px 90px, 150px 150px',
          }"
        />
        <div class="relative">
          <h1 class="text-4xl sm:text-6xl font-black tracking-tight drop-shadow-md">
            🔤 ABC Mágico
          </h1>
          <p class="mt-2 text-lg sm:text-2xl font-bold opacity-95 drop-shadow">
            Aprenda brincando! 🌟
          </p>
          <div v-if="hydrated" class="mt-4 flex flex-wrap items-center justify-center gap-3 text-base sm:text-lg font-bold">
            <span class="rounded-full bg-white/25 px-4 py-1.5 backdrop-blur-sm">
              ⭐ {{ totalStars }} estrelas
            </span>
            <span class="rounded-full bg-white/25 px-4 py-1.5 backdrop-blur-sm">
              🎮 {{ totalPlays }} partidas
            </span>
            <button
              v-if="totalStars > 0"
              @click="handleReset"
              class="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white/90 hover:bg-white/25"
            >
              🗑️ Resetar
            </button>
          </div>
        </div>
      </header>

      <!-- Game Menu -->
      <main class="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <h2 class="mb-5 text-center text-2xl sm:text-3xl font-black text-slate-700">
          Escolha um jogo! 🎮
        </h2>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="(g, i) in GAME_LIST"
            :key="g.id"
            @click="selectGame(g.id)"
            class="group relative overflow-hidden rounded-3xl bg-white p-5 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95"
            :style="{
              border: `4px solid ${g.color}`,
              animation: `cardIn 0.4s ease-out ${i * 0.05}s both`,
            }"
          >
            <div
              class="absolute inset-x-0 top-0 h-2"
              :style="{ background: g.color }"
            />

            <div class="flex items-start gap-4 pt-2">
              <div
                class="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl text-4xl sm:text-5xl shadow-md transition-transform group-hover:scale-110 group-hover:rotate-6"
                :style="{ background: `${g.color}22` }"
              >
                {{ g.emoji }}
              </div>
              <div class="flex-1">
                <h3
                  class="text-lg sm:text-xl font-black leading-tight"
                  :style="{ color: g.color }"
                >
                  {{ g.name }}
                </h3>
                <p class="mt-1 text-sm text-slate-600 leading-snug">
                  {{ g.description }}
                </p>
                <div v-if="hydrated && progress[g.id] && progress[g.id].totalStars > 0" class="mt-2 flex items-center gap-1.5">
                  <span class="text-amber-500">⭐</span>
                  <span class="text-xs font-bold text-slate-500">
                    Melhor: {{ progress[g.id].bestScore }} pts · {{ progress[g.id].totalStars }}★
                  </span>
                </div>
                <div v-else-if="hydrated" class="mt-2">
                  <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-400">
                    Novo!
                  </span>
                </div>
              </div>
            </div>

            <div
              class="mt-3 flex items-center justify-end text-sm font-bold opacity-0 transition-opacity group-hover:opacity-100"
              :style="{ color: g.color }"
            >
              Jogar →
            </div>
          </button>
        </div>

        <!-- Footer -->
        <footer class="mt-10 border-t-2 border-dashed border-slate-200 pt-5 text-center">
          <p class="text-sm text-slate-500">
            Feito com 💜 para crianças de 3 a 7 anos · Versão Vue.js portada do{" "}
            <a
              href="https://github.com/amilsion/ABC-Magico"
              target="_blank"
              rel="noopener noreferrer"
              class="font-bold text-purple-600 underline hover:text-purple-800"
            >
              repositório original de Amilson Monção
            </a>
          </p>
          <p class="mt-2 text-xs text-slate-400">
            {{ GAME_LIST.length }} jogos disponíveis · Dica: ative o som do dispositivo! 🔊
          </p>
        </footer>
      </main>
    </div>
  </GameShell>
</template>