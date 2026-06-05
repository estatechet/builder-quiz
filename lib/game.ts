"use client";

import { BUILDERS, BuilderEntry } from "@/data/brands";
import { shuffle } from "@/lib/utils";

export const START_LIVES = 3;
export const MAX_LIVES = 30;

export type Level = 1 | 2;

export type GameState = {
  level: Level;
  lives: number;
  seenIds: number[];           // 현재 라운드 내 출제 완료
  round: number;               // 한 바퀴 다 돌면 +1
  totalAnswered: number;
  totalCorrect: number;
  gameOver: boolean;
  reachedLv2: boolean;
};

export type Best = {
  highestLives: number;
  reachedLv2: boolean;
  longestRun: number;          // 한 번에 푼 문제 수
};

export type Question = {
  entry: BuilderEntry;
  question: string;
  questionLabel: string;
  correct: string;              // Lv1 정답 텍스트 (Lv2에서는 표시용)
  options: string[];            // Lv1 4지선다
  mode: "builder-to-brand" | "brand-to-builder";
};

const KEY = "builder-quiz:game:v1";
const BEST_KEY = "builder-quiz:best:v1";

export function initialGame(): GameState {
  return {
    level: 1,
    lives: START_LIVES,
    seenIds: [],
    round: 1,
    totalAnswered: 0,
    totalCorrect: 0,
    gameOver: false,
    reachedLv2: false,
  };
}

export function loadGame(): GameState {
  if (typeof window === "undefined") return initialGame();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialGame();
    return { ...initialGame(), ...JSON.parse(raw) };
  } catch {
    return initialGame();
  }
}

export function saveGame(s: GameState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearGame() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

export function loadBest(): Best {
  if (typeof window === "undefined") return { highestLives: 0, reachedLv2: false, longestRun: 0 };
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (!raw) return { highestLives: 0, reachedLv2: false, longestRun: 0 };
    return JSON.parse(raw);
  } catch {
    return { highestLives: 0, reachedLv2: false, longestRun: 0 };
  }
}

export function saveBest(b: Best) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BEST_KEY, JSON.stringify(b));
}

export function updateBestFrom(prev: Best, g: GameState): Best {
  return {
    highestLives: Math.max(prev.highestLives, g.lives),
    reachedLv2: prev.reachedLv2 || g.reachedLv2,
    longestRun: Math.max(prev.longestRun, g.totalAnswered),
  };
}

/**
 * 한 라운드 내 중복 없이 다음 문제 뽑기.
 * 모두 출제 완료되면 round +1 + seenIds 리셋.
 */
export function nextQuestion(
  g: GameState,
  forcedMode?: "builder-to-brand" | "brand-to-builder"
): { question: Question; nextSeen: number[]; nextRound: number } {
  let available = BUILDERS.filter((b) => !g.seenIds.includes(b.id));
  let nextRound = g.round;
  let baseSeen = g.seenIds;
  if (available.length === 0) {
    available = BUILDERS;
    nextRound = g.round + 1;
    baseSeen = [];
  }
  const entry = available[Math.floor(Math.random() * available.length)];
  const mode: "builder-to-brand" | "brand-to-builder" =
    forcedMode ?? (Math.random() < 0.5 ? "builder-to-brand" : "brand-to-builder");

  const correct = mode === "builder-to-brand" ? entry.brands[0] : entry.builder;
  const wrongs = shuffle(
    BUILDERS.filter((b) => b.id !== entry.id).map((b) => (mode === "builder-to-brand" ? b.brands[0] : b.builder))
  ).slice(0, 3);

  const question: Question = {
    entry,
    mode,
    question: mode === "builder-to-brand" ? entry.builder : entry.brands[0],
    questionLabel: mode === "builder-to-brand" ? "이 시공사의 대표 브랜드는?" : "이 브랜드의 시공사는?",
    correct,
    options: shuffle([correct, ...wrongs]),
  };

  return { question, nextSeen: [...baseSeen, entry.id], nextRound };
}

/** 단답형 입력 정규화 */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFC")
    .replace(/[\s()（）\-_·.\[\]【】「」/,]/g, "")
    .trim();
}

/** Lv2 답안 채점: brands + premium + aliases 중 하나와 정규화 일치 */
export function checkTextAnswer(input: string, entry: BuilderEntry): boolean {
  const acceptable = [
    ...entry.brands,
    ...(entry.premium ?? []),
    ...(entry.aliases ?? []),
  ];
  const i = normalize(input);
  if (!i) return false;
  return acceptable.some((t) => normalize(t) === i);
}

export type ApplyResult = {
  game: GameState;
  best: Best;
  justLeveledUp: boolean;
};

/** 정답/오답 결과를 상태에 반영 */
export function applyAnswer(g: GameState, b: Best, correct: boolean): ApplyResult {
  const delta = correct ? 1 : -1;
  const newLives = Math.max(0, Math.min(MAX_LIVES, g.lives + delta));
  const justLeveledUp = g.level === 1 && correct && newLives === MAX_LIVES;
  const newLevel: Level = justLeveledUp ? 2 : g.level;

  const next: GameState = {
    ...g,
    lives: newLives,
    level: newLevel,
    reachedLv2: g.reachedLv2 || justLeveledUp,
    gameOver: newLives <= 0,
    totalAnswered: g.totalAnswered + 1,
    totalCorrect: g.totalCorrect + (correct ? 1 : 0),
  };
  // 레벨업 시 라운드 새로 시작
  if (justLeveledUp) {
    next.seenIds = [];
    next.round = 1;
  }
  // 게임오버 시 totalAnswered 리셋은 다음 게임에서 (best 갱신은 여기서)
  return { game: next, best: updateBestFrom(b, next), justLeveledUp };
}
