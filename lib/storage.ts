"use client";

export type Stat = {
  attempts: number;
  correct: number;
  lastWrongAt?: number;
};

export type QuizMode = "builder-to-brand" | "brand-to-builder";

const KEY = "builder-quiz:v1";

type Store = {
  stats: Record<string, Stat>;        // key: `${mode}:${builderId}`
  session: { correct: number; total: number; streak: number; bestStreak: number };
};

const empty = (): Store => ({
  stats: {},
  session: { correct: 0, total: 0, streak: 0, bestStreak: 0 },
});

export function loadStore(): Store {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

export function saveStore(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function recordAnswer(mode: QuizMode, builderId: number, correct: boolean) {
  const s = loadStore();
  const key = `${mode}:${builderId}`;
  const cur = s.stats[key] ?? { attempts: 0, correct: 0 };
  cur.attempts += 1;
  if (correct) cur.correct += 1;
  else cur.lastWrongAt = Date.now();
  s.stats[key] = cur;

  s.session.total += 1;
  if (correct) {
    s.session.correct += 1;
    s.session.streak += 1;
    if (s.session.streak > s.session.bestStreak) s.session.bestStreak = s.session.streak;
  } else {
    s.session.streak = 0;
  }
  saveStore(s);
  return s;
}

export function resetSession() {
  const s = loadStore();
  s.session = { correct: 0, total: 0, streak: 0, bestStreak: s.session.bestStreak };
  saveStore(s);
  return s;
}

export function resetAll() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
