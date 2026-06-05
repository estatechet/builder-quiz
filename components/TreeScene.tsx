"use client";

import { useEffect, useState } from "react";
import { MAX_STRIKES, TARGET_CORRECT } from "@/lib/game";

type Action = "none" | "climb" | "wobble" | "fall";

type Props = {
  correctCount: number;
  strikes: number;
  level: 1 | 2;
  round: number;
  lastAction: Action;
  actionKey: number;
};

type Particle = { id: number; left: number; lx: number; lr: number; emoji: string; kind: "fall" | "up" };

export default function TreeScene({ correctCount, strikes, level, round, lastAction, actionKey }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);

  // 액션마다 파티클 생성
  useEffect(() => {
    if (actionKey === 0 || lastAction === "none" || lastAction === "fall") return;

    const newParts: Particle[] = [];
    if (lastAction === "climb") {
      // 스파클 위로 튀기
      for (let i = 0; i < 4; i++) {
        newParts.push({
          id: Date.now() + i,
          left: 45 + Math.random() * 10,
          lx: (Math.random() - 0.5) * 60,
          lr: 0,
          emoji: "✨",
          kind: "up",
        });
      }
    } else if (lastAction === "wobble") {
      // 잎 떨어지기
      for (let i = 0; i < 6; i++) {
        newParts.push({
          id: Date.now() + i,
          left: 35 + Math.random() * 30,
          lx: (Math.random() - 0.5) * 80,
          lr: (Math.random() - 0.5) * 540,
          emoji: "🍃",
          kind: "fall",
        });
      }
    }

    setParticles((prev) => [...prev, ...newParts]);
    const t = setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParts.some((n) => n.id === p.id)));
    }, 1600);
    return () => clearTimeout(t);
  }, [actionKey, lastAction]);

  // 다람쥐 위치 — Lv1은 진행도에 비례, Lv2는 최상단 고정
  const yPct =
    level === 2 ? 12 : Math.max(15, 80 - (correctCount / TARGET_CORRECT) * 65);

  const animClass =
    lastAction === "fall" ? "squirrel-fall" :
    lastAction === "wobble" ? "squirrel-wobble" :
    lastAction === "climb" ? "squirrel-climb" :
    "squirrel-idle";

  const treeShake = (lastAction === "wobble" || lastAction === "fall") && actionKey > 0;

  // 진행도 게이지
  const progressPct = level === 1 ? (correctCount / TARGET_CORRECT) * 100 : 100;

  return (
    <div
      className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-border"
      style={{ background: "linear-gradient(to bottom, #1a2540 0%, #0e1320 60%, #1a1410 100%)" }}
    >
      {/* 별 */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        {[
          [12, 18], [20, 82], [8, 65], [25, 8], [15, 42], [22, 92],
        ].map(([top, left], i) => (
          <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full" style={{ top: `${top}%`, left: `${left}%` }} />
        ))}
      </div>

      {/* 나무 SVG */}
      <svg
        viewBox="0 0 200 300"
        preserveAspectRatio="xMidYMax meet"
        className={`absolute inset-0 w-full h-full ${treeShake ? "tree-shake" : ""}`}
        key={`tree-${actionKey}-${lastAction}`}
      >
        {/* 잎 덩어리 */}
        <ellipse cx="100" cy="55" rx="68" ry="48" fill="#1e4a32" />
        <ellipse cx="60" cy="90" rx="36" ry="28" fill="#2d5e42" />
        <ellipse cx="140" cy="90" rx="36" ry="28" fill="#2d5e42" />
        <ellipse cx="100" cy="110" rx="55" ry="22" fill="#34754d" />
        <ellipse cx="80" cy="45" rx="12" ry="8" fill="#3a6e4a" opacity="0.7" />
        <ellipse cx="125" cy="50" rx="14" ry="9" fill="#3a6e4a" opacity="0.7" />
        {/* 줄기 */}
        <rect x="91" y="108" width="18" height="180" fill="#4a2e1a" rx="2" />
        {/* 줄기 무늬 */}
        <rect x="91" y="140" width="18" height="2" fill="#2a1810" opacity="0.6" />
        <rect x="91" y="200" width="18" height="2" fill="#2a1810" opacity="0.6" />
        <rect x="91" y="245" width="18" height="2" fill="#2a1810" opacity="0.6" />
        {/* 가지 */}
        <rect x="109" y="165" width="38" height="5" fill="#4a2e1a" rx="2" />
        <rect x="55" y="195" width="38" height="5" fill="#4a2e1a" rx="2" />
        {/* 땅 */}
        <rect x="0" y="282" width="200" height="18" fill="#3d2818" />
        <ellipse cx="100" cy="285" rx="50" ry="6" fill="#5C3A20" opacity="0.6" />
      </svg>

      {/* 파티클 */}
      {particles.map((p) => (
        <span
          key={p.id}
          className={`text-base ${p.kind === "fall" ? "particle-fall" : "sparkle-up"}`}
          style={{
            top: p.kind === "fall" ? "40%" : `${yPct}%`,
            left: `${p.left}%`,
            ["--lx" as any]: `${p.lx}px`,
            ["--lr" as any]: `${p.lr}deg`,
            ["--sx" as any]: `${p.lx}px`,
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* 다람쥐 */}
      <div
        key={`sq-${lastAction}-${actionKey}`}
        className={`absolute text-4xl sm:text-5xl select-none drop-shadow-lg ${animClass}`}
        style={{
          left: "50%",
          top: `${yPct}%`,
          transform: "translate(-50%, -50%)",
          transition:
            lastAction === "fall" ? "none" :
            lastAction === "wobble" ? "none" :
            "top 0.65s cubic-bezier(.34, 1.5, .64, 1)",
        }}
        aria-label="squirrel"
      >
        🐿️
      </div>

      {/* HUD: 좌상단 레벨/라운드, 우상단 하트, 하단 진행 게이지 */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between text-[11px] z-10">
        <div className="flex gap-1">
          <span className="px-1.5 py-0.5 rounded bg-accent text-bg font-bold">Lv{level}</span>
          <span className="px-1.5 py-0.5 rounded bg-bg/70 backdrop-blur text-muted">R{round}</span>
        </div>
        <Hearts strikes={strikes} max={MAX_STRIKES} />
      </div>

      {/* 진행 게이지 (Lv1 만) */}
      {level === 1 && (
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="flex justify-between text-[10px] text-white/70 mb-1 tabular-nums">
            <span>정답 {correctCount} / {TARGET_CORRECT}</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/50 overflow-hidden">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%`, background: progressPct >= 100 ? "#34d399" : "#6ea8fe" }}
            />
          </div>
        </div>
      )}
      {level === 2 && (
        <div className="absolute bottom-3 left-3 right-3 z-10 text-center">
          <span className="px-2 py-0.5 rounded bg-accent/30 text-accent text-[10px] font-bold tracking-wider">
            LV 2 · 단답형 정답 {correctCount}
          </span>
        </div>
      )}
    </div>
  );
}

function Hearts({ strikes, max }: { strikes: number; max: number }) {
  const remaining = max - strikes;
  return (
    <div className="flex gap-0.5 px-2 py-0.5 rounded bg-bg/70 backdrop-blur text-base">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < remaining;
        return (
          <span key={i} className={filled ? "" : "opacity-25 grayscale"}>
            {filled ? "❤️" : "🤍"}
          </span>
        );
      })}
    </div>
  );
}
