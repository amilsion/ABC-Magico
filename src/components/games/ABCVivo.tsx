"use client";

import { useEffect, useState, useCallback } from "react";
import { ALPHABET } from "@/lib/literacy-data";
import { speak, playSound } from "@/lib/speech";
import { GameHeader } from "./GameHeader";
import { rewardStars } from "./StarReward";

interface Props {
  onBack: () => void;
  onScore: (score: number, stars: number) => void;
}

export function ABCVivo({ onBack, onScore }: Props) {
  const [index, setIndex] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [score, setScore] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  const current = ALPHABET[index];

  const speakAll = useCallback(() => {
    setSpeaking(true);
    playSound("click");
    speak(`${current.letter}. ${current.word}.`, { rate: 0.8 });
    setTimeout(() => setSpeaking(false), 1800);
  }, [current]);

  // Auto-fala ao trocar de letra
  useEffect(() => {
    const t = setTimeout(() => {
      speak(`${current.letter}.`, { rate: 0.75 });
    }, 150);
    return () => clearTimeout(t);
  }, [index]);

  const goNext = () => {
    const next = (index + 1) % ALPHABET.length;
    setIndex(next);
    if (!visited.has(next)) {
      const newVisited = new Set(visited);
      newVisited.add(next);
      setVisited(newVisited);
      const newScore = score + 5;
      setScore(newScore);
      rewardStars(5);
      playSound("correct");
      onScore(newScore, newVisited.size >= 26 ? 3 : newVisited.size >= 14 ? 2 : 1);
    }
    playSound("pop");
  };

  const goPrev = () => {
    setIndex((i) => (i - 1 + ALPHABET.length) % ALPHABET.length);
    playSound("pop");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-orange-50 to-amber-50">
      <GameHeader
        title="ABC Vivo"
        emoji="🔠"
        color="#FF6B6B"
        score={score}
        onBack={onBack}
      />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
        {/* Card da letra */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 sm:p-10 shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${current.color}33, ${current.color}11)`,
            border: `4px solid ${current.color}`,
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="flex h-32 w-32 sm:h-44 sm:w-44 items-center justify-center rounded-3xl text-7xl sm:text-9xl font-black shadow-inner"
              style={{
                background: "white",
                color: current.color,
                textShadow: `0 4px 0 ${current.color}55`,
              }}
            >
              {current.letter}
              <span className="ml-1 text-5xl sm:text-7xl" style={{ color: current.color }}>
                {current.lower}
              </span>
            </div>

            <div className="text-7xl sm:text-9xl drop-shadow-md select-none">{current.emoji}</div>
            <div
              className="rounded-full px-6 py-2 text-2xl sm:text-3xl font-extrabold text-white shadow-md"
              style={{ background: current.color }}
            >
              {current.word}
            </div>

            {/* Animação de onda de voz */}
            <div className="flex h-6 items-end gap-1" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="w-1.5 rounded-full"
                  style={{
                    background: current.color,
                    height: speaking ? `${8 + Math.sin(i) * 4 + 12}px` : "4px",
                    animation: speaking ? `wave 0.6s ease-in-out ${i * 0.08}s infinite` : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Botões de áudio */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={speakAll}
            className="rounded-full bg-rose-500 px-6 py-3 text-lg font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
          >
            🔊 Ouvir
          </button>
          <button
            onClick={() => {
              playSound("click");
              speak(current.word, { rate: 0.7 });
            }}
            className="rounded-full bg-amber-500 px-6 py-3 text-lg font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
          >
            🗣️ Palavra
          </button>
          <button
            onClick={() => {
              playSound("click");
              speak(current.letter, { rate: 0.6 });
            }}
            className="rounded-full bg-teal-500 px-6 py-3 text-lg font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
          >
            🔤 Letra
          </button>
        </div>

        {/* Navegação */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={goPrev}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl font-bold text-rose-500 shadow-md transition hover:scale-110 active:scale-95"
            aria-label="Letra anterior"
          >
            ◀
          </button>
          <div className="text-lg font-bold text-rose-700">
            {index + 1} <span className="text-rose-300">/</span> {ALPHABET.length}
          </div>
          <button
            onClick={goNext}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-2xl font-bold text-white shadow-md transition hover:scale-110 active:scale-95"
            aria-label="Próxima letra"
          >
            ▶
          </button>
        </div>

        {/* Progresso */}
        <div className="mt-6">
          <div className="mb-2 text-center text-sm font-bold text-rose-700">
            Letras visitadas: {visited.size} / {ALPHABET.length}
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {ALPHABET.map((l, i) => (
              <button
                key={l.letter}
                onClick={() => {
                  setIndex(i);
                  playSound("pop");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold transition"
                style={{
                  background: visited.has(i) ? l.color : "#f1f5f9",
                  color: visited.has(i) ? "white" : "#94a3b8",
                  border: i === index ? "2px solid #1e293b" : "2px solid transparent",
                }}
              >
                {l.letter}
              </button>
            ))}
          </div>
        </div>
      </main>
      <style jsx>{`
        @keyframes wave {
          0%,
          100% {
            transform: scaleY(0.6);
          }
          50% {
            transform: scaleY(1.4);
          }
        }
      `}</style>
    </div>
  );
}
