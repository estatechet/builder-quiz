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

type Particle = { id: number; left: number; lx: number; lr: number; emoji: string; kind: "fall" | "up" };

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
          left: 35 + Math.random() * 30,
          lx: (Math.random() - 0.5) * 80,
          lr: 0,
          emoji: i % 2 === 0 ? "✨" : "🌟",
          kind: "up",
        });
      }
    } else if (lastAction === "wobble") {
      for (let i = 0; i < 7; i++) {
        newParts.push({
          id: Date.now() + i,
          left: 30 + Math.random() * 40,
          lx: (Math.random() - 0.5) * 100,
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

  const remainingHearts = MAX_STRIKES - strikes;

  // 전체 씬 효과
  const sceneClass =
    lastAction === "fall" ? "scene-fall" :
    lastAction === "wobble" && actionKey > 0 ? "scene-wobble" :
    lastAction === "climb" && actionKey > 0 ? "scene-climb" :
    "";

  const moodEmote =
    mood === "shocked" ? "😱" :
    mood === "sad" ? "😢" :
    null;

  return (
    <div className="relative w-full aspect-square max-h-[62vh] mx-auto rounded-3xl overflow-hidden border-4 border-amber-900/50 shadow-2xl">
      {/* 배경 이미지 — 정적 일러스트 */}
      <div
        className={`absolute inset-0 ${sceneClass}`}
        key={`scene-${lastAction}-${actionKey}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/scene.png"
          alt="다람쥐 숲"
          className="w-full h-full object-cover select-none"
          draggable={false}
        />
        {/* 오답 시 어둠 깔리기 */}
        {(lastAction === "wobble" || lastAction === "fall") && actionKey > 0 && (
          <div
            key={`flash-${actionKey}`}
            className="absolute inset-0 bg-red-900/25 pointer-events-none"
            style={{ animation: "scene-flash 0.6s ease-out" }}
          />
        )}
      </div>

      {/* 파티클 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <span
            key={p.id}
            className={`absolute text-xl drop-shadow ${p.kind === "fall" ? "particle-fall" : "sparkle-up"}`}
            style={{
              top: p.kind === "fall" ? "30%" : "55%",
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

      {/* HUD 좌상단 — 일러스트의 다람쥐 프레임 위에 실제 상태 오버레이 */}
      <div className="absolute top-[3.5%] left-[3.5%] flex items-center gap-1.5 z-10">
        <div
          className="w-[14%] aspect-square min-w-[44px] rounded-xl border-[3px] border-amber-950 shadow-lg grid place-items-center text-3xl bg-gradient-to-br from-amber-200 to-amber-700"
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

      {/* HUD 우상단 — 도토리 카운터 */}
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

      {/* mood emote — 다람쥐 옆에 둥둥 (이미지의 다람쥐 위치 근처) */}
      {moodEmote && (
        <div
          className="absolute z-10 pointer-events-none drop-shadow-lg"
          style={{
            top: "30%",
            left: "45%",
            animation: "mood-bob 0.9s ease-in-out infinite",
            fontSize: "2.5rem",
          }}
        >
          {moodEmote}
        </div>
      )}

      {/* HUD 하단 — 진행 게이지 */}
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
