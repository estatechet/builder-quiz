import { BUILDERS, BuilderEntry } from "@/data/brands";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickQuestion(mode: "builder-to-brand" | "brand-to-builder", weighted?: number[]) {
  const pool = weighted && weighted.length ? weighted : BUILDERS.map((b) => b.id);
  const id = pool[Math.floor(Math.random() * pool.length)];
  const entry = BUILDERS.find((b) => b.id === id)!;

  if (mode === "builder-to-brand") {
    const correct = entry.brands[0];
    const wrongs = shuffle(
      BUILDERS.filter((b) => b.id !== entry.id).map((b) => b.brands[0])
    ).slice(0, 3);
    return {
      entry,
      question: entry.builder,
      questionLabel: "이 시공사의 대표 브랜드는?",
      correct,
      options: shuffle([correct, ...wrongs]),
    };
  } else {
    const correct = entry.builder;
    const wrongs = shuffle(
      BUILDERS.filter((b) => b.id !== entry.id).map((b) => b.builder)
    ).slice(0, 3);
    return {
      entry,
      question: entry.brands[0],
      questionLabel: "이 브랜드의 시공사는?",
      correct,
      options: shuffle([correct, ...wrongs]),
    };
  }
}

export function tierColor(tier: BuilderEntry["tier"]) {
  return tier === "S" ? "tier-S" : tier === "A" ? "tier-A" : tier === "B" ? "tier-B" : "tier-C";
}
