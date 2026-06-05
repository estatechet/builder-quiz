"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BUILDERS, BuilderEntry } from "@/data/brands";
import { pickQuestion } from "@/lib/utils";
import { loadStore, recordAnswer, resetSession } from "@/lib/storage";
import { randomTaunt, Taunt } from "@/data/taunts";
import BrandLogo from "@/components/BrandLogo";

type Mode = "builder-to-brand" | "brand-to-builder" | "mixed";

type Q = {
  entry: BuilderEntry;
  question: string;
  questionLabel: string;
  correct: string;
  options: string[];
  mode: "builder-to-brand" | "brand-to-builder";
};

function generate(mode: Mode, weakBias: boolean): Q {
  const actual: "builder-to-brand" | "brand-to-builder" =
    mode === "mixed" ? (Math.random() < 0.5 ? "builder-to-brand" : "brand-to-builder") : mode;

  let pool: number[] | undefined;
  if (weakBias) {
    const store = loadStore();
    const scored = BUILDERS.map((b) => {
      const k = store.stats[`${actual}:${b.id}`];
      const rate = k && k.attempts ? k.correct / k.attempts : 0.5;
      const weight = Math.max(1, Math.round((1 - rate) * 5));
      return { id: b.id, weight };
    });
    pool = scored.flatMap((s) => Array(s.weight).fill(s.id));
  }
  const q = pickQuestion(actual, pool);
  return { ...q, mode: actual };
}

export default function Quiz() {
  const params = useSearchParams();
  const initialMode = (params.get("mode") as Mode) || "mixed";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [weakBias, setWeakBias] = useState(true);
  const [q, setQ] = useState<Q | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [session, setSession] = useState(loadStore().session);
  const [taunt, setTaunt] = useState<Taunt | null>(null);

  useEffect(() => { resetSession(); setSession(loadStore().session); }, []);
  useEffect(() => { setQ(generate(mode, weakBias)); setPicked(null); setTaunt(null); }, [mode, weakBias]);

  const next = () => { setQ(generate(mode, weakBias)); setPicked(null); setTaunt(null); };

  const choose = (opt: string) => {
    if (picked || !q) return;
    setPicked(opt);
    const correct = opt === q.correct;
    const s = recordAnswer(q.mode, q.entry.id, correct);
    setSession(s.session);
    setTaunt(correct ? null : randomTaunt());
  };

  if (!q) return null;
  const isCorrect = picked === q.correct;
  const acc = session.total ? Math.round((session.correct / session.total) * 100) : 0;
  // 정답 브랜드 (시공사→브랜드 모드면 q.correct, 브랜드→시공사 모드면 q.entry.brands[0])
  const revealBrand = q.mode === "builder-to-brand" ? q.entry.brands[0] : q.entry.brands[0];

  return (
    <div className="grid gap-4">
      {/* 컴팩트 헤더: 모드 + 세션 통계 */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex gap-1">
          {(["mixed", "builder-to-brand", "brand-to-builder"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2 py-1 rounded ${mode === m ? "bg-accent text-bg font-medium" : "text-muted hover:text-text"}`}
            >
              {m === "mixed" ? "혼합" : m === "builder-to-brand" ? "시공사→브랜드" : "브랜드→시공사"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-muted tabular-nums">
          <span>{acc}% · {session.correct}/{session.total}</span>
          <span>🔥 {session.streak}</span>
        </div>
      </div>

      {/* 질문 카드 */}
      <div className="card !p-6 text-center">
        <div className="text-[11px] text-muted mb-3">{q.questionLabel}</div>
        <div className="text-3xl sm:text-4xl font-bold break-keep">{q.question}</div>
      </div>

      {/* 선택지 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {q.options.map((opt) => {
          const correct = picked && opt === q.correct;
          const wrong = picked === opt && opt !== q.correct;
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              disabled={!!picked}
              className={[
                "px-4 py-3 rounded-xl border text-left text-base transition-all",
                picked ? "cursor-default" : "hover:bg-panel2 active:scale-[0.98]",
                correct ? "border-good bg-good/10 text-good font-medium" :
                wrong ? "border-bad bg-bad/10 text-bad" :
                "border-border bg-panel",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* 야유 (오답 시) */}
      {taunt && (
        <div
          key={taunt.line}
          className="border border-bad/50 bg-bad/10 rounded-xl p-3 flex items-center gap-3 taunt-bubble"
        >
          <div className="text-4xl shrink-0 taunt-face">{taunt.face}</div>
          <div className="text-bad font-bold text-base break-keep">{taunt.line}</div>
        </div>
      )}

      {/* 정답 공개 (로고 포함) */}
      {picked && (
        <div className="card reveal-pop !p-4 grid gap-3">
          <div className="flex justify-center">
            <BrandLogo brand={revealBrand} size="lg" />
          </div>
          <div className="text-center">
            <div className={`text-xs ${isCorrect ? "text-good" : "text-muted"}`}>
              {isCorrect ? "정답!" : "정답은"}
            </div>
            <div className="text-base font-semibold mt-0.5">
              {q.entry.builder} · {q.entry.brands.join(", ")}
            </div>
            {q.entry.premium && (
              <div className="text-xs text-accent mt-0.5">프리미엄: {q.entry.premium.join(", ")}</div>
            )}
            {q.entry.note && <div className="text-[11px] text-muted mt-1">{q.entry.note}</div>}
          </div>
          <button className="btn btn-primary !py-3" onClick={next}>다음 →</button>
        </div>
      )}

      {/* 약점 가중치 토글 (작게) */}
      <label className="flex items-center justify-center gap-1.5 text-[11px] text-muted select-none">
        <input type="checkbox" checked={weakBias} onChange={(e) => setWeakBias(e.target.checked)} className="accent-accent" />
        약점 가중치
      </label>
    </div>
  );
}
