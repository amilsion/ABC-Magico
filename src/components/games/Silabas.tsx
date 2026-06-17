"use client";

import { useEffect, useState, useCallback } from "react";
import { SYLLABLE_WORDS, type SyllableWord } from "@/lib/literacy-data";
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

function buildRound(): SyllableWord {
  return SYLLABLE_WORDS[Math.floor(Math.random() * SYLLABLE_WORDS.length)];
}

export function Silabas({ onBack, onScore }: Props) {
  const [round, setRound] = useState<SyllableWord | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [clapCount, setClapCount] = useState(0);
  const [clapping, setClapping] = useState(false);

  const next = useCallback(() => {
    setRound(buildRound());
    setPicked(null);
    setClapCount(0);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    next();
  }, [next]);

  useEffect(() => {
    if (!round) return;
    const t = setTimeout(() => speak(`Quantas sílabas tem ${round.word}?`, { rate: 0.85 }), 300);
    return () => clearTimeout(t);
  }, [round]);

  // Reproduz as palmas rítmicas mostrando as sílabas
  const showClaps = () => {
    if (!round || clapping) return;
    setClapping(true);
    setClapCount(0);
    playSound("click");
    round.syllableBreakdown.forEach((syl, i) => {
      setTimeout(() => {
        setClapCount(i + 1);
        playSound("pop");
        speak(syl, { rate: 0.7 });
      }, i * 700);
    });
    setTimeout(() => {
      setClapping(false);
    }, round.syllableBreakdown.length * 700 + 200);
  };

  const handlePick = (n: number) => {
    if (picked !== null || !round) return;
    setPicked(n);
    if (n === round.syllables) {
      playSound("correct");
      const points = 10;
      const newScore = score + points;
      setScore(newScore);
      rewardStars(points);
      const newSolved = solved + 1;
      setSolved(newSolved);
      onScore(newScore, newSolved >= 8 ? 3 : newSolved >= 4 ? 2 : 1);
      speak(`${round.syllables} sílabas! Muito bem!`, { rate: 0.85 });
      if (newSolved >= 5 && newSolved % 5 === 0) playWinFanfare();
      setTimeout(next, 1800);
    } else {
      playSound("wrong");
      setAttempts((a) => a + 1);
      speak(`Quase! Ouça de novo.`, { rate: 0.85 });
      setTimeout(() => setPicked(null), 1200);
    }
  };

  if (!round) return null;

  const options = [1, 2, 3, 4].filter((n) => n <= 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-amber-50 to-orange-50">
      <GameHeader
        title="Sílabas"
        emoji="👏"
        color="#FFD93D"
        score={score}
        onBack={onBack}
      />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-3 text-center text-base font-bold text-amber-800">
          Quantas sílabas tem essa palavra?
        </div>

        {/* Palavra */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-7xl sm:text-8xl drop-shadow-md select-none animate-[bounce_2s_ease-in-out_infinite]">
            {round.emoji}
          </div>
          <button
            onClick={() => speak(round.word, { rate: 0.75 })}
            className="rounded-2xl bg-white px-6 py-3 text-3xl sm:text-4xl font-black text-amber-700 shadow-lg"
            style={{ border: "3px solid #f59e0b" }}
          >
            {round.word}
          </button>

          <button
            onClick={showClaps}
            disabled={clapping}
            className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-60"
          >
            👏 Ouvir as sílabas
          </button>

          {/* Animação de palmas */}
          <div className="flex h-20 items-center justify-center gap-3">
            {round.syllableBreakdown.map((syl, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="text-4xl transition-transform"
                  style={{
                    transform:
                      clapCount > i ? "scale(1.3)" : "scale(1)",
                    filter: clapCount > i ? "drop-shadow(0 0 8px #f59e0b)" : "none",
                  }}
                >
                  👏
                </div>
                <div
                  className="rounded-md px-2 py-0.5 text-sm font-bold"
                  style={{
                    background: clapCount > i ? "#f59e0b" : "#fef3c7",
                    color: clapCount > i ? "white" : "#92400e",
                  }}
                >
                  {syl}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opções */}
        <div className="mt-6 text-center text-sm font-bold text-amber-700">
          Escolha quantas sílabas:
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          {options.map((n) => {
            const isPicked = picked === n;
            const isCorrect = n === round.syllables;
            return (
              <button
                key={n}
                onClick={() => handlePick(n)}
                disabled={picked !== null}
                className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl shadow-lg transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
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
                <div className="text-5xl font-black">{n}</div>
                <div className="text-xs font-bold opacity-80">sílabas</div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center gap-3 text-sm font-bold text-amber-700">
          <span className="rounded-full bg-white px-4 py-1.5 shadow">
            Acertos: <span className="text-amber-900">{solved}</span>
          </span>
          <span className="rounded-full bg-white px-4 py-1.5 shadow">
            Erros: <span className="text-amber-900">{attempts}</span>
          </span>
        </div>
      </main>
    </div>
  );
}
