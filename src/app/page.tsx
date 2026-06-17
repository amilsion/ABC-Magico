"use client";

import { useState, useEffect } from "react";
import { GAME_LIST, type GameId } from "@/lib/literacy-data";
import { useProgress } from "@/hooks/use-progress";
import { GameShell } from "@/components/games/GameShell";
import { Confetti } from "@/components/games/Confetti";
import { StarReward } from "@/components/games/StarReward";
import { playSound } from "@/lib/speech";

import { ABCVivo } from "@/components/games/ABCVivo";
import { MontaPalavras } from "@/components/games/MontaPalavras";
import { CacaLetras } from "@/components/games/CacaLetras";
import { CacaPalavras } from "@/components/games/CacaPalavras";
import { EscrevaLetra } from "@/components/games/EscrevaLetra";
import { JogoMemoria } from "@/components/games/JogoMemoria";
import { CompletePalavra } from "@/components/games/CompletePalavra";
import { OrdemAlfabetica } from "@/components/games/OrdemAlfabetica";
import { Silabas } from "@/components/games/Silabas";
import { QualLetra } from "@/components/games/QualLetra";
import { BingoLetras } from "@/components/games/BingoLetras";

export default function Home() {
  const [active, setActive] = useState<GameId | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const { progress, updateGame, totalStars, totalPlays, hydrated, resetAll } = useProgress();

  // Dispara confete sempre que o total de estrelas aumenta em múltiplos de 50
  const [lastStarMilestone, setLastStarMilestone] = useState(0);
  useEffect(() => {
    if (!hydrated) return;
    const milestone = Math.floor(totalStars / 50);
    if (milestone > lastStarMilestone && milestone > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfettiTrigger((t) => t + 1);
    }
    setLastStarMilestone(milestone);
  }, [totalStars, hydrated, lastStarMilestone]);

  const handleScore = (gameId: string) => (score: number, stars: number) => {
    updateGame(gameId, score, stars);
    if (stars >= 3) {
      setConfettiTrigger((t) => t + 1);
    }
  };

  const goMenu = () => {
    setActive(null);
    playSound("click");
  };

  const selectGame = (id: GameId) => {
    setActive(id);
    playSound("pop");
  };

  if (active) {
    const back = goMenu;
    const onScore = handleScore(active);
    return (
      <GameShell>
        <Confetti trigger={confettiTrigger} />
        <StarReward />
        {active === "abc" && <ABCVivo onBack={back} onScore={onScore} />}
        {active === "words" && <MontaPalavras onBack={back} onScore={onScore} />}
        {active === "complete" && <CompletePalavra onBack={back} onScore={onScore} />}
        {active === "hunt" && <CacaLetras onBack={back} onScore={onScore} />}
        {active === "wordsearch" && <CacaPalavras onBack={back} onScore={onScore} />}
        {active === "draw" && <EscrevaLetra onBack={back} onScore={onScore} />}
        {active === "memory" && <JogoMemoria onBack={back} onScore={onScore} />}
        {active === "order" && <OrdemAlfabetica onBack={back} onScore={onScore} />}
        {active === "syllables" && <Silabas onBack={back} onScore={onScore} />}
        {active === "whatsletter" && <QualLetra onBack={back} onScore={onScore} />}
        {active === "bingo" && <BingoLetras onBack={back} onScore={onScore} />}
      </GameShell>
    );
  }

  return (
    <GameShell>
      <Confetti trigger={confettiTrigger} />
      <StarReward />
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-amber-50 to-cyan-100">
        {/* Header */}
        <header className="relative overflow-hidden bg-gradient-to-r from-rose-400 via-purple-400 to-cyan-400 px-4 py-8 text-center text-white shadow-xl">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "radial-gradient(circle at 20% 30%, white 2px, transparent 2px), radial-gradient(circle at 60% 70%, white 2px, transparent 2px), radial-gradient(circle at 80% 20%, white 2px, transparent 2px)",
            backgroundSize: "120px 120px, 90px 90px, 150px 150px"
          }} />
          <div className="relative">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight drop-shadow-md">
              🔤 ABC Mágico
            </h1>
            <p className="mt-2 text-lg sm:text-2xl font-bold opacity-95 drop-shadow">
              Aprenda brincando! 🌟
            </p>
            {hydrated && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-base sm:text-lg font-bold">
                <span className="rounded-full bg-white/25 px-4 py-1.5 backdrop-blur-sm">
                  ⭐ {totalStars} estrelas
                </span>
                <span className="rounded-full bg-white/25 px-4 py-1.5 backdrop-blur-sm">
                  🎮 {totalPlays} partidas
                </span>
                {totalStars > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("Apagar todo o progresso?")) {
                        resetAll();
                        playSound("click");
                      }
                    }}
                    className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white/90 hover:bg-white/25"
                  >
                    🗑️ Resetar
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Menu de jogos */}
        <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
          <h2 className="mb-5 text-center text-2xl sm:text-3xl font-black text-slate-700">
            Escolha um jogo! 🎮
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GAME_LIST.map((g, i) => {
              const p = hydrated ? progress[g.id] : undefined;
              const hasStars = (p?.totalStars ?? 0) > 0;
              return (
                <button
                  key={g.id}
                  onClick={() => selectGame(g.id)}
                  className="group relative overflow-hidden rounded-3xl bg-white p-5 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95"
                  style={{
                    border: `4px solid ${g.color}`,
                    animation: `cardIn 0.4s ease-out ${i * 0.05}s both`,
                  }}
                >
                  {/* Faixa colorida no topo */}
                  <div
                    className="absolute inset-x-0 top-0 h-2"
                    style={{ background: g.color }}
                  />

                  <div className="flex items-start gap-4 pt-2">
                    <div
                      className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl text-4xl sm:text-5xl shadow-md transition-transform group-hover:scale-110 group-hover:rotate-6"
                      style={{ background: `${g.color}22` }}
                    >
                      {g.emoji}
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-lg sm:text-xl font-black leading-tight"
                        style={{ color: g.color }}
                      >
                        {g.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 leading-snug">
                        {g.description}
                      </p>
                      {hasStars && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="text-amber-500">⭐</span>
                          <span className="text-xs font-bold text-slate-500">
                            Melhor: {p?.bestScore} pts · {p?.totalStars}★
                          </span>
                        </div>
                      )}
                      {!hasStars && hydrated && (
                        <div className="mt-2">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-400">
                            Novo!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seta indicativa */}
                  <div
                    className="mt-3 flex items-center justify-end text-sm font-bold opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: g.color }}
                  >
                    Jogar →
                  </div>
                </button>
              );
            })}
          </div>

          {/* Rodapé com créditos */}
          <footer className="mt-10 border-t-2 border-dashed border-slate-200 pt-5 text-center">
            <p className="text-sm text-slate-500">
              Feito com 💜 para crianças de 3 a 7 anos · Melhorado a partir do{" "}
              <a
                href="https://github.com/amilsion/abc-magico"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-purple-600 underline hover:text-purple-800"
              >
                repositório original de Amilson Monção
              </a>
            </p>
            <p className="mt-2 text-xs text-slate-400">
              {GAME_LIST.length} jogos disponíveis · Dica: ative o som do dispositivo! 🔊
            </p>
          </footer>
        </main>
      </div>

      <style jsx>{`
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </GameShell>
  );
}
