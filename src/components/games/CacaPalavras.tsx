"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { WORDS_EASY } from "@/lib/literacy-data";
import { speak, playSound, playWinFanfare } from "@/lib/speech";
import { GameHeader } from "./GameHeader";
import { rewardStars } from "./StarReward";

interface Props {
  onBack: () => void;
  onScore: (score: number, stars: number) => void;
}

const GRID_SIZE = 8;
const NUM_WORDS = 4;

interface Cell {
  letter: string;
  selected: boolean;
  inWord: boolean;
  wrong: boolean;
}

interface PlacedWord {
  word: string;
  cells: { row: number; col: number }[];
  found: boolean;
}

interface Pos {
  row: number;
  col: number;
}

const DIRECTIONS = [
  { dr: 0, dc: 1 }, // →
  { dr: 1, dc: 0 }, // ↓
  { dr: 1, dc: 1 }, // ↘
  { dr: 0, dc: -1 }, // ←
];

function pickWords(): string[] {
  const shuffled = [...WORDS_EASY].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, NUM_WORDS).map((w) => w.word);
}

function buildGrid(words: string[]): { grid: string[][]; placed: PlacedWord[] } {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => "")
  );
  const placed: PlacedWord[] = [];

  const canPlace = (word: string, row: number, col: number, dir: { dr: number; dc: number }) => {
    for (let i = 0; i < word.length; i++) {
      const r = row + dir.dr * i;
      const c = col + dir.dc * i;
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
      if (grid[r][c] !== "" && grid[r][c] !== word[i]) return false;
    }
    return true;
  };

  for (const word of words) {
    let placedFlag = false;
    for (let attempt = 0; attempt < 50 && !placedFlag; attempt++) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const maxR = dir.dr === 1 ? GRID_SIZE - word.length : GRID_SIZE - 1;
      const minR = dir.dr === -1 ? word.length - 1 : 0;
      const maxC = dir.dc === 1 ? GRID_SIZE - word.length : GRID_SIZE - 1;
      const minC = dir.dc === -1 ? word.length - 1 : 0;
      const row = minR + Math.floor(Math.random() * (maxR - minR + 1));
      const col = minC + Math.floor(Math.random() * (maxC - minC + 1));
      if (canPlace(word, row, col, dir)) {
        const cells: Pos[] = [];
        for (let i = 0; i < word.length; i++) {
          const r = row + dir.dr * i;
          const c = col + dir.dc * i;
          grid[r][c] = word[i];
          cells.push({ row: r, col: c });
        }
        placed.push({ word, cells, found: false });
        placedFlag = true;
      }
    }
  }

  // Preenche o resto com letras aleatórias
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = letters[Math.floor(Math.random() * 26)];
      }
    }
  }
  return { grid, placed };
}

export function CacaPalavras({ onBack, onScore }: Props) {
  const [grid, setGrid] = useState<string[][]>([]);
  const [placed, setPlaced] = useState<PlacedWord[]>([]);
  const [cells, setCells] = useState<Cell[][]>([]);
  const [score, setScore] = useState(0);
  const [foundCount, setFoundCount] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [selecting, setSelecting] = useState(false);
  const [selStart, setSelStart] = useState<Pos | null>(null);
  const [selEnd, setSelEnd] = useState<Pos | null>(null);

  const startNew = useCallback(() => {
    const words = pickWords();
    const { grid: g, placed: p } = buildGrid(words);
    setGrid(g);
    setPlaced(p);
    setCells(
      g.map((row) => row.map(() => ({ letter: "", selected: false, inWord: false, wrong: false })))
    );
    setFoundCount(0);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startNew();
  }, [startNew]);

  // Mantém células sincronizadas com o grid
  useEffect(() => {
    if (grid.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCells((prev) => {
      if (prev.length === grid.length && prev[0]?.length === grid[0].length) {
        return prev.map((row, r) =>
          row.map((c, ci) => ({ ...c, letter: grid[r][ci] }))
        );
      }
      return grid.map((row) =>
        row.map((letter) => ({ letter, selected: false, inWord: false, wrong: false }))
      );
    });
  }, [grid]);

  const getLine = (start: Pos, end: Pos): Pos[] => {
    const dr = end.row - start.row;
    const dc = end.col - start.col;
    if (dr === 0 && dc === 0) return [start];
    const isHoriz = dr === 0;
    const isVert = dc === 0;
    const isDiag = Math.abs(dr) === Math.abs(dc);
    if (!isHoriz && !isVert && !isDiag) return [start];
    const len = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
    const sr = Math.sign(dr);
    const sc = Math.sign(dc);
    return Array.from({ length: len }, (_, i) => ({
      row: start.row + sr * i,
      col: start.col + sc * i,
    }));
  };

  const handleDown = (pos: Pos) => {
    setSelecting(true);
    setSelStart(pos);
    setSelEnd(pos);
  };

  const handleEnter = (pos: Pos) => {
    if (selecting && selStart) {
      setSelEnd(pos);
    }
  };

  const handleUp = () => {
    if (!selecting || !selStart || !selEnd) {
      setSelecting(false);
      return;
    }
    const line = getLine(selStart, selEnd);
    const formed = line.map((p) => grid[p.row]?.[p.col] || "").join("");
    const reversed = formed.split("").reverse().join("");

    const matched = placed.find(
      (p) => !p.found && (p.word === formed || p.word === reversed)
    );

    if (matched) {
      playSound("correct");
      speak(matched.word, { rate: 0.85 });
      const points = 15;
      const newScore = score + points;
      setScore(newScore);
      rewardStars(points);
      setCells((prev) =>
        prev.map((row, r) =>
          row.map((c, ci) => {
            const inLine = line.some((p) => p.row === r && p.col === ci);
            return inLine ? { ...c, inWord: true, selected: false } : c;
          })
        )
      );
      setPlaced((prev) =>
        prev.map((p) => (p.word === matched.word ? { ...p, found: true } : p))
      );
      const newFound = foundCount + 1;
      setFoundCount(newFound);
      onScore(newScore, newFound >= NUM_WORDS ? 3 : newFound >= 2 ? 2 : 1);
      if (newFound >= NUM_WORDS) {
        playWinFanfare();
        setTimeout(() => {
          setRounds((r) => r + 1);
          startNew();
        }, 1800);
      }
    } else {
      playSound("wrong");
      setCells((prev) =>
        prev.map((row, r) =>
          row.map((c, ci) => {
            const inLine = line.some((p) => p.row === r && p.col === ci);
            return inLine ? { ...c, wrong: true, selected: false } : c;
          })
        )
      );
      setTimeout(() => {
        setCells((prev) =>
          prev.map((row) => row.map((c) => ({ ...c, wrong: false, selected: false })))
        );
      }, 400);
    }
    setSelecting(false);
    setSelStart(null);
    setSelEnd(null);
  };

  // Render: destaque visual do que está sendo selecionado
  const renderCells = () => {
    const highlighted = selecting && selStart && selEnd ? getLine(selStart, selEnd) : [];
    return cells.map((row, r) =>
      row.map((c, ci) => {
        const isHighlighted = highlighted.some((p) => p.row === r && p.col === ci);
        return {
          ...c,
          selected: isHighlighted,
        };
      })
    );
  };

  const display = renderCells();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50">
      <GameHeader
        title="Caça Palavras"
        emoji="🆎"
        color="#FFA07A"
        score={score}
        onBack={onBack}
      />
      <main className="mx-auto max-w-2xl px-4 py-5">
        <div className="mb-3 text-center text-sm font-bold text-orange-700">
          Arraste (ou clique e segure) para selecionar as palavras!
        </div>

        {/* Lista de palavras */}
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {placed.map((p, i) => (
            <span
              key={i}
              className="rounded-full px-3 py-1.5 text-sm font-bold transition"
              style={{
                background: p.found ? "#10b981" : "white",
                color: p.found ? "white" : "#c2410c",
                border: "2px solid #fb923c",
                textDecoration: p.found ? "line-through" : "none",
              }}
            >
              {p.word}
            </span>
          ))}
        </div>

        {/* Grade */}
        <div
          className="mx-auto grid select-none gap-1 touch-none"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            maxWidth: "min(420px, 92vw)",
          }}
          onMouseLeave={() => setSelecting(false)}
          onPointerUp={handleUp}
          onTouchEnd={handleUp}
        >
          {display.map((row, r) =>
            row.map((c, ci) => (
              <button
                key={`${r}-${ci}`}
                onPointerDown={() => handleDown({ row: r, col: ci })}
                onPointerEnter={() => handleEnter({ row: r, col: ci })}
                className="flex aspect-square items-center justify-center rounded-md text-base sm:text-lg font-black shadow-sm transition"
                style={{
                  background: c.inWord
                    ? "#10b981"
                    : c.wrong
                    ? "#ef4444"
                    : c.selected
                    ? "#fdba74"
                    : "white",
                  color: c.inWord || c.wrong ? "white" : "#7c2d12",
                  border: `2px solid ${c.inWord ? "#047857" : c.wrong ? "#b91c1c" : "#fed7aa"}`,
                }}
              >
                {c.letter}
              </button>
            ))
          )}
        </div>

        <div className="mt-5 text-center">
          <div className="inline-block rounded-full bg-white px-5 py-2 text-base font-bold text-orange-700 shadow">
            Encontradas: <span className="text-orange-900">{foundCount}</span> / {NUM_WORDS}
          </div>
          <div className="mt-2 text-sm text-orange-600">Rodadas: {rounds}</div>
        </div>
      </main>
    </div>
  );
}
