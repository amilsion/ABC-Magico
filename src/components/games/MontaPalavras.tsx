"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { WORDS_EASY, WORDS_MEDIUM, WORDS_HARD, type WordItem } from "@/lib/literacy-data";
import { speak, playSound, playWinFanfare } from "@/lib/speech";
import { GameHeader } from "./GameHeader";
import { rewardStars } from "./StarReward";

interface Props {
  onBack: () => void;
  onScore: (score: number, stars: number) => void;
}

type Level = 1 | 2 | 3;

const LEVEL_WORDS: Record<Level, WordItem[]> = {
  1: WORDS_EASY,
  2: WORDS_MEDIUM,
  3: WORDS_HARD,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MontaPalavras({ onBack, onScore }: Props) {
  const [level, setLevel] = useState<Level>(1);
  const [wordIndex, setWordIndex] = useState(0);
  const [slots, setSlots] = useState<(string | null)[]>([]);
  const [bank, setBank] = useState<{ letter: string; id: number; used: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());

  const wordList = LEVEL_WORDS[level];
  const current = wordList[wordIndex % wordList.length];

  const setupWord = useCallback(
    (w: WordItem) => {
      const letters = w.word.split("");
      setSlots(Array(letters.length).fill(null));
      setBank(
        shuffle(
          letters.map((l, i) => ({ letter: l, id: i, used: false }))
        )
      );
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setupWord(current);
  }, [current, setupWord]);

  const isComplete = slots.length > 0 && slots.every((s) => s !== null);

  const checkWord = useCallback(() => {
    const formed = slots.join("");
    if (formed === current.word) {
      playWinFanfare();
      const points = 10 + level * 5;
      const newScore = score + points;
      setScore(newScore);
      rewardStars(points);
      setSolved((n) => n + 1);
      const newSolvedIds = new Set(solvedIds);
      newSolvedIds.add(`${level}-${current.word}`);
      setSolvedIds(newSolvedIds);
      const uniqueSolved = newSolvedIds.size;
      onScore(newScore, uniqueSolved >= 6 ? 3 : uniqueSolved >= 3 ? 2 : 1);
      setTimeout(() => {
        speak(`Muito bem! ${current.word}!`, { rate: 0.85 });
      }, 400);
      setTimeout(() => {
        setWordIndex((i) => i + 1);
      }, 2200);
    } else {
      playSound("wrong");
      // Limpa os slots errados
      setTimeout(() => {
        setSlots(Array(current.word.length).fill(null));
        setBank((prev) => prev.map((b) => ({ ...b, used: false })));
      }, 600);
    }
  }, [slots, current, level, score, onScore, solvedIds]);

  useEffect(() => {
    if (isComplete) {
      const t = setTimeout(() => checkWord(), 400);
      return () => clearTimeout(t);
    }
  }, [isComplete, checkWord]);

  const placeLetter = (id: number, letter: string) => {
    const emptyIdx = slots.findIndex((s) => s === null);
    if (emptyIdx === -1) return;
    playSound("pop");
    setSlots((prev) => {
      const copy = [...prev];
      copy[emptyIdx] = letter;
      return copy;
    });
    setBank((prev) => prev.map((b) => (b.id === id ? { ...b, used: true } : b)));
  };

  const removeLetter = (slotIdx: number) => {
    const letter = slots[slotIdx];
    if (!letter) return;
    playSound("click");
    setSlots((prev) => {
      const copy = [...prev];
      copy[slotIdx] = null;
      return copy;
    });
    // Libera a primeira letra correspondente usada
    setBank((prev) => {
      const copy = [...prev];
      const target = copy.find((b) => b.used && b.letter === letter);
      if (target) target.used = false;
      return copy;
    });
  };

  const changeLevel = (l: Level) => {
    setLevel(l);
    setWordIndex(0);
    setSolved(0);
    setSolvedIds(new Set());
    playSound("click");
  };

  const hintBtn = () => {
    speak(`A palavra é ${current.word}.`, { rate: 0.75 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-teal-50 to-emerald-50">
      <GameHeader
        title="Monta Palavras"
        emoji="🧩"
        color="#4ECDC4"
        score={score}
        onBack={onBack}
      />

      <main className="mx-auto max-w-3xl px-4 py-5 sm:py-7">
        {/* Seletor de nível */}
        <div className="mb-5 flex flex-wrap justify-center gap-2">
          {([
            { l: 1 as Level, label: "🌱 Fácil", color: "#10b981" },
            { l: 2 as Level, label: "🌿 Médio", color: "#f59e0b" },
            { l: 3 as Level, label: "🌳 Difícil", color: "#ef4444" },
          ]).map((lv) => (
            <button
              key={lv.l}
              onClick={() => changeLevel(lv.l)}
              className="rounded-full px-4 py-2 text-sm font-bold shadow-md transition hover:scale-105 active:scale-95"
              style={{
                background: level === lv.l ? lv.color : "white",
                color: level === lv.l ? "white" : lv.color,
                border: `2px solid ${lv.color}`,
              }}
            >
              {lv.label}
            </button>
          ))}
        </div>

        {/* Imagem + dica */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-7xl sm:text-8xl drop-shadow-md select-none animate-[bounce_2s_ease-in-out_infinite]">
            {current.emoji}
          </div>
          <div className="rounded-full bg-white px-5 py-2 text-base sm:text-lg font-bold text-teal-700 shadow">
            {current.hint}
          </div>
          <button
            onClick={hintBtn}
            className="rounded-full bg-teal-500 px-5 py-2 text-sm font-bold text-white shadow transition hover:scale-105 active:scale-95"
          >
            🔊 Ouvir dica
          </button>
        </div>

        {/* Slots */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {slots.map((s, i) => (
            <button
              key={i}
              onClick={() => s && removeLetter(i)}
              className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-white text-3xl sm:text-4xl font-black text-teal-700 shadow-md transition hover:bg-teal-50"
              style={{
                border: s ? "3px solid #14b8a6" : "3px dashed #5eead4",
                background: s ? "#f0fdfa" : "white",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Banco de letras */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {bank.map((b) => (
            <button
              key={b.id}
              onClick={() => !b.used && placeLetter(b.id, b.letter)}
              disabled={b.used}
              className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl text-3xl sm:text-4xl font-black shadow-md transition"
              style={{
                background: b.used ? "#e2e8f0" : "white",
                color: b.used ? "#cbd5e1" : "#0f766e",
                border: "3px solid #14b8a6",
                transform: b.used ? "scale(0.85)" : "scale(1)",
                cursor: b.used ? "default" : "pointer",
              }}
            >
              {b.letter}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="mt-6 text-center text-sm font-bold text-teal-700">
          Palavras formadas: <span className="text-teal-900">{solved}</span> | Dica: arraste as
          letras para os espaços. Toque numa letra colocada para remover.
        </div>
      </main>
    </div>
  );
}
