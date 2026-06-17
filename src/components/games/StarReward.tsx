"use client";

import { useEffect, useState } from "react";

interface FloatingStar {
  id: number;
  amount: number;
}

// Mostra "+N ⭐" subindo na tela quando o jogador pontua
export function StarReward() {
  const [stars, setStars] = useState<FloatingStar[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      const id = Date.now() + Math.random();
      setStars((prev) => [...prev, { id, amount: detail }]);
      setTimeout(() => {
        setStars((prev) => prev.filter((s) => s.id !== id));
      }, 1100);
    };
    window.addEventListener("abc:star", handler as EventListener);
    return () => window.removeEventListener("abc:star", handler as EventListener);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] flex items-start justify-center">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute top-1/3 text-4xl sm:text-5xl font-extrabold"
          style={{
            color: "#FFD93D",
            textShadow: "0 4px 0 #FFA500, 0 8px 12px rgba(0,0,0,0.3)",
            animation: "starFloat 1.1s ease-out forwards",
          }}
        >
          +{s.amount} ⭐
        </div>
      ))}
      <style jsx>{`
        @keyframes starFloat {
          0% {
            transform: translateY(0) scale(0.4);
            opacity: 0;
          }
          30% {
            transform: translateY(-30px) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translateY(-150px) scale(0.9);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Dispara o evento global
export function rewardStars(amount: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("abc:star", { detail: amount }));
}
