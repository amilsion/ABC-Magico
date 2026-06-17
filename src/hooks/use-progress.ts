"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "abc-magico-progress-v2";

export interface GameProgress {
  bestScore: number;
  totalStars: number;
  playsCount: number;
}

export type ProgressMap = Record<string, GameProgress>;

function readStorage(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function writeStorage(data: ProgressMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(readStorage());
    setHydrated(true);
  }, []);

  const updateGame = useCallback(
    (gameId: string, score: number, starsEarned: number) => {
      setProgress((prev) => {
        const existing = prev[gameId] ?? { bestScore: 0, totalStars: 0, playsCount: 0 };
        const next: GameProgress = {
          bestScore: Math.max(existing.bestScore, score),
          totalStars: Math.max(existing.totalStars, starsEarned),
          playsCount: existing.playsCount + 1,
        };
        const updated = { ...prev, [gameId]: next };
        writeStorage(updated);
        return updated;
      });
    },
    []
  );

  const resetAll = useCallback(() => {
    writeStorage({});
    setProgress({});
  }, []);

  const totalStars = Object.values(progress).reduce((sum, p) => sum + (p.totalStars || 0), 0);
  const totalPlays = Object.values(progress).reduce((sum, p) => sum + (p.playsCount || 0), 0);

  return { progress, hydrated, updateGame, resetAll, totalStars, totalPlays };
}
