"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BUILDERS, TIER_LABEL } from "@/data/brands";
import { loadStore, resetAll } from "@/lib/storage";
import { tierColor } from "@/lib/utils";

export default function Dashboard() {
  const [store, setStore] = useState(loadStore());
  useEffect(() => { setStore(loadStore()); }, []);

  const totalAttempts = Object.values(store.stats).reduce((a, s) => a + s.attempts, 0);
  const totalCorrect = Object.values(store.stats).reduce((a, s) => a + s.correct, 0);
  const acc = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const covered = new Set(Object.keys(store.stats).map((k) => k.split(":")[1])).size;
  const coveredPct = Math.round((covered / BUILDERS.length) * 100);

  const weakSorted = BUILDERS
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
    .slice(0, 8);

  const tierStats = (["S", "A", "B", "C"] as const).map((t) => {
    const builders = BUILDERS.filter((b) => b.tier === t);
    const seen = builders.filter((b) =>
      store.stats[`builder-to-brand:${b.id}`] || store.stats[`brand-to-builder:${b.id}`]
    ).length;
    return { tier: t, total: builders.length, seen };
  });

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="누적 정답률" value={`${acc}%`} sub={`${totalCorrect} / ${totalAttempts}`} />
        <Stat label="학습 커버리지" value={`${coveredPct}%`} sub={`${covered} / ${BUILDERS.length} 시공사`} />
        <Stat label="이번 세션" value={`${store.session.correct} / ${store.session.total}`} sub={`현재 연속 ${store.session.streak}`} />
        <Stat label="최고 연속" value={`${store.session.bestStreak}`} sub="streak" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-muted">티어별 커버리지</div>
          </div>
          <div className="space-y-3">
            {tierStats.map(({ tier, total, seen }) => (
              <div key={tier}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={tierColor(tier)}>{tier}티어 · {TIER_LABEL[tier]}</span>
                  <span className="text-muted">{seen} / {total}</span>
                </div>
                <div className="h-2 rounded-full bg-panel2 overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${(seen / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-muted mb-3">바로 시작</div>
          <div className="flex flex-col gap-2">
            <Link href="/quiz?mode=builder-to-brand" className="btn btn-primary">시공사 → 브랜드</Link>
            <Link href="/quiz?mode=brand-to-builder" className="btn btn-primary">브랜드 → 시공사</Link>
            <Link href="/quiz?mode=mixed" className="btn">혼합 모드</Link>
            <Link href="/browse" className="btn">전체 브랜드 보기</Link>
            <button
              className="btn text-bad border-bad/40 hover:bg-bad/10"
              onClick={() => { if (confirm("학습 기록 전체 삭제?")) { resetAll(); setStore(loadStore()); } }}
            >
              기록 초기화
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="text-sm text-muted mb-3">자주 틀리는 항목 Top 8</div>
        {weakSorted.length === 0 ? (
          <div className="text-sm text-muted py-6 text-center">아직 데이터가 없습니다. 퀴즈를 풀어보세요.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {weakSorted.map(({ b, attempts, correct, rate }) => (
              <div key={b.id} className="flex items-center justify-between border border-border rounded-xl px-3 py-2">
                <div>
                  <div className="text-sm font-medium">{b.builder}</div>
                  <div className="text-xs text-muted">{b.brands.join(", ")}{b.premium ? ` / ${b.premium.join(", ")}` : ""}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm ${rate < 0.5 ? "text-bad" : "text-amber-300"}`}>{Math.round(rate * 100)}%</div>
                  <div className="text-[11px] text-muted">{correct}/{attempts}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      <div className="text-[11px] text-muted mt-0.5">{sub}</div>
    </div>
  );
}
