"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GameHeaderProps {
  title: string;
  emoji: string;
  color: string;
  score: number;
  onBack: () => void;
  rightSlot?: React.ReactNode;
}

export function GameHeader({ title, emoji, color, score, onBack, rightSlot }: GameHeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-2 px-3 py-3 sm:px-5 sm:py-4 shadow-md text-white"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
    >
      <Button
        variant="secondary"
        size="sm"
        onClick={onBack}
        className="bg-white/25 hover:bg-white/40 text-white border-0 shadow-sm font-bold"
      >
        ← Voltar
      </Button>
      <div className="flex items-center gap-2 font-extrabold text-base sm:text-xl">
        <span className="text-2xl sm:text-3xl">{emoji}</span>
        <span className="tracking-tight drop-shadow-sm">{title}</span>
      </div>
      <div className="flex items-center gap-2 min-w-[80px] justify-end">
        {rightSlot}
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-3 py-1.5 font-bold text-sm sm:text-base",
            "bg-white/25 backdrop-blur-sm"
          )}
        >
          <span>⭐</span>
          <span>{score}</span>
        </div>
      </div>
    </header>
  );
}
