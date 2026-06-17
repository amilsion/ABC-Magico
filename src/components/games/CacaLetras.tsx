"use client";

import { useEffect, useState, useCallback } from "react";
import { ALPHABET } from "@/lib/literacy-data";
import { speak, playSound, playWinFanfare } from "@/lib/speech";
import { GameHeader } from "./GameHeader";
import { rewardStars } from "./StarReward";

interface Props {
  onBack: () => void;
  onScore: (score: number, stars: number) => void;
}

interface Cell {
  letter: string;
  isTarget: boolean;
  found: boolean;
  wrong: boolean;
}

const GRID_SIZE = 36; // 6x6

function buildGrid(target: string): Cell[] {
  const cells: Cell[] = [];
  const targetCount = 5;
  // Posiciona o alvo em 5 células aleatórias
  const positions = new Set<number>();
  while (positions.size < targetCount) {
    positions.add(Math.floor(Math.random() * GRID_SIZE));
  }
  for (let i = 0; i < GRID_SIZE; i++) {
    const isTarget = positions.has(i);
    cells.push({
      letter: isTarget ? target : ALPHABET[Math.floor(Math.random() * 26)].letter,
      isTarget,
      found: false,
      wrong: false,
    });
  }
  return cells;
}

export function CacaLetras({ onBack, onScore }: Props) {
  const [targetIdx, setTargetIdx] = useState(0);
  const [cells, setCells] = useState<Cell[]>([]);
  const [found, setFound] = useState(0);
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const TARGET_COUNT = 5;

  const target = ALPHABET[targetIdx].letter;

  const reset = useCallback(
    (idx: number) => {
      setCells(buildGrid(ALPHABET[idx].letter));
      setFound(0);
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reset(targetIdx);
  }, [targetIdx, reset]);

  useEffect(() => {
    // Anuncia o alvo ao trocar
    speak(`Encontre a letra ${ALPHABET[targetIdx].letter}`, { rate: 0.85 });
  }, [targetIdx]);

  const handleClick = (i: number) => {
    const cell = cells[i];
    if (cell.found) return;
    if (cell.isTarget) {
      playSound("correct");
      speak(cell.letter, { rate: 0.7 });
      const newCells = [...cells];
      newCells[i] = { ...cell, found: true };
      setCells(newCells);
      const newFound = found + 1;
      setFound(newFound);
      const points = 5;
      const newScore = score + points;
      setScore(newScore);
      rewardStars(points);

      if (newFound >= TARGET_COUNT) {
        playWinFanfare();
        setTimeout(() => {
          setTotalRounds((r) => r + 1);
          setTargetIdx((i) => (i + 1) % ALPHABET.length);
        }, 1500);
      }
      onScore(newScore, newFound >= TARGET_COUNT ? 3 : newFound >= 3 ? 2 : 1);
    } else {
      playSound("wrong");
      const newCells = [...cells];
      newCells[i] = { ...cell, wrong: true };
      setCells(newCells);
      setTimeout(() => {
        setCells((prev) => {
          const copy = [...prev];
          copy[i] = { ...copy[i], wrong: false };
          return copy;
        });
      }, 400);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50">
      <GameHeader
        title="Caça Letras"
        emoji="🔍"
        color="#95E1D3"
        score={score}
        onBack={onBack}
      />
      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Alvo */}
        <div className="mb-5 flex flex-col items-center gap-2">
          <div className="rounded-full bg-emerald-500 px-6 py-3 text-lg font-bold text-white shadow-lg">
            Encontre a letra:
          </div>
          <button
            onClick={() => speak(`Letra ${target}`, { rate: 0.7 })}
            className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white text-7xl font-black text-emerald-600 shadow-xl"
            style={{ border: "4px solid #10b981" }}
          >
            {target}
          </button>
          <button
            onClick={() => setTargetIdx((i) => (i + 1) % ALPHABET.length)}
            className="mt-1 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold text-emerald-700 hover:bg-emerald-200"
          >
            ↻ Trocar letra
          </button>
        </div>

        {/* Grade */}
        <div className="mx-auto grid max-w-md grid-cols-6 gap-2">
          {cells.map((c, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              disabled={c.found}
              className="flex aspect-square items-center justify-center rounded-lg text-2xl sm:text-3xl font-black shadow-sm transition"
              style={{
                background: c.found
                  ? "#10b981"
                  : c.wrong
                  ? "#ef4444"
                  : "white",
                color: c.found
                  ? "white"
                  : c.wrong
                  ? "white"
                  : "#0f766e",
                border: c.found
                  ? "3px solid #047857"
                  : c.wrong
                  ? "3px solid #b91c1c"
                  : "3px solid #a7f3d0",
                transform: c.found ? "scale(0.95)" : "scale(1)",
              }}
            >
              {c.letter}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="mt-6 text-center">
          <div className="inline-block rounded-full bg-white px-5 py-2 text-base font-bold text-emerald-700 shadow">
            Encontradas: <span className="text-emerald-900">{found}</span> / {TARGET_COUNT}
          </div>
          <div className="mt-2 text-sm text-emerald-600">
            Rodadas completas: {totalRounds}
          </div>
        </div>
      </main>
    </div>
  );
}
