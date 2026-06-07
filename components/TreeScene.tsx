"use client";

import { useEffect, useState } from "react";
import { LV2_TARGET, MAX_STRIKES, Mood, TARGET_CORRECT } from "@/lib/game";

type Action = "none" | "climb" | "wobble" | "fall";

type Props = {
  correctCount: number;
  strikes: number;
  level: 1 | 2;
  round: number;
  lastAction: Action;
  actionKey: number;
  mood: Mood;
};

type Particle = { id: number; left: number; top: number; lx: number; lr: number; emoji: string; kind: "fall" | "up" };

// 새 일러스트의 우측 도토리 3개 위치 (목숨)
const ACORN_POSITIONS = [
  { top: "21%", right: "4.5%" },
  { top: "39%", right: "4.5%" },
  { top: "57%", right: "4.5%" },
];

export default function TreeScene({
  correctCount,
  strikes,
  level,
  round,
  lastAction,
  actionKey,
  mood,
}: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (actionKey === 0 || lastAction === "none" || lastAction === "fall") return;
    const newParts: Particle[] = [];
    if (lastAction === "climb") {
      for (let i = 0; i < 6; i++) {
        newParts.push({
          id: Date.now() + i,
          left: 35 + Math.random() * 20,
          top: 50,
          lx: (Math.random() - 0.5) * 70,
          lr: 0,
          emoji: i % 2 === 0 ? "✨" : "🌟",
          kind: "up",
        });
      }
    } else if (lastAction === "wobble") {
      for (let i = 0; i < 7; i++) {
        newParts.push({
          id: Date.now() + i,
          left: 30 + Math.random() * 35,
          top: 35,
          lx: (Math.random() - 0.5) * 90,
          lr: (Math.random() - 0.5) * 540,
          emoji: i % 3 === 0 ? "🍂" : "🍃",
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

  // 다람쥐 위치 — 일러스트의 다람쥐 원위치에 고정 (인페인트 자국 가림)
  // 진행도 시각화는 우상단 카운터 + 하단 게이지로
  const yPct = 53;

  const animClass =
    lastAction === "fall" ? "squirrel-sprite-fall" :
    lastAction === "wobble" ? "squirrel-sprite-wobble" :
    lastAction === "climb" ? "squirrel-sprite-climb" :
    "squirrel-sprite-idle";

  const treeShake = (lastAction === "wobble" || lastAction === "fall") && actionKey > 0;

  const moodEmote =
    mood === "shocked" ? "😱" :
    mood === "sad" ? "💧" :
    null;

  const squirrelFilter =
    mood === "sad" ? "saturate(0.55) brightness(0.85)" :
    mood === "shocked" ? "saturate(0.7)" :
    "none";

  const target = level === 2 ? LV2_TARGET : TARGET_CORRECT;
  const progressPct = Math.min(100, (correctCount / target) * 100);

  return (
    <div
      className="relative w-full aspect-square mx-auto rounded-3xl overflow-hidden border-2 border-amber-900/40 shadow-2xl"
      style={{
        // 모바일 한 화면에 다 들어오게 더 컴팩트하게: 헤더 + 카드(고정 옵션) + 여백 약 420px
        maxHeight: "min(calc(100svh - 420px), 72vw)",
        maxWidth: "calc(100svh - 420px)",
      }}
    >
      {/* 배경 (다람쥐만 제거된 새 일러스트) */}
      <div className={`absolute inset-0 ${treeShake ? "tree-shake" : ""}`} key={`bg-${treeShake ? actionKey : 0}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/scene-bg-v6.png"
          alt="숲 배경"
          className="w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* 우상단 도토리 카운터 — Lv1=30, Lv2=10 */}
      <div
        key={`acorn-counter-${correctCount}-${level}`}
        className={`absolute z-20 px-3 py-2 rounded-xl border-[3px] shadow-lg flex items-center justify-center gap-2 ${
          correctCount > 0 ? "acorn-pulse" : ""
        }`}
        style={{
          top: "2%",
          right: "2%",
          width: "24%",
          height: "10%",
          background: correctCount >= (level === 2 ? LV2_TARGET : TARGET_CORRECT)
            ? "linear-gradient(135deg, #fde047, #f59e0b)"
            : "linear-gradient(135deg, #d4a574, #8b5a2b)",
          borderColor: correctCount >= (level === 2 ? LV2_TARGET : TARGET_CORRECT) ? "#92400e" : "#451a03",
          boxShadow: correctCount >= (level === 2 ? LV2_TARGET : TARGET_CORRECT)
            ? "0 0 18px #fbbf24, 0 4px 10px rgba(0,0,0,0.4)"
            : "0 4px 10px rgba(0,0,0,0.4)",
        }}
      >
        <span className="text-xl sm:text-2xl drop-shadow">🌰</span>
        <span className="text-white font-black text-sm sm:text-base tabular-nums drop-shadow">
          {correctCount}
          <span className="text-amber-200 text-xs sm:text-sm">/{level === 2 ? LV2_TARGET : TARGET_CORRECT}</span>
        </span>
      </div>

      {/* 우측 도토리 3개 = 목숨. strikes 만큼 가려짐 */}
      {ACORN_POSITIONS.map((pos, i) => {
        const used = i < strikes;
        if (!used) return null;
        return (
          <div
            key={i}
            className="absolute rounded-full grid place-items-center z-[5] acorn-broken"
            style={{
              top: pos.top,
              right: pos.right,
              width: "13%",
              aspectRatio: "1/1",
              background:
                "radial-gradient(circle, rgba(20,15,10,0.88) 55%, rgba(20,15,10,0.55) 75%, transparent 100%)",
            }}
          >
            <span className="text-2xl sm:text-3xl text-red-400 font-black drop-shadow"
                  style={{ textShadow: "0 0 6px rgba(0,0,0,0.8)" }}>
              ✗
            </span>
          </div>
        );
      })}

      {/* 오답 빨강 플래시 */}
      {(lastAction === "wobble" || lastAction === "fall") && actionKey > 0 && (
        <div
          key={`flash-${actionKey}`}
          className="absolute inset-0 bg-red-900/25 pointer-events-none z-[6]"
          style={{ animation: "scene-flash 0.6s ease-out" }}
        />
      )}

      {/* 파티클 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[7]">
        {particles.map((p) => (
          <span
            key={p.id}
            className={`absolute text-xl drop-shadow ${p.kind === "fall" ? "particle-fall" : "sparkle-up"}`}
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              ["--lx" as any]: `${p.lx}px`,
              ["--lr" as any]: `${p.lr}deg`,
              ["--sx" as any]: `${p.lx}px`,
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>

      {/* 다람쥐 스프라이트 — 일러스트 원위치에 고정, 솔리드 갈색 영역을 완전히 덮음 */}
      <div
        key={`sq-${lastAction}-${actionKey}`}
        className={`absolute pointer-events-none z-[8] ${animClass}`}
        style={{
          left: "42%",
          top: `${yPct}%`,
          width: "48%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/squirrel-v2.png"
            alt="squirrel"
            className="w-full h-auto select-none drop-shadow-lg"
            style={{ filter: squirrelFilter, transition: "filter 0.3s" }}
            draggable={false}
          />
          {moodEmote && (
            <span
              className="absolute drop-shadow"
              style={{
                top: "-8%",
                right: "-12%",
                fontSize: "2rem",
                animation: "mood-bob 0.9s ease-in-out infinite",
              }}
            >
              {moodEmote}
            </span>
          )}
        </div>
      </div>

      {/* 하단 진행 게이지 — 일러스트의 노란 게이지 위에 덮음 */}
      <div className="absolute bottom-[2%] left-[3%] right-[20%] z-10">
        <div className="h-3 sm:h-3.5 bg-black/55 rounded-full overflow-hidden border border-amber-950/60">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, #f59e0b, #fde047, #f59e0b)",
              boxShadow: "0 0 10px #fbbf24aa",
            }}
          />
        </div>
      </div>

      {/* 우하단 Lv·R 라벨 — 일러스트의 텍스트 위에 덮음 */}
      <div className="absolute bottom-[6%] right-[3%] z-10">
        <span className="px-2 py-0.5 rounded bg-black/55 backdrop-blur text-white text-[10px] sm:text-xs font-bold tabular-nums">
          Lv{level} · R{round}
        </span>
      </div>
    </div>
  );
}
