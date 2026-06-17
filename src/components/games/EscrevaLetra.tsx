"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ALPHABET } from "@/lib/literacy-data";
import { speak, playSound } from "@/lib/speech";
import { GameHeader } from "./GameHeader";
import { rewardStars } from "./StarReward";

interface Props {
  onBack: () => void;
  onScore: (score: number, stars: number) => void;
}

export function EscrevaLetra({ onBack, onScore }: Props) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  const current = ALPHABET[index];

  const drawGhost = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.save();
    ctx.fillStyle = "#cbd5e1";
    ctx.font = `bold ${Math.min(rect.width, rect.height) * 0.7}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ALPHABET[index].letter, rect.width / 2, rect.height / 2);
    ctx.restore();
  }, [index]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 18;
      ctx.strokeStyle = "#1e40af";
    }
    drawGhost();
  }, [drawGhost]);

  useEffect(() => {
    resizeCanvas();
    const handler = () => resizeCanvas();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [resizeCanvas]);

  // Redesenha o fantasma ao trocar de letra
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGhost();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasDrawn(false);
  }, [drawGhost]);

  useEffect(() => {
    speak(`Escreva a letra ${current.letter}`, { rate: 0.85 });
  }, [index]);

  const getPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDraw = (e: React.PointerEvent) => {
    e.preventDefault();
    // Limpa o fantasma ao começar a desenhar
    if (!hasDrawn) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setDrawing(true);
    lastPos.current = getPos(e);
    setHasDrawn(true);
  };

  const moveDraw = (e: React.PointerEvent) => {
    if (!drawing || !lastPos.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => {
    setDrawing(false);
    lastPos.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    drawGhost();
    playSound("click");
  };

  const next = () => {
    if (hasDrawn) {
      playSound("correct");
      speak(`Letra ${current.letter}!`, { rate: 0.8 });
      const points = 5;
      setScore((s) => s + points);
      rewardStars(points);
      setAttempts((a) => a + 1);
      onScore(
        score + points,
        attempts + 1 >= 26 ? 3 : attempts + 1 >= 14 ? 2 : 1
      );
    }
    setIndex((i) => (i + 1) % ALPHABET.length);
    setHasDrawn(false);
  };

  const prev = () => {
    setIndex((i) => (i - 1 + ALPHABET.length) % ALPHABET.length);
    setHasDrawn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-fuchsia-50">
      <GameHeader
        title="Escreva a Letra"
        emoji="✏️"
        color="#F38181"
        score={score}
        onBack={onBack}
      />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-4 text-center">
          <div className="text-lg font-bold text-rose-700">Escreva a letra:</div>
          <button
            onClick={() => speak(`Letra ${current.letter}`, { rate: 0.65 })}
            className="mt-2 inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-7xl font-black text-rose-500 shadow-xl"
            style={{ border: "4px solid #f43f5e" }}
          >
            {current.letter}
          </button>
        </div>

        {/* Canvas */}
        <div
          className="relative mx-auto aspect-square w-full max-w-md rounded-3xl bg-white shadow-xl"
          style={{ border: "4px solid #f43f5e" }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full touch-none"
            onPointerDown={startDraw}
            onPointerMove={moveDraw}
            onPointerUp={endDraw}
            onPointerCancel={endDraw}
            onPointerLeave={endDraw}
          />
        </div>

        <div className="mt-3 text-center text-sm font-bold text-rose-600">
          Dica: a letra cinza é um modelo. Escreva por cima com o dedo ou mouse!
        </div>

        {/* Ações */}
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            onClick={clear}
            className="rounded-full bg-slate-500 px-5 py-3 text-base font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
          >
            🗑️ Limpar
          </button>
          <button
            onClick={next}
            className="rounded-full bg-emerald-500 px-5 py-3 text-base font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
          >
            ✓ Próxima
          </button>
        </div>

        {/* Navegação */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl font-bold text-rose-500 shadow-md"
          >
            ◀
          </button>
          <div className="font-bold text-rose-700">
            {index + 1} / {ALPHABET.length}
          </div>
          <button
            onClick={next}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-xl font-bold text-white shadow-md"
          >
            ▶
          </button>
        </div>
      </main>
    </div>
  );
}
