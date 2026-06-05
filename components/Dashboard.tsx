"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BUILDERS } from "@/data/brands";
import { loadStore, resetAll } from "@/lib/storage";

export default function Dashboard() {
  const [store, setStore] = useState(loadStore());
  useEffect(() => { setStore(loadStore()); }, []);

  const totalAttempts = Object.values(store.stats).reduce((a, s) => a + s.attempts, 0);
  const totalCorrect = Object.values(store.stats).reduce((a, s) => a + s.correct, 0);
  const acc = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const covered = new Set(Object.keys(store.stats).map((k) => k.split(":")[1])).size;

  const weak = BUILDERS
    .map((b) => {
      const k1 = store.stats[`builder-to-brand:${b.id}`];
      const k2 = store.stats[`brand-to-builder:${b.id}`];
      const attempts = (k1?.attempts ?? 0) + (k2?.attempts ?? 0);
      const correct = (k1?.correct ?? 0) + (k2?.correct ?? 0);
      const rate = attempts ? correct / attempts : -1;
      return { b, attempts, correct, rate };
    })
    .filter((x) => x.attempts > 0)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 5);

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="정답률" value={`${acc}%`} />
        <Stat label="진행" value={`${covered}/${BUILDERS.length}`} />
        <Stat label="연속" value={`${store.session.streak}`} />
      </div>

      <div className="grid gap-2">
        <Link href="/quiz?mode=mixed" className="btn btn-primary !py-4 text-base">퀴즈 시작</Link>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/quiz?mode=builder-to-brand" className="btn">시공사 → 브랜드</Link>
          <Link href="/quiz?mode=brand-to-builder" className="btn">브랜드 → 시공사</Link>
        </div>
      </div>

      {weak.length > 0 && (
        <div>
          <div className="text-xs text-muted mb-2 px-1">자주 틀리는 항목</div>
          <div className="card !p-2 divide-y divide-border">
            {weak.map(({ b, attempts, correct, rate }) => (
              <div key={b.id} className="flex items-center justify-between px-2 py-2 text-sm">
                <div className="truncate">
                  <span className="font-medium">{b.builder}</span>
                  <span className="text-muted text-xs"> · {b.brands.join(", ")}</span>
                </div>
                <span className={`text-xs tabular-nums ${rate < 0.5 ? "text-bad" : "text-amber-300"}`}>
                  {Math.round(rate * 100)}% <span className="text-muted">({correct}/{attempts})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalAttempts > 0 && (
        <button
          className="text-[11px] text-muted hover:text-bad self-center"
          onClick={() => { if (confirm("학습 기록 전체 삭제?")) { resetAll(); setStore(loadStore()); } }}
        >
          기록 초기화
        </button>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card !p-3">
      <div className="text-[10px] text-muted uppercase tracking-wide">{label}</div>
      <div className="text-xl font-bold mt-0.5 tabular-nums">{value}</div>
    </div>
  );
}
