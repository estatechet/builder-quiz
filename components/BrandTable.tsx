"use client";

import { useMemo, useState } from "react";
import { BUILDERS, Tier } from "@/data/brands";
import BrandLogo from "@/components/BrandLogo";

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
    <div className="grid gap-3">
      <div className="flex gap-2 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="검색..."
          className="px-3 py-2 rounded-lg bg-panel border border-border outline-none text-sm flex-1 focus:border-accent"
        />
        <div className="flex gap-0.5">
          {(["ALL", "S", "A", "B", "C"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`px-2 py-1.5 rounded text-xs ${tier === t ? "bg-accent text-bg font-medium" : "text-muted hover:text-text"}`}
            >
              {t === "ALL" ? "전체" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        {rows.map((b) => (
          <div key={b.id} className="card !p-3 flex items-center gap-3">
            <div className="shrink-0">
              <BrandLogo brand={b.brands[0]} size="sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{b.builder}</div>
              <div className="text-xs text-muted truncate">
                {b.brands.join(", ")}
                {b.premium && <span className="text-accent"> / {b.premium.join(", ")}</span>}
              </div>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border border-border tier-${b.tier}`}>{b.tier}</span>
          </div>
        ))}
        {rows.length === 0 && <div className="text-center text-muted text-sm py-10">결과 없음</div>}
      </div>
    </div>
  );
}
