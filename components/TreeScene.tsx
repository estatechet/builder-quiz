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
      for (let i = 0; i < 5; i++) {
        newParts.push({
          id: Date.now() + i,
          left: 45 + Math.random() * 10,
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
          left: 35 + Math.random() * 30,
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

  const yPct = level === 2 ? 12 : Math.max(18, 78 - (correctCount / TARGET_CORRECT) * 60);

  const animClass =
    lastAction === "fall" ? "squirrel-fall" :
    lastAction === "wobble" ? "squirrel-wobble" :
    lastAction === "climb" ? "squirrel-climb" :
    "squirrel-idle";

  const treeShake = (lastAction === "wobble" || lastAction === "fall") && actionKey > 0;

  const moodEmote =
    mood === "shocked" ? "😱" :
    mood === "sad" ? "😢" :
    null;

  const remainingHearts = MAX_STRIKES - strikes;

  return (
    <div
      className="relative w-full h-[58vh] min-h-[420px] rounded-3xl overflow-hidden border-4 border-amber-900/40 shadow-2xl"
      style={{
        background:
          "linear-gradient(180deg, #7BC4E8 0%, #A8DBEB 25%, #C9E8B6 65%, #80B860 100%)",
      }}
    >
      {/* 구름 */}
      <div className="absolute text-4xl sm:text-5xl drop-shadow" style={{ top: "5%", left: "12%" }}>☁️</div>
      <div className="absolute text-3xl sm:text-4xl opacity-80 drop-shadow" style={{ top: "16%", right: "20%" }}>☁️</div>
      <div className="absolute text-2xl opacity-70" style={{ top: "8%", right: "8%" }}>☁️</div>

      {/* 새 */}
      <div className="absolute text-base opacity-70" style={{ top: "22%", left: "30%" }}>🕊️</div>

      {/* 나무 */}
      <svg
        viewBox="0 0 200 400"
        preserveAspectRatio="xMidYMax meet"
        className={`absolute inset-0 w-full h-full ${treeShake ? "tree-shake" : ""}`}
        key={`tree-${actionKey}-${lastAction}`}
      >
        <defs>
          <linearGradient id="bark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3a2410" />
            <stop offset="25%" stopColor="#6a4530" />
            <stop offset="50%" stopColor="#8a5a3a" />
            <stop offset="75%" stopColor="#6a4530" />
            <stop offset="100%" stopColor="#3a2410" />
          </linearGradient>
          <radialGradient id="foliage" cx="0.5" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="#5ab852" />
            <stop offset="100%" stopColor="#2d6e2d" />
          </radialGradient>
        </defs>

        {/* 잎 덩어리 */}
        <ellipse cx="100" cy="68" rx="88" ry="62" fill="url(#foliage)" />
        <ellipse cx="60" cy="110" rx="48" ry="36" fill="#3a8a3a" />
        <ellipse cx="140" cy="110" rx="48" ry="36" fill="#3a8a3a" />
        <ellipse cx="100" cy="138" rx="72" ry="28" fill="#4a9e4a" />
        {/* 잎 하이라이트 */}
        <ellipse cx="80" cy="50" rx="16" ry="11" fill="#7ac872" opacity="0.6" />
        <ellipse cx="130" cy="55" rx="20" ry="13" fill="#7ac872" opacity="0.6" />
        <ellipse cx="105" cy="80" rx="12" ry="8" fill="#9adc92" opacity="0.5" />

        {/* 줄기 */}
        <rect x="84" y="130" width="32" height="270" fill="url(#bark)" rx="5" />
        {/* 줄기 무늬 */}
        <path d="M 90,160 Q 92,200 90,260 Q 92,320 90,385" stroke="#2a1810" strokeWidth="1.5" fill="none" opacity="0.55" />
        <path d="M 102,170 Q 100,220 102,280 Q 100,340 102,390" stroke="#2a1810" strokeWidth="1" fill="none" opacity="0.45" />
        <path d="M 112,150 Q 110,200 112,260 Q 110,320 112,388" stroke="#2a1810" strokeWidth="1.5" fill="none" opacity="0.55" />
        {/* 옹이 */}
        <ellipse cx="100" cy="205" rx="5" ry="7" fill="#2a1810" />
        <ellipse cx="100" cy="205" rx="2" ry="3" fill="#5a3a1a" />
        <ellipse cx="100" cy="295" rx="4" ry="5" fill="#2a1810" />

        {/* 가지 + 잎 */}
        <rect x="115" y="185" width="42" height="6" fill="#5a3a1a" rx="2" />
        <circle cx="160" cy="188" r="8" fill="#4a9e4a" />
        <circle cx="158" cy="184" r="4" fill="#7ac872" />
        <rect x="43" y="245" width="42" height="6" fill="#5a3a1a" rx="2" />
        <circle cx="40" cy="248" r="8" fill="#4a9e4a" />
        <circle cx="42" cy="244" r="4" fill="#7ac872" />

        {/* 땅 */}
        <rect x="0" y="385" width="200" height="20" fill="#5aa05a" />
        <rect x="0" y="385" width="200" height="3" fill="#80c860" />
        {/* 잔디 */}
        <path d="M 18 390 L 20 378 L 22 390 Z" fill="#3a7e3a" />
        <path d="M 58 390 L 60 376 L 62 390 Z" fill="#3a7e3a" />
        <path d="M 138 390 L 140 380 L 142 390 Z" fill="#3a7e3a" />
        <path d="M 175 390 L 177 376 L 179 390 Z" fill="#3a7e3a" />
        {/* 돌 */}
        <ellipse cx="155" cy="392" rx="10" ry="4" fill="#888" />
        <ellipse cx="155" cy="390" rx="10" ry="3" fill="#aaa" />
      </svg>

      {/* 데코: 버섯·풀 */}
      <div className="absolute text-3xl drop-shadow" style={{ bottom: "4%", left: "8%" }}>🍄</div>
      <div className="absolute text-xl drop-shadow" style={{ bottom: "8%", right: "12%" }}>🍄</div>
      <div className="absolute text-base" style={{ bottom: "3%", right: "30%" }}>🌿</div>
      <div className="absolute text-base" style={{ top: "45%", left: "10%" }}>🍃</div>

      {/* 파티클 */}
      {particles.map((p) => (
        <span
          key={p.id}
          className={`text-lg drop-shadow ${p.kind === "fall" ? "particle-fall" : "sparkle-up"}`}
          style={{
            top: p.kind === "fall" ? "30%" : `${yPct}%`,
            left: `${p.left}%`,
            ["--lx" as any]: `${p.lx}px`,
            ["--lr" as any]: `${p.lr}deg`,
            ["--sx" as any]: `${p.lx}px`,
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* 다람쥐 + 표정 */}
      <div
        key={`sq-${lastAction}-${actionKey}`}
        className={`absolute select-none ${animClass}`}
        style={{
          left: "50%",
          top: `${yPct}%`,
          transform: "translate(-50%, -50%)",
          transition:
            lastAction === "fall" || lastAction === "wobble"
              ? "none"
              : "top 0.65s cubic-bezier(.34, 1.5, .64, 1)",
        }}
        aria-label="squirrel"
      >
        <div className="relative">
          <span className="text-5xl sm:text-6xl drop-shadow-lg" style={{ filter: mood === "sad" ? "saturate(0.7) brightness(0.9)" : "none" }}>🐿️</span>
          {moodEmote && (
            <span
              className="absolute -top-4 -right-3 text-2xl sm:text-3xl drop-shadow"
              style={{
                animation: "mood-bob 0.9s ease-in-out infinite",
              }}
            >
              {moodEmote}
            </span>
          )}
        </div>
      </div>

      {/* HUD: 좌상단 (아바타 + 하트) */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-[3px] border-amber-950 shadow-lg grid place-items-center text-3xl"
             style={{ background: "linear-gradient(135deg, #d4a574, #8b5a2b)" }}>
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

      {/* HUD: 우상단 도토리 카운터 */}
      <div
        className="absolute top-3 right-3 px-3 py-1.5 rounded-xl border-[3px] border-amber-950 shadow-lg flex items-center gap-1.5 z-10"
        style={{ background: "linear-gradient(135deg, #d4a574, #8b5a2b)" }}
      >
        <span className="text-2xl drop-shadow">🌰</span>
        <span className="text-white font-black text-lg tabular-nums drop-shadow">
          × {correctCount}
          {level === 1 && <span className="text-amber-200 text-sm font-bold"> / {TARGET_CORRECT}</span>}
        </span>
      </div>

      {/* HUD: 하단 진행/Lv2 라벨 */}
      {level === 1 && (
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="px-2 py-0.5 mb-1 rounded bg-black/40 backdrop-blur text-white text-[10px] flex justify-between tabular-nums">
            <span>R{round}</span>
            <span>Lv{level} · {Math.round((correctCount / TARGET_CORRECT) * 100)}%</span>
          </div>
          <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-amber-950/60">
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
        <div className="absolute bottom-4 left-3 right-3 z-10 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-600 text-white font-bold text-xs shadow-lg border-2 border-amber-800">
            🌟 LV 2 · 단답형 · 정답 {correctCount}
          </span>
        </div>
      )}
    </div>
  );
}
