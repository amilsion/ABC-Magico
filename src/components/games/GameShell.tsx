"use client";

import { useEffect, useRef } from "react";
import { initVoices } from "@/lib/speech";

interface GameShellProps {
  children: React.ReactNode;
}

// Wrapper que inicializa vozes e libera áudio no primeiro clique
export function GameShell({ children }: GameShellProps) {
  const unlockedRef = useRef(false);

  useEffect(() => {
    initVoices();
  }, []);

  useEffect(() => {
    const unlock = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      // Pequeno som silencioso para desbloquear áudio em iOS
      try {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (AC) {
          const ctx = new AC();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.value = 0.0001;
          osc.start();
          osc.stop(ctx.currentTime + 0.01);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return <>{children}</>;
}
