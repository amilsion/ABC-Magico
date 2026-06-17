"use client";

// Utilitário para síntese de voz (Web Speech API) - pt-BR
let cachedVoice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  if (cachedVoice) return cachedVoice;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Priorizar vozes brasileiras
  const ptBR =
    voices.find((v) => v.lang === "pt-BR" && /female|mulher|luciana/i.test(v.name)) ||
    voices.find((v) => v.lang === "pt-BR") ||
    voices.find((v) => v.lang.startsWith("pt")) ||
    voices[0];

  cachedVoice = ptBR ?? null;
  return cachedVoice;
}

// Inicializa vozes (alguns navegadores carregam de forma assíncrona)
export function initVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    pickVoice();
  };
}

export function speak(text: string, opts: { rate?: number; pitch?: number } = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  // Cancela falas anteriores para evitar fila
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utter.voice = voice;
  utter.lang = "pt-BR";
  utter.rate = opts.rate ?? 0.85;
  utter.pitch = opts.pitch ?? 1.1;
  utter.volume = 1;
  window.speechSynthesis.speak(utter);
}

// Soletra uma palavra, letra por letra
export function spellOut(word: string) {
  const letters = word.split("");
  letters.forEach((l, i) => {
    setTimeout(() => speak(l, { rate: 0.7 }), i * 600);
  });
}

// Efeitos sonoros simples usando Web Audio API
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  return audioCtx;
}

type EffectKind = "correct" | "wrong" | "win" | "click" | "pop";

export function playSound(kind: EffectKind) {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const config: Record<EffectKind, { freq: number; type: OscillatorType; dur: number; sweep?: number }> = {
    correct: { freq: 523.25, type: "sine", dur: 0.18, sweep: 880 }, // Dó -> Lá
    wrong: { freq: 220, type: "sawtooth", dur: 0.25, sweep: 110 },
    win: { freq: 523.25, type: "triangle", dur: 0.45, sweep: 1046.5 }, // Dó -> Dó agudo
    click: { freq: 800, type: "square", dur: 0.05 },
    pop: { freq: 600, type: "sine", dur: 0.08, sweep: 1200 },
  };

  const c = config[kind];
  osc.type = c.type;
  osc.frequency.setValueAtTime(c.freq, now);
  if (c.sweep) osc.frequency.exponentialRampToValueAtTime(c.sweep, now + c.dur);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + c.dur);

  osc.start(now);
  osc.stop(now + c.dur + 0.02);
}

// Sequência vitoriosa (para vitórias grandes)
export function playWinFanfare() {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // Dó, Mi, Sol, Dó
  notes.forEach((freq, i) => {
    setTimeout(() => {
      const ctx = getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    }, i * 130);
  });
}
