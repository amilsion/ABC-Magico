import { ref, computed, onMounted, watch } from 'vue'

const STORAGE_KEY = 'abc-magico-progress-v2'

export interface GameProgress {
  bestScore: number
  totalStars: number
  playsCount: number
}

export type ProgressMap = Record<string, GameProgress>

function readStorage(): ProgressMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ProgressMap) : {}
  } catch {
    return {}
  }
}

function writeStorage(data: ProgressMap) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

export function useProgress() {
  const progress = ref<ProgressMap>({})
  const hydrated = ref(false)

  onMounted(() => {
    progress.value = readStorage()
    hydrated.value = true
  })

  const updateGame = (gameId: string, score: number, starsEarned: number) => {
    const existing = progress.value[gameId] ?? { bestScore: 0, totalStars: 0, playsCount: 0 }
    const next: GameProgress = {
      bestScore: Math.max(existing.bestScore, score),
      totalStars: Math.max(existing.totalStars, starsEarned),
      playsCount: existing.playsCount + 1,
    }
    const updated = { ...progress.value, [gameId]: next }
    progress.value = updated
    writeStorage(updated)
  }

  const resetAll = () => {
    writeStorage({})
    progress.value = {}
  }

  const totalStars = computed(() =>
    Object.values(progress.value).reduce((sum, p) => sum + (p.totalStars || 0), 0)
  )
  const totalPlays = computed(() =>
    Object.values(progress.value).reduce((sum, p) => sum + (p.playsCount || 0), 0)
  )

  return { progress, hydrated, updateGame, resetAll, totalStars, totalPlays }
}