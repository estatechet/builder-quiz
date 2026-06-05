"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BUILDERS, BuilderEntry } from "@/data/brands";
import { pickQuestion, tierColor, shuffle } from "@/lib/utils";
import { loadStore, recordAnswer, resetSession } from "@/lib/storage";

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

  useEffect(() => { resetSession(); setSession(loadStore().session); }, []);
  useEffect(() => { setQ(generate(mode, weakBias)); setPicked(null); }, [mode, weakBias]);

  const next = () => { setQ(generate(mode, weakBias)); setPicked(null); };

  const choose = (opt: string) => {
    if (picked || !q) return;
    setPicked(opt);
    const correct = opt === q.correct;
    const s = recordAnswer(q.mode, q.entry.id, correct);
    setSession(s.session);
  };

  const acc = session.total ? Math.round((session.correct / session.total) * 100) : 0;

  if (!q) return null;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["builder-to-brand", "brand-to-builder", "mixed"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`btn ${mode === m ? "btn-primary" : ""}`}
            >
              {m === "builder-to-brand" ? "시공사→브랜드" : m === "brand-to-builder" ? "브랜드→시공사" : "혼합"}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-muted select-none">
          <input type="checkbox" checked={weakBias} onChange={(e) => setWeakBias(e.target.checked)} />
          약점 가중치 (자주 틀린 항목 더 자주 출제)
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Mini label="이번 세션 정답률" value={`${acc}%`} sub={`${session.correct}/${session.total}`} />
        <Mini label="연속 정답" value={`${session.streak}`} sub="streak" />
        <Mini label="최고 연속" value={`${session.bestStreak}`} sub="best" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="chip">{q.mode === "builder-to-brand" ? "시공사→브랜드" : "브랜드→시공사"}</span>
          <span className={`chip ${tierColor(q.entry.tier)}`}>{q.entry.tier}티어</span>
        </div>
        <div className="text-sm text-muted">{q.questionLabel}</div>
        <div className="text-3xl font-bold mt-2 mb-6 break-keep">{q.question}</div>

        <div className="grid sm:grid-cols-2 gap-2">
          {q.options.map((opt) => {
            const isCorrect = picked && opt === q.correct;
            const isWrong = picked === opt && opt !== q.correct;
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                disabled={!!picked}
                className={[
                  "text-left px-4 py-3 rounded-xl border transition-all",
                  picked ? "cursor-default" : "hover:bg-panel2",
                  isCorrect ? "border-good bg-good/10 text-good" :
                  isWrong ? "border-bad bg-bad/10 text-bad" :
                  "border-border bg-panel",
                ].join(" ")}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {picked && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div className="text-sm">
              <div className="text-muted">정답</div>
              <div className="text-base font-semibold">
                {q.entry.builder} · {q.entry.brands.join(", ")}
                {q.entry.premium && <span className="text-accent"> / {q.entry.premium.join(", ")} (프리미엄)</span>}
              </div>
              {q.entry.note && <div className="text-xs text-muted mt-0.5">{q.entry.note}</div>}
            </div>
            <button className="btn btn-primary" onClick={next}>다음 문제 →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Mini({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card py-3">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[11px] text-muted">{sub}</div>
    </div>
  );
}
