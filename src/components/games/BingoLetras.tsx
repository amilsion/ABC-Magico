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

const CARD_SIZE = 9; // Cartela 3x3

interface Cell {
  letter: string;
  emoji: string;
  color: string;
  marked: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildCard(): Cell[] {
  const picks = shuffle(ALPHABET).slice(0, CARD_SIZE);
  return picks.map((l) => ({
    letter: l.letter,
    emoji: l.emoji,
    color: l.color,
    marked: false,
  }));
}

export function BingoLetras({ onBack, onScore }: Props) {
  const [card, setCard] = useState<Cell[]>([]);
  const [called, setCalled] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [markedCount, setMarkedCount] = useState(0);
  const [bingo, setBingo] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);

  // Sorteia próxima letra automaticamente
  const drawNext = useCallback((currentCard: Cell[]) => {
    // Filtra apenas letras não marcadas (para a IA sempre chamar algo útil)
    // 70% de chance de sortear uma letra da cartela, 30% de distração
    const available = [...ALPHABET];
    const onCard = currentCard.filter((c) => !c.marked);
    let pick;
    if (onCard.length > 0 && Math.random() < 0.7) {
      pick = onCard[Math.floor(Math.random() * onCard.length)];
    } else {
      pick = available[Math.floor(Math.random() * available.length)];
    }
    setCalled(pick.letter);
    speak(`Letra ${pick.letter}`, { rate: 0.8 });
  }, []);

  const newGame = useCallback(() => {
    const fresh = buildCard();
    setCard(fresh);
    setCalled(null);
    setMarkedCount(0);
    setBingo(false);
    drawNext(fresh);
  }, [drawNext]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    newGame();
  }, []);

  // Próximo sorteio
  const nextDraw = () => {
    if (bingo) return;
    drawNext(card);
  };

  const handleMark = (i: number) => {
    if (bingo) return;
    if (card[i].marked) return;
    if (called !== card[i].letter) {
      playSound("wrong");
      setWrongFlash(i);
      setTimeout(() => setWrongFlash(null), 500);
      return;
    }
    const newCard = card.map((c, ci) =>
      ci === i ? { ...c, marked: true } : c
    );
    setCard(newCard);
    const newCount = markedCount + 1;
    setMarkedCount(newCount);
    playSound("correct");
    speak(`Letra ${card[i].letter}!`, {
      rate: 0.85,
    });
    const points = 10;
    const newScore = score + points;
    setScore(newScore);
    rewardStars(points);
    if (newCount >= CARD_SIZE) {
      // BINGO!
      setBingo(true);
      playWinFanfare();
      speak("Bingo! Você completou a cartela!", { rate: 0.85 });
      setRounds((r) => r + 1);
      const finalScore = newScore + 50;
      setScore(finalScore);
      rewardStars(50);
      onScore(finalScore, 3);
      setTimeout(() => newGame(), 3000);
    } else {
      onScore(newScore, newCount >= CARD_SIZE ? 3 : newCount >= 6 ? 2 : 1);
      // Sorteia próxima após 1s
      setTimeout(() => drawNext(newCard), 1200);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-red-50 to-rose-50">
      <GameHeader
        title="Bingo das Letras"
        emoji="🎯"
        color="#FF9F68"
        score={score}
        onBack={onBack}
      />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-3 text-center text-base font-bold text-orange-800">
          Escute a letra sorteada e marque na sua cartela!
        </div>

        {/* Letra sorteada */}
        <div className="mb-5 flex flex-col items-center gap-3">
          <div className="rounded-full bg-orange-100 px-4 py-1.5 text-sm font-bold text-orange-700">
            Letra sorteada:
          </div>
          <button
            onClick={() => called && speak(`Letra ${called}`, { rate: 0.65 })}
            className="flex h-28 w-28 items-center justify-center rounded-3xl bg-white text-7xl font-black text-orange-500 shadow-xl"
            style={{ border: "4px solid #f97316" }}
          >
            {called ?? "?"}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => called && speak(`Letra ${called}`, { rate: 0.65 })}
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-md hover:scale-105 active:scale-95"
            >
              🔊 Repetir
            </button>
            <button
              onClick={nextDraw}
              disabled={bingo}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-md hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              ↻ Sortear outra
            </button>
          </div>
        </div>

        {/* Cartela 3x3 */}
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-2 sm:gap-3">
          {card.map((c, i) => (
            <button
              key={i}
              onClick={() => handleMark(i)}
              disabled={c.marked || bingo}
              className="relative flex aspect-square flex-col items-center justify-center rounded-xl shadow-md transition hover:scale-105 active:scale-95"
              style={{
                background: c.marked
                  ? c.color
                  : wrongFlash === i
                  ? "#ef4444"
                  : "white",
                color: c.marked
                  ? "white"
                  : wrongFlash === i
                  ? "white"
                  : c.color,
                border: `3px solid ${c.marked ? c.color : "#fed7aa"}`,
                opacity: c.marked ? 1 : 0.95,
              }}
            >
              <div className="text-3xl sm:text-4xl font-black">{c.letter}</div>
              <div className="text-xl sm:text-2xl">{c.emoji}</div>
              {c.marked && (
                <div className="absolute right-1 top-1 text-lg">⭐</div>
              )}
            </button>
          ))}
        </div>

        {/* Progresso */}
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm font-bold text-orange-700">
          <span className="rounded-full bg-white px-4 py-1.5 shadow">
            Marcadas: <span className="text-orange-900">{markedCount}</span> / {CARD_SIZE}
          </span>
          <span className="rounded-full bg-white px-4 py-1.5 shadow">
            Bingos: <span className="text-orange-900">{rounds}</span>
          </span>
        </div>

        {bingo && (
          <div className="mt-5 text-center text-4xl font-black text-emerald-600 animate-bounce">
            🎉 BINGO! 🎉
          </div>
        )}
      </main>
    </div>
  );
}
