"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rot: number;
  rotSpeed: number;
  color: string;
  emoji: string;
  size: number;
}

const COLORS = ["#FF6B6B", "#FFE66D", "#4ECDC4", "#95E1D3", "#FFA07A", "#AA96DA", "#FFD93D"];
const EMOJIS = ["⭐", "🎉", "✨", "🌟", "💫", "🎈", "🌈"];

export function Confetti({ trigger }: { trigger: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const count = 36;
    const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 6 + Math.random() * 8;
      return {
        id: trigger * 1000 + i,
        x: 50,
        y: 50,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed - 4,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 25,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        size: 20 + Math.random() * 18,
      };
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(newParticles);

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.dx * 0.4,
          y: p.y + p.dy * 0.4 + elapsed * elapsed * 12,
          rot: p.rot + p.rotSpeed,
        }))
      );
      if (elapsed > 2.2) {
        clearInterval(interval);
        setParticles([]);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: `translate(-50%, -50%) rotate(${p.rot}deg)`,
            fontSize: `${p.size}px`,
          }}
        >
          <span className="select-none" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>
            {p.emoji}
          </span>
        </div>
      ))}
    </div>
  );
}
