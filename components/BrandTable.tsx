"use client";

import { useMemo, useState } from "react";
import { BUILDERS, TIER_LABEL, Tier } from "@/data/brands";
import { tierColor } from "@/lib/utils";

export default function BrandTable() {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<Tier | "ALL">("ALL");

  const rows = useMemo(() => {
    const lower = q.trim().toLowerCase();
    return BUILDERS.filter((b) => tier === "ALL" || b.tier === tier).filter((b) => {
      if (!lower) return true;
      const hay = [b.builder, ...b.brands, ...(b.premium ?? [])].join(" ").toLowerCase();
      return hay.includes(lower);
    });
  }, [q, tier]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="시공사 또는 브랜드 검색…"
          className="px-3 py-2 rounded-xl bg-panel border border-border outline-none text-sm flex-1 min-w-[200px] focus:border-accent"
        />
        <div className="flex gap-1">
          {(["ALL", "S", "A", "B", "C"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`btn !px-3 ${tier === t ? "btn-primary" : ""}`}
            >
              {t === "ALL" ? "전체" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-panel2 text-muted text-xs">
            <tr>
              <th className="text-left px-4 py-3 w-12">#</th>
              <th className="text-left px-4 py-3">시공사</th>
              <th className="text-left px-4 py-3">대표 브랜드</th>
              <th className="text-left px-4 py-3">프리미엄</th>
              <th className="text-left px-4 py-3 w-24">티어</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-t border-border hover:bg-panel2/50">
                <td className="px-4 py-3 text-muted">{b.id}</td>
                <td className="px-4 py-3 font-medium">{b.builder}</td>
                <td className="px-4 py-3">{b.brands.join(", ")}</td>
                <td className="px-4 py-3 text-accent">{b.premium?.join(", ") ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`chip ${tierColor(b.tier)}`}>{b.tier} · {TIER_LABEL[b.tier]}</span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">결과 없음</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
