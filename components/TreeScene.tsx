"use client";

import { useEffect, useState } from "react";
import { MAX_STRIKES, Mood, TARGET_CORRECT } from "@/lib/game";

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
          left: 30 + Math.random() * 20,
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
          left: 25 + Math.random() * 35,
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

  // 다람쥐 Y 위치 (트렁크 위 아래 이동)
  // 0 정답: top 70% (낮음), 30 정답: top 15% (높음)
  const yPct =
    level === 2 ? 12 : Math.max(15, 70 - (correctCount / TARGET_CORRECT) * 55);

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

  const remainingHearts = MAX_STRIKES - strikes;

  // sad일 때 다람쥐 색감
  const squirrelFilter =
    mood === "sad" ? "saturate(0.55) brightness(0.85)" :
    mood === "shocked" ? "saturate(0.7)" :
    "none";

  return (
    <div className="relative w-full aspect-square max-h-[62vh] mx-auto rounded-3xl overflow-hidden border-4 border-amber-900/50 shadow-2xl">
      {/* 배경 (다람쥐 제거된 씬) */}
      <div className={`absolute inset-0 ${treeShake ? "tree-shake" : ""}`} key={`bg-${treeShake ? actionKey : 0}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/scene-bg.png"
          alt="숲 배경"
          className="w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* 오답 빨강 플래시 */}
      {(lastAction === "wobble" || lastAction === "fall") && actionKey > 0 && (
        <div
          key={`flash-${actionKey}`}
          className="absolute inset-0 bg-red-900/25 pointer-events-none"
          style={{ animation: "scene-flash 0.6s ease-out" }}
        />
      )}

      {/* 파티클 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
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

      {/* 다람쥐 스프라이트 (움직임의 주인공) */}
      <div
        key={`sq-${lastAction}-${actionKey}`}
        className={`absolute pointer-events-none ${animClass}`}
        style={{
          left: "38%",
          top: `${yPct}%`,
          width: "32%",
          transform: "translate(-50%, -50%)",
          transition:
            lastAction === "fall" || lastAction === "wobble"
              ? "none"
              : "top 0.65s cubic-bezier(.34, 1.5, .64, 1)",
        }}
      >
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/squirrel.png"
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

      {/* HUD 좌상단: 아바타 + 하트 */}
      <div className="absolute top-[3.5%] left-[3.5%] flex items-center gap-1.5 z-10">
        <div
          className="rounded-xl border-[3px] border-amber-950 shadow-lg grid place-items-center text-3xl bg-gradient-to-br from-amber-200 to-amber-700"
          style={{ width: "52px", height: "52px" }}
        >
          {mood === "shocked" ? "😱" : mood === "sad" ? "😢" : "🐿️"}
        </div>
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`text-2xl sm:text-3xl drop-shadow transition-all ${
                i < remainingHearts ? "" : "opacity-25 grayscale scale-90"
              }`}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* HUD 우상단: 도토리 카운터 */}
      <div
        className="absolute top-[3.5%] right-[3.5%] px-3 py-1.5 rounded-xl border-[3px] border-amber-950 shadow-lg flex items-center gap-1.5 z-10"
        style={{ background: "linear-gradient(135deg, #d4a574, #8b5a2b)" }}
      >
        <span className="text-2xl drop-shadow">🌰</span>
        <span className="text-white font-black text-base sm:text-lg tabular-nums drop-shadow">
          × {correctCount}
          {level === 1 && <span className="text-amber-200 text-xs sm:text-sm font-bold"> / {TARGET_CORRECT}</span>}
        </span>
      </div>

      {/* HUD 하단: 진행 게이지 */}
      {level === 1 && (
        <div className="absolute bottom-[3%] left-[4%] right-[4%] z-10">
          <div className="px-2 py-0.5 mb-1 rounded bg-black/50 backdrop-blur text-white text-[10px] flex justify-between tabular-nums">
            <span>R{round}</span>
            <span>Lv{level} · {Math.round((correctCount / TARGET_CORRECT) * 100)}%</span>
          </div>
          <div className="h-2.5 bg-black/50 rounded-full overflow-hidden border border-amber-950/60">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${(correctCount / TARGET_CORRECT) * 100}%`,
                background: "linear-gradient(90deg, #f59e0b, #fde047, #f59e0b)",
                boxShadow: "0 0 10px #fbbf24aa",
              }}
            />
          </div>
        </div>
      )}
      {level === 2 && (
        <div className="absolute bottom-[4%] left-[4%] right-[4%] z-10 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-600 text-white font-bold text-xs shadow-lg border-2 border-amber-800">
            🌟 LV 2 · 단답형 · 정답 {correctCount}
          </span>
        </div>
      )}
    </div>
  );
}
