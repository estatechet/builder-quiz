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

// 일러스트의 도토리 3개 위치 (이미지 기준 %)
const ACORN_POSITIONS = [
  { top: "23%", right: "8%" },
  { top: "42%", right: "8%" },
  { top: "60%", right: "8%" },
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

  const squirrelFilter =
    mood === "sad" ? "saturate(0.55) brightness(0.85)" :
    mood === "shocked" ? "saturate(0.7)" :
    "none";

  return (
    <div
      className="relative w-full aspect-square mx-auto rounded-3xl overflow-hidden border-2 border-amber-900/40 shadow-2xl"
      style={{
        // 헤더(약 64px) + 문제카드(약 320px) + 푸터/여백 합쳐서 확보, 한 화면에 들어오게 제한
        maxHeight: "min(calc(100svh - 380px), 80vw)",
        maxWidth: "calc(100svh - 380px)",
      }}
    >
      {/* 배경 (다람쥐 제거된 씬) */}
      <div className={`absolute inset-0 ${treeShake ? "tree-shake" : ""}`} key={`bg-${treeShake ? actionKey : 0}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/scene-bg.png"
          alt="숲 배경"
          className="w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
        />
        {/* 좌상단 HUD 잔흔 가리기 (다람쥐 액자 + 하트) */}
        <div
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: "62%",
            height: "22%",
            background: "linear-gradient(135deg, rgba(20,55,90,0.55) 0%, rgba(20,55,90,0.35) 45%, transparent 80%)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            maskImage: "linear-gradient(135deg, black 0%, black 50%, transparent 90%)",
            WebkitMaskImage: "linear-gradient(135deg, black 0%, black 50%, transparent 90%)",
          }}
        />
        {/* 우상단 HUD 잔흔 가리기 (도토리 x25 텍스트) */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: "44%",
            height: "19%",
            background: "linear-gradient(225deg, rgba(90,55,30,0.55) 0%, rgba(90,55,30,0.35) 45%, transparent 80%)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            maskImage: "linear-gradient(225deg, black 0%, black 55%, transparent 90%)",
            WebkitMaskImage: "linear-gradient(225deg, black 0%, black 55%, transparent 90%)",
          }}
        />
      </div>

      {/* 우상단: 동적 도토리 카운터 (정답마다 +1, 30 도달 시 황금) */}
      <div
        key={`acorn-counter-${correctCount}`}
        className={`absolute z-20 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border-[3px] shadow-lg flex items-center gap-1.5 ${
          correctCount > 0 ? "acorn-pulse" : ""
        }`}
        style={{
          top: "3%",
          right: "3%",
          background: correctCount >= TARGET_CORRECT
            ? "linear-gradient(135deg, #fde047, #f59e0b)"
            : "linear-gradient(135deg, #d4a574, #8b5a2b)",
          borderColor: correctCount >= TARGET_CORRECT ? "#92400e" : "#451a03",
          boxShadow: correctCount >= TARGET_CORRECT
            ? "0 0 18px #fbbf24, 0 4px 10px rgba(0,0,0,0.4)"
            : "0 4px 10px rgba(0,0,0,0.4)",
        }}
      >
        <span className="text-xl sm:text-2xl drop-shadow">🌰</span>
        <span className="text-white font-black text-sm sm:text-base tabular-nums drop-shadow">
          {correctCount}
          <span className="text-amber-200 text-xs sm:text-sm"> / {TARGET_CORRECT}</span>
        </span>
      </div>

      {/* 우측 도토리 3개 = 목숨. strikes 만큼 가려짐 (위에서부터) */}
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
              width: "14%",
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

      {/* 다람쥐 스프라이트 */}
      <div
        key={`sq-${lastAction}-${actionKey}`}
        className={`absolute pointer-events-none z-[8] ${animClass}`}
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

      {/* HUD 하단: 얇은 진행 게이지 (Lv/Round 작게) */}
      {level === 1 && (
        <div className="absolute bottom-[3%] left-[4%] right-[4%] z-10">
          <div className="flex justify-end mb-1">
            <span className="px-1.5 py-0.5 rounded bg-black/55 backdrop-blur text-white/80 text-[9px] tabular-nums">
              Lv{level} · R{round}
            </span>
          </div>
          <div className="h-2 bg-black/55 rounded-full overflow-hidden border border-amber-950/60">
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
