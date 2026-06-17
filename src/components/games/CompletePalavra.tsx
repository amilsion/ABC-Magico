"use client";

import { useEffect, useState, useCallback } from "react";
import { ALL_WORDS, ALPHABET, type WordItem } from "@/lib/literacy-data";
import { speak, playSound, playWinFanfare } from "@/lib/speech";
import { GameHeader } from "./GameHeader";
import { rewardStars } from "./StarReward";

interface Props {
  onBack: () => void;
  onScore: (score: number, stars: number) => void;
}

interface Round {
  word: WordItem;
  missingIdx: number;
  options: string[];
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
  const word = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
  const letters = word.word.split("");
  // Escolhe um índice que não seja o último (para deixar mais interessante)
  const missingIdx = Math.floor(Math.random() * letters.length);
  const missing = letters[missingIdx];

  // Gera 3 distratores
  const distractors = new Set<string>();
  while (distractors.size < 3) {
    const r = ALPHABET[Math.floor(Math.random() * 26)].letter;
    if (r !== missing) distractors.add(r);
  }
  const options = shuffle([missing, ...distractors]);
  return { word, missingIdx, options };
}

export function CompletePalavra({ onBack, onScore }: Props) {
  const [round, setRound] = useState<Round | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState(0);

  const next = useCallback(() => {
    setRound(buildRound());
    setPicked(null);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    next();
  }, [next]);

  useEffect(() => {
    if (!round) return;
    const t = setTimeout(() => speak(round.word.word, { rate: 0.75 }), 300);
    return () => clearTimeout(t);
  }, [round]);

  const handlePick = (letter: string) => {
    if (picked || !round) return;
    setPicked(letter);
    const correct = letter === round.word.word[round.missingIdx];
    if (correct) {
      playSound("correct");
      const points = 10 + Math.min(streak, 5) * 2;
      const newScore = score + points;
      setScore(newScore);
      rewardStars(points);
      setStreak((s) => s + 1);
      const newN = solved + 1;
      setSolved(newN);
      onScore(newScore, newN >= 10 ? 3 : newN >= 5 ? 2 : 1);
      speak(`${round.word.word}! Muito bem!`, { rate: 0.85 });
      if (streak + 1 >= 5 && (streak + 1) % 5 === 0) {
        playWinFanfare();
      }
      setTimeout(next, 1500);
    } else {
      playSound("wrong");
      setStreak(0);
      speak(`Tente de novo! A letra é ${round.word.word[round.missingIdx]}`, { rate: 0.85 });
      setTimeout(() => setPicked(null), 1200);
    }
  };

  if (!round) return null;

  const letters = round.word.word.split("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-lime-50">
      <GameHeader
        title="Complete a Palavra"
        emoji="📝"
        color="#FFE66D"
        score={score}
        onBack={onBack}
        rightSlot={
          streak > 1 ? (
            <span className="rounded-full bg-orange-400 px-2 py-1 text-xs font-bold text-white">
              🔥 {streak}
            </span>
          ) : undefined
        }
      />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-4 text-center text-base font-bold text-amber-800">
          Qual letra está faltando?
        </div>

        {/* Imagem + palavra com lacuna */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-7xl sm:text-8xl drop-shadow-md select-none animate-[bounce_2s_ease-in-out_infinite]">
            {round.word.emoji}
          </div>
          <button
            onClick={() => speak(round.word.word, { rate: 0.7 })}
            className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-700 hover:bg-amber-200"
          >
            🔊 Ouvir palavra
          </button>

          <div className="flex flex-wrap justify-center gap-2">
            {letters.map((l, i) => {
              const isMissing = i === round.missingIdx;
              const filled = isMissing ? picked : l;
              const isCorrect = isMissing && picked === l;
              const isWrong = isMissing && picked && picked !== l;
              return (
                <div
                  key={i}
                  className="flex h-16 w-14 sm:h-20 sm:w-16 items-center justify-center rounded-xl text-4xl sm:text-5xl font-black shadow-md"
                  style={{
                    background: isMissing
                      ? isCorrect
                        ? "#10b981"
                        : isWrong
                        ? "#ef4444"
                        : "#fef3c7"
                      : "white",
                    color: isMissing
                      ? isCorrect
                        ? "white"
                        : isWrong
                        ? "white"
                        : "#d97706"
                      : "#78350f",
                    border: `3px ${
                      isMissing ? "dashed" : "solid"
                    } ${isMissing ? "#f59e0b" : "#fde68a"}`,
                  }}
                >
                  {isMissing && !filled ? "?" : filled}
                </div>
              );
            })}
          </div>
        </div>

        {/* Opções */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {round.options.map((opt) => {
            const isPicked = picked === opt;
            const isCorrect = opt === round.word.word[round.missingIdx];
            return (
              <button
                key={opt}
                onClick={() => handlePick(opt)}
                disabled={!!picked}
                className="flex h-20 w-20 items-center justify-center rounded-2xl text-5xl font-black shadow-lg transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
                style={{
                  background: picked
                    ? isCorrect
                      ? "#10b981"
                      : isPicked
                      ? "#ef4444"
                      : "#e5e7eb"
                    : "white",
                  color: picked
                    ? isCorrect || isPicked
                      ? "white"
                      : "#9ca3af"
                    : "#92400e",
                  border: `4px solid ${
                    picked
                      ? isCorrect
                        ? "#047857"
                        : isPicked
                        ? "#b91c1c"
                        : "#d1d5db"
                      : "#fbbf24"
                  }`,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div className="mt-6 text-center text-sm font-bold text-amber-700">
          Palavras completas: {solved}
        </div>
      </main>
    </div>
  );
}
