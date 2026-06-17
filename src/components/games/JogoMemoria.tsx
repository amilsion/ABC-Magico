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

type CardKind = "upper" | "lower";

interface Card {
  id: number;
  letter: string;
  kind: CardKind;
  emoji: string;
  color: string;
  flipped: boolean;
  matched: boolean;
}

// Configuração dos níveis progressivos
interface LevelConfig {
  level: number;
  pairs: number;
  cols: number; // colunas no grid
  label: string;
  emoji: string;
  color: string;
}

const LEVELS: LevelConfig[] = [
  { level: 1, pairs: 4, cols: 4, label: "Iniciante", emoji: "🌱", color: "#10b981" },
  { level: 2, pairs: 6, cols: 4, label: "Fácil", emoji: "🌿", color: "#22c55e" },
  { level: 3, pairs: 8, cols: 4, label: "Médio", emoji: "🌳", color: "#f59e0b" },
  { level: 4, pairs: 10, cols: 5, label: "Difícil", emoji: "🔥", color: "#ef4444" },
  { level: 5, pairs: 13, cols: 5, label: "Mestre", emoji: "👑", color: "#8b5cf6" },
];

const MAX_LEVEL = LEVELS.length;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(pairs: number): Card[] {
  const letters = shuffle(ALPHABET).slice(0, pairs);
  const deck: Card[] = [];
  letters.forEach((l, i) => {
    deck.push({
      id: i * 2,
      letter: l.letter,
      kind: "upper" as CardKind,
      emoji: l.emoji,
      color: l.color,
      flipped: false,
      matched: false,
    });
    deck.push({
      id: i * 2 + 1,
      letter: l.lower,
      kind: "lower" as CardKind,
      emoji: l.emoji,
      color: l.color,
      flipped: false,
      matched: false,
    });
  });
  return shuffle(deck);
}

export function JogoMemoria({ onBack, onScore }: Props) {
  const [levelIdx, setLevelIdx] = useState(0); // índice em LEVELS
  const [deck, setDeck] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [lock, setLock] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [showLevelUp, setShowLevelUp] = useState(false);

  const currentLevel = LEVELS[levelIdx];
  const pairsForRound = currentLevel.pairs;

  const newGame = useCallback((lvlIdx: number) => {
    setDeck(buildDeck(LEVELS[lvlIdx].pairs));
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setLock(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    newGame(levelIdx);
  }, [levelIdx, newGame]);

  useEffect(() => {
    speak(`Nível ${currentLevel.level}: ${currentLevel.label}. ${currentLevel.pairs} pares!`, {
      rate: 0.9,
    });
  }, [levelIdx]);

  const changeLevel = (idx: number) => {
    if (idx === levelIdx) return;
    setLevelIdx(idx);
    playSound("click");
  };

  const handleClick = (id: number) => {
    if (lock) return;
    const card = deck.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;
    playSound("pop");

    const newDeck = deck.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    const newFlipped = [...flipped, id];
    setDeck(newDeck);
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLock(true);
      setMoves((m) => m + 1);
      const [a, b] = newFlipped.map((fid) => newDeck.find((c) => c.id === fid)!);
      if (a.emoji === b.emoji && a.kind !== b.kind) {
        // Match!
        setTimeout(() => {
          playSound("correct");
          speak(`${a.letter}`, { rate: 0.8 });
          setDeck((prev) =>
            prev.map((c) => (c.id === a.id || c.id === b.id ? { ...c, matched: true } : c))
          );
          const points = 10 + levelIdx * 3; // mais pontos em níveis maiores
          const newScore = score + points;
          setScore(newScore);
          rewardStars(points);
          const newM = matches + 1;
          setMatches(newM);
          // estrelas baseadas em quantos pares do nível foram feitos
          const stars =
            newM >= pairsForRound ? 3 : newM >= Math.ceil(pairsForRound * 0.6) ? 2 : 1;
          onScore(newScore, stars);

          if (newM >= pairsForRound) {
            // Nível completo!
            playWinFanfare();
            setCompletedLevels((prev) => {
              const copy = new Set(prev);
              copy.add(currentLevel.level);
              return copy;
            });

            // Fala de parabéns
            setTimeout(() => {
              if (levelIdx < MAX_LEVEL - 1) {
                setShowLevelUp(true);
                speak(
                  `Parabéns! Você completou o nível ${currentLevel.level}! Vamos para o nível ${
                    LEVELS[levelIdx + 1].level
                  }!`,
                  { rate: 0.9 }
                );
              } else {
                speak(`Incrível! Você completou todos os níveis! Você é um mestre da memória!`, {
                  rate: 0.9,
                });
              }
            }, 800);

            setRounds((r) => r + 1);

            // Avança para próximo nível após 2.8s (dá tempo do confete + fala)
            setTimeout(() => {
              setShowLevelUp(false);
              if (levelIdx < MAX_LEVEL - 1) {
                setLevelIdx((i) => i + 1);
              } else {
                // Já está no último nível, reinicia no nível 1 para continuar jogando
                setLevelIdx(0);
              }
            }, 2800);
          }
          setFlipped([]);
          setLock(false);
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          playSound("wrong");
          setDeck((prev) =>
            prev.map((c) =>
              c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c
            )
          );
          setFlipped([]);
          setLock(false);
        }, 1100);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-purple-50 to-indigo-50">
      <GameHeader
        title="Jogo da Memória"
        emoji="🧠"
        color="#AA96DA"
        score={score}
        onBack={onBack}
      />

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Seleção de níveis */}
        <div className="mb-4">
          <div className="mb-2 text-center text-sm font-bold text-purple-700">
            Escolha seu nível:
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {LEVELS.map((lvl, idx) => {
              const isActive = idx === levelIdx;
              const isCompleted = completedLevels.has(lvl.level);
              return (
                <button
                  key={lvl.level}
                  onClick={() => changeLevel(idx)}
                  className="flex flex-col items-center rounded-2xl px-3 py-2 text-xs font-bold shadow-md transition hover:scale-105 active:scale-95"
                  style={{
                    background: isActive ? lvl.color : "white",
                    color: isActive ? "white" : lvl.color,
                    border: `3px solid ${lvl.color}`,
                    minWidth: "70px",
                  }}
                >
                  <span className="text-xl">{lvl.emoji}</span>
                  <span>Nível {lvl.level}</span>
                  <span className={isActive ? "opacity-90" : "opacity-70"}>
                    {lvl.pairs} pares
                  </span>
                  {isCompleted && <span className="text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status do nível atual */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-purple-700">
          <span
            className="rounded-full px-4 py-1.5 text-white shadow"
            style={{ background: currentLevel.color }}
          >
            {currentLevel.emoji} {currentLevel.label}
          </span>
          <span className="rounded-full bg-white px-4 py-1.5 shadow">
            Pares: <span className="text-purple-900">{matches}</span> / {pairsForRound}
          </span>
          <span className="rounded-full bg-white px-4 py-1.5 shadow">
            Jogadas: <span className="text-purple-900">{moves}</span>
          </span>
          <button
            onClick={() => newGame(levelIdx)}
            className="rounded-full bg-purple-100 px-4 py-1.5 font-bold text-purple-700 hover:bg-purple-200"
          >
            ↻ Recomeçar
          </button>
        </div>

        <div className="mb-3 text-center text-sm font-bold text-purple-700">
          Encontre os pares: <span className="text-purple-900">MAIÚSCULA</span> ↔{" "}
          <span className="text-purple-900">minúscula</span>
        </div>

        {/* Tabuleiro - grid dinâmico */}
        <div
          className="mx-auto grid gap-2 sm:gap-3"
          style={{
            gridTemplateColumns: `repeat(${currentLevel.cols}, minmax(0, 1fr))`,
            maxWidth: currentLevel.cols >= 5 ? "560px" : "480px",
          }}
        >
          {deck.map((card) => {
            const showFront = card.flipped || card.matched;
            return (
              <button
                key={card.id}
                onClick={() => handleClick(card.id)}
                disabled={card.matched}
                className="relative aspect-square rounded-xl shadow-md transition-transform duration-200 hover:scale-105"
                style={{
                  background: showFront ? card.color : "white",
                  border: `3px solid ${showFront ? card.color : "#c4b5fd"}`,
                  opacity: card.matched ? 0.55 : 1,
                }}
              >
                {showFront ? (
                  <div className="flex h-full flex-col items-center justify-center gap-0.5">
                    <div
                      className="font-black text-white"
                      style={{
                        fontSize:
                          currentLevel.cols >= 5 ? "1.4rem" : "1.75rem",
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      }}
                    >
                      {card.letter}
                    </div>
                    <div
                      style={{
                        fontSize: currentLevel.cols >= 5 ? "0.95rem" : "1.25rem",
                      }}
                    >
                      {card.emoji}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-purple-300">
                    <span style={{ fontSize: currentLevel.cols >= 5 ? "1.25rem" : "1.75rem" }}>
                      ❓
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 text-center text-sm text-purple-600">
          Rodadas completas: {rounds} · Níveis desbloqueados: {completedLevels.size} / {MAX_LEVEL}
        </div>

        {/* Modal de Level Up */}
        {showLevelUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div
              className="rounded-3xl bg-white p-8 text-center shadow-2xl"
              style={{ border: `5px solid ${LEVELS[levelIdx + 1]?.color ?? currentLevel.color}` }}
            >
              <div className="text-6xl animate-bounce">🎉</div>
              <h2 className="mt-3 text-2xl font-black text-purple-700">Nível Completo!</h2>
              <p className="mt-2 text-base font-bold text-purple-600">
                Você terminou o nível {currentLevel.level}!
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-3xl">{currentLevel.emoji}</span>
                <span className="text-2xl">→</span>
                <span className="text-3xl">{LEVELS[levelIdx + 1]?.emoji ?? "👑"}</span>
              </div>
              <p className="mt-3 text-sm font-bold text-purple-500">
                Próximo: Nível {LEVELS[levelIdx + 1]?.level ?? "Max"} ·{" "}
                {LEVELS[levelIdx + 1]?.label ?? "Mestre"}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
