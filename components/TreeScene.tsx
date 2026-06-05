"use client";

import { useEffect, useState } from "react";
import { MAX_LIVES } from "@/lib/game";

type Props = {
  lives: number;
  level: 1 | 2;
  round: number;
  wobbleKey: number;   // 증가할 때마다 휘청 애니메이션 재생
  falling: boolean;    // true면 떨어지는 애니메이션
};

type Leaf = { id: number; left: number; lx: number; lr: number };

export default function TreeScene({ lives, level, round, wobbleKey, falling }: Props) {
  const [leaves, setLeaves] = useState<Leaf[]>([]);

  // 휘청 시 잎 떨어뜨리기
  useEffect(() => {
    if (wobbleKey === 0) return;
    const newLeaves: Leaf[] = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() + i,
      left: 40 + Math.random() * 20,
      lx: (Math.random() - 0.5) * 80,
      lr: (Math.random() - 0.5) * 540,
    }));
    setLeaves((prev) => [...prev, ...newLeaves]);
    const t = setTimeout(() => {
      setLeaves((prev) => prev.filter((l) => !newLeaves.some((n) => n.id === l.id)));
    }, 1500);
    return () => clearTimeout(t);
  }, [wobbleKey]);

  // 다람쥐 위치: 목숨이 많을수록 위로
  const heightPct = Math.max(15, Math.min(78, 80 - (lives / MAX_LIVES) * 65));

  return (
    <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-border"
         style={{ background: "linear-gradient(to bottom, #1a2540 0%, #0b0d10 70%, #1a1410 100%)" }}>
      {/* 별 (작은 점 몇 개로 분위기) */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full" style={{ top: "12%", left: "18%" }} />
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full" style={{ top: "20%", left: "82%" }} />
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full" style={{ top: "8%", left: "65%" }} />
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full" style={{ top: "25%", left: "8%" }} />
      </div>

      {/* 나무 SVG */}
      <svg
        viewBox="0 0 200 300"
        preserveAspectRatio="xMidYMax meet"
        className={`absolute inset-0 w-full h-full ${wobbleKey > 0 ? "tree-shake" : ""}`}
        key={`tree-${wobbleKey}`}
      >
        {/* 잎 덩어리 */}
        <ellipse cx="100" cy="55" rx="68" ry="48" fill="#1e4a32" />
        <ellipse cx="60" cy="90" rx="36" ry="28" fill="#2d5e42" />
        <ellipse cx="140" cy="90" rx="36" ry="28" fill="#2d5e42" />
        <ellipse cx="100" cy="110" rx="55" ry="22" fill="#34754d" />
        {/* 잎 디테일 */}
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

      {/* 떨어지는 잎들 */}
      {leaves.map((l) => (
        <span
          key={l.id}
          className="leaf-fall text-base"
          style={{
            top: "40%",
            left: `${l.left}%`,
            ["--lx" as any]: `${l.lx}px`,
            ["--lr" as any]: `${l.lr}deg`,
          }}
        >
          🍃
        </span>
      ))}

      {/* 다람쥐 */}
      <div
        key={falling ? "falling" : `squirrel-${wobbleKey}`}
        className={`absolute text-3xl sm:text-4xl select-none drop-shadow-lg ${
          falling ? "squirrel-fall" : wobbleKey > 0 ? "squirrel-wobble" : "squirrel-idle"
        }`}
        style={{
          left: "50%",
          top: `${heightPct}%`,
          transform: "translate(-50%, -50%)",
        }}
        aria-label="squirrel"
      >
        🐿️
      </div>

      {/* HUD */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-accent text-bg font-bold">Lv{level}</span>
          <span className="px-1.5 py-0.5 rounded bg-bg/70 backdrop-blur text-muted">R{round}</span>
        </div>
        <div className="px-2 py-0.5 rounded bg-bg/70 backdrop-blur tabular-nums">
          <span className={lives <= 3 ? "text-bad font-bold" : lives === MAX_LIVES ? "text-good font-bold" : "text-text font-bold"}>
            ❤️ {lives}
          </span>
          <span className="text-muted"> / {MAX_LIVES}</span>
        </div>
      </div>
    </div>
  );
}
