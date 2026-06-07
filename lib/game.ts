"use client";

import { BUILDERS, BuilderEntry } from "@/data/brands";
import { shuffle } from "@/lib/utils";

export const TARGET_CORRECT = 30;    // Lv1 → Lv2 진입 정답 수
export const LV2_TARGET = 10;        // Lv2 클리어 (엔딩) 정답 수
export const MAX_STRIKES = 3;        // 누적 오답 한계

export type Level = 1 | 2;
export type Mood = "happy" | "sad" | "shocked";

export type GameState = {
  level: Level;
  correctCount: number;        // 현재 레벨에서 누적 정답 수
  strikes: number;             // 0~3
  seenIds: number[];           // 한 라운드 내 출제 완료
  round: number;
  totalAnswered: number;
  totalCorrect: number;
  gameOver: boolean;
  gameComplete: boolean;       // Lv2 클리어 (엔딩)
  reachedLv2: boolean;
};

export type Best = {
  maxProgressLv1: number;      // Lv1 최고 진행도 (0~30)
  longestRun: number;          // 단일 게임 총 답변
  reachedLv2: boolean;
  bestLv2Correct: number;      // Lv2 단일 게임 최다 정답
};

export type Question = {
  entry: BuilderEntry;
  question: string;
  questionLabel: string;
  correct: string;
  options: string[];
  mode: "builder-to-brand" | "brand-to-builder";
};

const KEY = "builder-quiz:game:v2";
const BEST_KEY = "builder-quiz:best:v2";

export function initialGame(): GameState {
  return {
    level: 1,
    correctCount: 0,
    strikes: 0,
    seenIds: [],
    round: 1,
    totalAnswered: 0,
    totalCorrect: 0,
    gameOver: false,
    gameComplete: false,
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
  if (typeof window === "undefined") return { maxProgressLv1: 0, longestRun: 0, reachedLv2: false, bestLv2Correct: 0 };
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (!raw) return { maxProgressLv1: 0, longestRun: 0, reachedLv2: false, bestLv2Correct: 0 };
    return { maxProgressLv1: 0, longestRun: 0, reachedLv2: false, bestLv2Correct: 0, ...JSON.parse(raw) };
  } catch {
    return { maxProgressLv1: 0, longestRun: 0, reachedLv2: false, bestLv2Correct: 0 };
  }
}

export function saveBest(b: Best) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BEST_KEY, JSON.stringify(b));
}

export function updateBest(prev: Best, g: GameState): Best {
  return {
    maxProgressLv1: g.level === 1 ? Math.max(prev.maxProgressLv1, g.correctCount) : prev.maxProgressLv1,
    longestRun: Math.max(prev.longestRun, g.totalAnswered),
    reachedLv2: prev.reachedLv2 || g.reachedLv2,
    bestLv2Correct: g.level === 2 ? Math.max(prev.bestLv2Correct, g.correctCount) : prev.bestLv2Correct,
  };
}

/** 중복 없이 다음 문제 픽 */
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
    BUILDERS.filter((b) => b.id !== entry.id).map((b) =>
      mode === "builder-to-brand" ? b.brands[0] : b.builder
    )
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

export type ApplyResult2 = ApplyResult & { justCompleted: boolean };

export function applyAnswer(g: GameState, b: Best, correct: boolean): ApplyResult2 {
  let correctCount = g.correctCount;
  let strikes = g.strikes;
  if (correct) correctCount++;
  else strikes++;

  const gameOver = strikes >= MAX_STRIKES;
  const justLeveledUp = g.level === 1 && correctCount >= TARGET_CORRECT && !gameOver;
  const justCompleted = g.level === 2 && correctCount >= LV2_TARGET && !gameOver;

  const next: GameState = {
    ...g,
    correctCount: justLeveledUp ? 0 : correctCount,
    strikes: justLeveledUp ? 0 : strikes,
    level: justLeveledUp ? 2 : g.level,
    reachedLv2: g.reachedLv2 || justLeveledUp,
    gameOver,
    gameComplete: g.gameComplete || justCompleted,
    totalAnswered: g.totalAnswered + 1,
    totalCorrect: g.totalCorrect + (correct ? 1 : 0),
    seenIds: justLeveledUp ? [] : g.seenIds,
    round: justLeveledUp ? 1 : g.round,
  };
  return { game: next, best: updateBest(b, next), justLeveledUp, justCompleted };
}
