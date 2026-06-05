"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BUILDERS } from "@/data/brands";
import { loadStore, resetAll } from "@/lib/storage";
import { clearGame, initialGame, loadBest, loadGame, MAX_LIVES } from "@/lib/game";

export default function Dashboard() {
  const [store, setStore] = useState(loadStore());
  const [game, setGame] = useState(initialGame());
  const [best, setBest] = useState(loadBest());

  useEffect(() => {
    setStore(loadStore());
    setGame(loadGame());
    setBest(loadBest());
  }, []);

  const inProgress = !game.gameOver && game.totalAnswered > 0;

  const weak = BUILDERS
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
    .slice(0, 5);

  return (
    <div className="grid gap-5">
      {/* 현재 게임 상태 */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="❤️ 목숨" value={`${game.lives}/${MAX_LIVES}`} />
        <Stat label="레벨" value={`Lv${game.level}`} />
        <Stat label="라운드" value={`R${game.round}`} />
      </div>

      {/* 베스트 */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="최고 ❤️" value={`${best.highestLives}`} muted />
        <Stat label="최장 기록" value={`${best.longestRun}`} muted />
        <Stat label="Lv2 달성" value={best.reachedLv2 ? "✓" : "—"} muted />
      </div>

      {/* CTA */}
      <div className="grid gap-2">
        <Link href="/quiz" className="btn btn-primary !py-4 text-base">
          {inProgress ? "이어서 하기 →" : game.gameOver ? "다시 시작" : "게임 시작"}
        </Link>
        {(inProgress || game.gameOver) && (
          <button
            className="text-[11px] text-muted hover:text-bad self-center"
            onClick={() => {
              if (confirm("진행 중인 게임을 버리고 새로 시작?")) {
                clearGame();
                setGame(initialGame());
              }
            }}
          >
            새 게임으로 초기화
          </button>
        )}
      </div>

      {/* 약점 */}
      {weak.length > 0 && (
        <div>
          <div className="text-xs text-muted mb-2 px-1">자주 틀리는 항목</div>
          <div className="card !p-2 divide-y divide-border">
            {weak.map(({ b, attempts, correct, rate }) => (
              <div key={b.id} className="flex items-center justify-between px-2 py-2 text-sm">
                <div className="truncate min-w-0">
                  <span className="font-medium">{b.builder}</span>
                  <span className="text-muted text-xs"> · {b.brands.join(", ")}</span>
                </div>
                <span className={`text-xs tabular-nums shrink-0 ml-2 ${rate < 0.5 ? "text-bad" : "text-amber-300"}`}>
                  {Math.round(rate * 100)}% <span className="text-muted">({correct}/{attempts})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(store.stats).length > 0 && (
        <button
          className="text-[11px] text-muted hover:text-bad self-center"
          onClick={() => { if (confirm("학습 통계 전체 삭제?")) { resetAll(); setStore(loadStore()); } }}
        >
          학습 통계 초기화
        </button>
      )}
    </div>
  );
}

function Stat({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`card !p-3 ${muted ? "opacity-60" : ""}`}>
      <div className="text-[10px] text-muted uppercase tracking-wide">{label}</div>
      <div className="text-lg font-bold mt-0.5 tabular-nums">{value}</div>
    </div>
  );
}
