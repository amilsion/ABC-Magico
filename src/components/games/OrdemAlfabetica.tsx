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

const COUNT = 4; // Quantas letras por rodada

interface Round {
  letters: { letter: string; color: string; originalIdx: number }[];
  targetOrder: string[]; // ordem alfabética esperada
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(): Round {
  const sorted = [...ALPHABET].sort(() => Math.random() - 0.5).slice(0, COUNT);
  // Garante que as letras não venham já em ordem
  const targetOrder = sorted
    .map((l) => l.letter)
    .sort((a, b) => a.localeCompare(b));
  let shuffled = shuffle(sorted);
  while (
    shuffled.every((l, i) => l.letter === targetOrder[i])
  ) {
    shuffled = shuffle(sorted);
  }
  return {
    letters: shuffled.map((l, i) => ({
      letter: l.letter,
      color: l.color,
      originalIdx: i,
    })),
    targetOrder,
  };
}

export function OrdemAlfabetica({ onBack, onScore }: Props) {
  const [round, setRound] = useState<Round | null>(null);
  const [picked, setPicked] = useState<number[]>([]); // índices selecionados (originalIdx)
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);

  const next = useCallback(() => {
    setRound(buildRound());
    setPicked([]);
    setWrongIdx(null);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    next();
  }, [next]);

  useEffect(() => {
    if (!round) return;
    const t = setTimeout(() => speak("Coloque as letras em ordem alfabética!", { rate: 0.9 }), 300);
    return () => clearTimeout(t);
  }, [round]);

  const handlePick = (originalIdx: number) => {
    if (!round) return;
    if (picked.includes(originalIdx)) return;
    const expected = round.targetOrder[picked.length];
    const pickedLetter = round.letters.find((l) => l.originalIdx === originalIdx)?.letter;
    if (pickedLetter === expected) {
      playSound("correct");
      speak(pickedLetter!, { rate: 0.7 });
      const newPicked = [...picked, originalIdx];
      setPicked(newPicked);
      const points = 8;
      const newScore = score + points;
      setScore(newScore);
      rewardStars(points);
      if (newPicked.length === COUNT) {
        playWinFanfare();
        const newN = solved + 1;
        setSolved(newN);
        onScore(newScore, newN >= 8 ? 3 : newN >= 4 ? 2 : 1);
        speak("Muito bem! Você colocou em ordem!", { rate: 0.85 });
        setTimeout(next, 1800);
      }
    } else {
      playSound("wrong");
      setWrongIdx(originalIdx);
      setAttempts((a) => a + 1);
      setTimeout(() => setWrongIdx(null), 500);
    }
  };

  if (!round) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50">
      <GameHeader
        title="Ordem Alfabética"
        emoji="📚"
        color="#C7CEEA"
        score={score}
        onBack={onBack}
      />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-4 text-center">
          <div className="text-base font-bold text-sky-800">
            Toque nas letras em ordem alfabética (A → Z)
          </div>
        </div>

        {/* Fileira onde aparecem as letras em ordem */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {Array.from({ length: COUNT }).map((_, i) => {
            const originalIdx = picked[i];
            const letter = round.letters.find((l) => l.originalIdx === originalIdx);
            return (
              <div
                key={i}
                className="flex h-16 w-14 sm:h-20 sm:w-16 items-center justify-center rounded-xl text-3xl sm:text-4xl font-black shadow-md"
                style={{
                  background: letter ? letter.color : "#f1f5f9",
                  color: letter ? "white" : "#cbd5e1",
                  border: `3px ${letter ? "solid" : "dashed"} ${letter ? letter.color : "#94a3b8"}`,
                }}
              >
                {letter ? letter.letter : "?"}
              </div>
            );
          })}
        </div>

        <div className="my-4 flex items-center justify-center gap-2 text-2xl text-sky-400">
          ↑ ↓
        </div>

        {/* Banco de letras */}
        <div className="flex flex-wrap justify-center gap-3">
          {round.letters.map((l) => {
            const isPicked = picked.includes(l.originalIdx);
            const isWrong = wrongIdx === l.originalIdx;
            return (
              <button
                key={l.originalIdx}
                onClick={() => handlePick(l.originalIdx)}
                disabled={isPicked}
                className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl text-5xl sm:text-6xl font-black shadow-lg transition hover:scale-105 active:scale-95"
                style={{
                  background: isPicked
                    ? "#e5e7eb"
                    : isWrong
                    ? "#ef4444"
                    : l.color,
                  color: isPicked
                    ? "#9ca3af"
                    : isWrong
                    ? "white"
                    : "white",
                  border: `4px solid ${
                    isPicked
                      ? "#d1d5db"
                      : isWrong
                      ? "#b91c1c"
                      : l.color
                  }`,
                  opacity: isPicked ? 0.5 : 1,
                }}
              >
                {l.letter}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center gap-3 text-sm font-bold text-sky-700">
          <span className="rounded-full bg-white px-4 py-1.5 shadow">
            Sequências completas: <span className="text-sky-900">{solved}</span>
          </span>
          <span className="rounded-full bg-white px-4 py-1.5 shadow">
            Erros: <span className="text-sky-900">{attempts}</span>
          </span>
        </div>
      </main>
    </div>
  );
}
