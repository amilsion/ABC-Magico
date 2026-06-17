"use client";

import { useEffect, useState, useCallback } from "react";
import { INITIAL_LETTER_WORDS } from "@/lib/literacy-data";
import { speak, playSound, playWinFanfare } from "@/lib/speech";
import { GameHeader } from "./GameHeader";
import { rewardStars } from "./StarReward";

interface Props {
  onBack: () => void;
  onScore: (score: number, stars: number) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ALPHABET_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function buildRound() {
  const word = INITIAL_LETTER_WORDS[Math.floor(Math.random() * INITIAL_LETTER_WORDS.length)];
  const correct = word.hint;
  const distractors = new Set<string>();
  while (distractors.size < 3) {
    const r = ALPHABET_LETTERS[Math.floor(Math.random() * 26)];
    if (r !== correct) distractors.add(r);
  }
  return {
    word,
    options: shuffle([correct, ...distractors]),
    correct,
  };
}

export function QualLetra({ onBack, onScore }: Props) {
  const [round, setRound] = useState<ReturnType<typeof buildRound> | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

  const next = useCallback(() => {
    setRound(buildRound());
    setPicked(null);
    setHasPlayed(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    next();
  }, [next]);

  // Auto-toca o som da palavra quando começa a rodada
  useEffect(() => {
    if (!round) return;
    const t = setTimeout(() => {
      speak(round.word.word, { rate: 0.75 });
      setHasPlayed(true);
    }, 400);
    return () => clearTimeout(t);
  }, [round]);

  const playWord = () => {
    if (!round) return;
    speak(round.word.word, { rate: 0.7 });
  };

  const handlePick = (letter: string) => {
    if (picked !== null || !round) return;
    setPicked(letter);
    if (letter === round.correct) {
      playSound("correct");
      const points = 12;
      const newScore = score + points;
      setScore(newScore);
      rewardStars(points);
      const newN = solved + 1;
      setSolved(newN);
      onScore(newScore, newN >= 10 ? 3 : newN >= 5 ? 2 : 1);
      speak(`Começa com ${letter}! Muito bem!`, { rate: 0.85 });
      if (newN >= 5 && newN % 5 === 0) playWinFanfare();
      setTimeout(next, 1700);
    } else {
      playSound("wrong");
      setAttempts((a) => a + 1);
      speak(`Quase! Ouça de novo.`, { rate: 0.85 });
      setTimeout(() => {
        setPicked(null);
        playWord();
      }, 1300);
    }
  };

  if (!round) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-lime-50 via-green-50 to-emerald-50">
      <GameHeader
        title="Qual é a Letra?"
        emoji="🎧"
        color="#6BCB77"
        score={score}
        onBack={onBack}
      />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-3 text-center text-base font-bold text-green-800">
          Ouça a palavra e escolha a <span className="text-emerald-600">primeira letra</span>!
        </div>

        {/* Imagem grande + botão de ouvir */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-8xl sm:text-9xl drop-shadow-md select-none animate-[bounce_2s_ease-in-out_infinite]">
            {round.word.emoji}
          </div>
          <button
            onClick={playWord}
            className="rounded-full bg-green-500 px-8 py-4 text-2xl font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
          >
            🔊 Ouvir palavra
          </button>
          {!hasPlayed && (
            <div className="text-sm text-green-600 animate-pulse">
              ↑ Toque para ouvir!
            </div>
          )}
        </div>

        {/* Opções */}
        <div className="mt-8 text-center text-sm font-bold text-green-700">
          Com qual letra começa?
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {round.options.map((opt) => {
            const isPicked = picked === opt;
            const isCorrect = opt === round.correct;
            return (
              <button
                key={opt}
                onClick={() => handlePick(opt)}
                disabled={picked !== null}
                className="flex h-24 w-24 items-center justify-center rounded-2xl text-6xl font-black shadow-lg transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
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
                    : "#166534",
                  border: `4px solid ${
                    picked
                      ? isCorrect
                        ? "#047857"
                        : isPicked
                        ? "#b91c1c"
                        : "#d1d5db"
                      : "#22c55e"
                  }`,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center gap-3 text-sm font-bold text-green-700">
          <span className="rounded-full bg-white px-4 py-1.5 shadow">
            Acertos: <span className="text-green-900">{solved}</span>
          </span>
          <span className="rounded-full bg-white px-4 py-1.5 shadow">
            Erros: <span className="text-green-900">{attempts}</span>
          </span>
        </div>
      </main>
    </div>
  );
}
