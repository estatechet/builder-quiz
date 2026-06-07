"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  applyAnswer,
  checkTextAnswer,
  clearGame,
  GameState,
  initialGame,
  loadBest,
  loadGame,
  MAX_STRIKES,
  Mood,
  nextQuestion,
  Question,
  saveBest,
  saveGame,
  TARGET_CORRECT,
  LV2_TARGET,
} from "@/lib/game";
import { randomTaunt, Taunt } from "@/data/taunts";
import { recordAnswer } from "@/lib/storage";
import BrandLogo from "@/components/BrandLogo";
import TreeScene from "@/components/TreeScene";

type Phase = "asking" | "revealing" | "transitioning";
type Action = "none" | "climb" | "wobble" | "fall";

const REVEAL_MS = 1400;       // 정답 공개 시간
const TRANSITION_MS = 650;    // 팝업 닫힘 → 다음 팝업 사이
const FALL_MS = 1300;         // 낙하 애니메이션 시간

export default function Quiz() {
  const [game, setGame] = useState<GameState>(initialGame());
  const [best, setBest] = useState(loadBest());
  const [q, setQ] = useState<Question | null>(null);
  const [phase, setPhase] = useState<Phase>("asking");
  const [picked, setPicked] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [taunt, setTaunt] = useState<Taunt | null>(null);
  const [lastAction, setLastAction] = useState<Action>("none");
  const [actionKey, setActionKey] = useState(0);
  const [mood, setMood] = useState<Mood>("happy");
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 첫 로드
  useEffect(() => {
    const g = loadGame();
    setGame(g);
    setBest(loadBest());
    if (g.gameOver) {
      setLastAction("fall");
      setShowGameOver(true);
    } else {
      const n = nextQuestion(g, g.level === 2 ? "builder-to-brand" : undefined);
      const updated: GameState = { ...g, seenIds: n.nextSeen, round: n.nextRound };
      setGame(updated);
      saveGame(updated);
      setQ(n.question);
    }
  }, []);

  // Lv2 인풋 포커스
  useEffect(() => {
    if (phase === "asking" && q && game.level === 2) {
      inputRef.current?.focus();
    }
  }, [phase, q, game.level]);

  const loadNext = useCallback((state: GameState) => {
    const n = nextQuestion(state, state.level === 2 ? "builder-to-brand" : undefined);
    const updated: GameState = { ...state, seenIds: n.nextSeen, round: n.nextRound };
    setGame(updated);
    saveGame(updated);
    setQ(n.question);
    setPicked(null);
    setText("");
    setTaunt(null);
    setLastCorrect(null);
    setLastAction("none");
    setPhase("asking");
  }, []);

  // 정답 공개 → 다음 문제로
  const advanceFromReveal = useCallback((next: GameState, justLeveledUp: boolean, justCompleted: boolean) => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (next.gameOver) {
      setPhase("transitioning");
      setTimeout(() => setShowGameOver(true), FALL_MS);
      return;
    }
    if (justCompleted) {
      setPhase("transitioning");
      setTimeout(() => setShowGameComplete(true), 400);
      return;
    }
    if (justLeveledUp) {
      setPhase("transitioning");
      setTimeout(() => setShowLevelUp(true), 400);
      return;
    }
    setPhase("transitioning");
    setTimeout(() => loadNext(next), TRANSITION_MS);
  }, [loadNext]);

  const handleResult = useCallback((correct: boolean) => {
    if (!q || phase !== "asking") return;
    setLastCorrect(correct);
    if (!correct) setTaunt(randomTaunt());

    recordAnswer(q.mode, q.entry.id, correct);

    const { game: next, best: nextBest, justLeveledUp, justCompleted } = applyAnswer(game, best, correct);
    setGame(next);
    setBest(nextBest);
    saveGame(next);
    saveBest(nextBest);

    // 다람쥐 모션 + 표정
    if (correct) {
      setLastAction("climb");
      setMood("happy");
    } else if (next.gameOver) {
      setLastAction("fall");
      setMood("shocked");
    } else {
      setLastAction("wobble");
      setMood("sad");
    }
    setActionKey((k) => k + 1);

    setPhase("revealing");

    // 자동 진행 타이머
    advanceTimerRef.current = setTimeout(() => {
      advanceFromReveal(next, justLeveledUp, justCompleted);
    }, REVEAL_MS);
  }, [q, phase, game, best, advanceFromReveal]);

  const onChoice = (opt: string) => {
    if (phase !== "asking") return;
    setPicked(opt);
    handleResult(opt === q!.correct);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (phase !== "asking" || !text.trim() || !q) return;
    handleResult(checkTextAnswer(text, q.entry));
  };

  // "다음" 즉시 진행
  const skipReveal = () => {
    if (phase !== "revealing") return;
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    advanceFromReveal(game, false, false);
  };

  const restart = () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    const fresh = initialGame();
    clearGame();
    saveGame(fresh);
    setBest(loadBest());
    setShowGameOver(false);
    setShowLevelUp(false);
    setShowGameComplete(false);
    setLastAction("none");
    setActionKey(0);
    setMood("happy");
    setTaunt(null);
    loadNext(fresh);
  };

  // ─── 게임오버 화면 (다람쥐 자국 없는 다크 배경) ───
  if (showGameOver) {
    return (
      <div className="grid gap-4 text-center">
        <div
          className="relative w-full aspect-square mx-auto rounded-3xl overflow-hidden border-2 border-amber-900/40 shadow-2xl flex items-center justify-center"
          style={{
            maxHeight: "min(calc(100svh - 420px), 72vw)",
            maxWidth: "calc(100svh - 420px)",
            background: "radial-gradient(circle at 50% 40%, #2a1a14 0%, #0a0507 90%)",
          }}
        >
          <div className="text-center">
            <div className="text-7xl sm:text-8xl mb-2" style={{ animation: "taunt-bounce 1.4s ease-in-out infinite" }}>💀</div>
            <div className="text-3xl sm:text-4xl font-black tracking-wider text-bad drop-shadow-lg">GAME OVER</div>
            <div className="text-xs text-muted mt-2">다람쥐가 떨어졌습니다 🥲</div>
          </div>
        </div>
        <div className="card !p-3 grid gap-2 reveal-pop">
          <div className="grid grid-cols-3 gap-2">
            <Mini label="정답" value={`${game.totalCorrect}`} />
            <Mini label="총 답변" value={`${game.totalAnswered}`} />
            <Mini label="도달" value={`Lv${game.reachedLv2 ? 2 : 1}`} />
          </div>
          <button onClick={restart} className="btn btn-primary !py-3">다시 시작</button>
        </div>
      </div>
    );
  }

  // ─── 엔딩 화면: Lv2 클리어 (다람쥐 자국 없는 황금 배경) ───
  if (showGameComplete) {
    return (
      <div className="grid gap-4 text-center">
        <div
          className="relative w-full aspect-square mx-auto rounded-3xl overflow-hidden border-2 border-amber-500/60 shadow-2xl flex items-center justify-center"
          style={{
            maxHeight: "min(calc(100svh - 420px), 72vw)",
            maxWidth: "calc(100svh - 420px)",
            background: "radial-gradient(circle at 50% 40%, #fbbf24 0%, #b45309 50%, #451a03 100%)",
            boxShadow: "0 0 40px #fbbf24aa",
          }}
        >
          <div className="text-center px-4">
            <div className="text-7xl sm:text-8xl mb-3" style={{ animation: "taunt-bounce 1.2s ease-in-out infinite" }}>🏆</div>
            <div className="text-3xl sm:text-4xl font-black tracking-wider text-white drop-shadow-lg">CLEAR!</div>
            <div className="text-sm sm:text-base text-amber-100 font-bold mt-2">분양대행 마스터 🐿️</div>
            <div className="text-[11px] sm:text-xs text-amber-200 mt-1">Lv2 단답형 {LV2_TARGET}문제 완주</div>
          </div>
        </div>
        <div className="card !p-3 grid gap-2 reveal-pop">
          <div className="grid grid-cols-3 gap-2">
            <Mini label="정답" value={`${game.totalCorrect}`} />
            <Mini label="총 답변" value={`${game.totalAnswered}`} />
            <Mini label="정답률" value={`${Math.round((game.totalCorrect / Math.max(1, game.totalAnswered)) * 100)}%`} />
          </div>
          <button onClick={restart} className="btn btn-primary !py-3">다시 도전</button>
        </div>
      </div>
    );
  }

  // ─── 레벨업 화면 ───
  if (showLevelUp) {
    return (
      <div className="grid gap-4 text-center">
        <TreeScene
          correctCount={0}
          strikes={0}
          level={2}
          round={1}
          lastAction="none"
          actionKey={0}
          mood="happy"
        />
        <div className="card !p-6 grid gap-3 reveal-pop">
          <div className="text-5xl taunt-face">🎉</div>
          <div>
            <div className="text-xs text-muted">LEVEL UP</div>
            <div className="text-2xl font-black text-accent">Lv 2 · 단답형</div>
          </div>
          <div className="text-sm text-muted leading-relaxed">
            시공사를 보고 <strong className="text-text">대표 브랜드명을 직접 입력</strong>합니다.<br />
            오답 3번이면 게임오버 (목숨 재설정됨).
          </div>
          <button
            onClick={() => { setShowLevelUp(false); loadNext(game); }}
            className="btn btn-primary !py-3"
          >
            시작
          </button>
        </div>
      </div>
    );
  }

  // ─── 메인 게임 화면 ───
  return (
    <div className="grid gap-2 sm:gap-4">
      <TreeScene
        correctCount={game.correctCount}
        strikes={game.strikes}
        level={game.level}
        round={game.round}
        lastAction={lastAction}
        actionKey={actionKey}
        mood={mood}
      />

      {/* 팝업 영역 — 풀이 중에만 보임 */}
      {phase !== "transitioning" && q && (
        <div className="card popup-in !p-2.5 sm:!p-4 grid gap-1.5 sm:gap-3">
          <div className="text-center h-12 sm:h-16 flex flex-col justify-center">
            <div className="text-[10px] sm:text-[11px] text-muted mb-0.5">{q.questionLabel}</div>
            <div className="text-base sm:text-2xl font-bold break-keep leading-tight line-clamp-2">{q.question}</div>
          </div>

          {/* Lv1 — 4지선다: 고정 높이로 텍스트 길이 차이 시 화면 움직임 제거 */}
          {game.level === 1 && (
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {q.options.map((opt) => {
                const isC = phase === "revealing" && opt === q.correct;
                const isW = picked === opt && opt !== q.correct;
                return (
                  <button
                    key={opt}
                    onClick={() => onChoice(opt)}
                    disabled={phase !== "asking"}
                    className={[
                      "px-2 sm:px-3 rounded-xl border text-center text-xs sm:text-sm font-medium transition-all",
                      "h-12 sm:h-14 flex items-center justify-center break-keep leading-tight overflow-hidden",
                      phase !== "asking" ? "cursor-default" : "hover:bg-panel2 active:scale-[0.98]",
                      isC ? "border-good bg-good/10 text-good" :
                      isW ? "border-bad bg-bad/10 text-bad" :
                      "border-border bg-panel",
                    ].join(" ")}
                  >
                    <span className="line-clamp-2">{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Lv2 — 단답형 */}
          {game.level === 2 && (
            <form onSubmit={onSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={phase !== "asking"}
                placeholder="브랜드명 입력 (예: 래미안)"
                className={[
                  "flex-1 px-4 py-3 rounded-xl bg-panel border outline-none text-base",
                  phase === "revealing"
                    ? lastCorrect ? "border-good text-good" : "border-bad text-bad"
                    : "border-border focus:border-accent",
                ].join(" ")}
                autoComplete="off" autoCapitalize="off" spellCheck={false}
              />
              {phase === "asking" && <button type="submit" className="btn btn-primary !px-5">확인</button>}
            </form>
          )}

          {/* 야유 (오답 + 게임 진행 가능) */}
          {phase === "revealing" && lastCorrect === false && taunt && (
            <div className="border border-bad/50 bg-bad/10 rounded-xl p-2.5 flex items-center gap-2 taunt-bubble">
              <div className="text-2xl shrink-0 taunt-face">{taunt.face}</div>
              <div className="text-bad font-bold text-sm break-keep">{taunt.line}</div>
            </div>
          )}

          {/* 리빌 (정/오답 후 브랜드 정보) */}
          {phase === "revealing" && (
            <div className="flex items-center gap-3 pt-1 border-t border-border">
              <BrandLogo brand={q.entry.brands[0]} size="md" />
              <div className="flex-1 min-w-0">
                <div className={`text-[11px] ${lastCorrect ? "text-good" : "text-muted"}`}>
                  {lastCorrect ? "정답!" : "정답은"}
                </div>
                <div className="text-sm font-semibold truncate">
                  {q.entry.builder} · {q.entry.brands.join(", ")}
                </div>
                {q.entry.premium && (
                  <div className="text-[11px] text-accent truncate">프리미엄: {q.entry.premium.join(", ")}</div>
                )}
              </div>
              <button onClick={skipReveal} className="btn btn-primary !px-3 !py-1.5 text-xs">다음 →</button>
            </div>
          )}
        </div>
      )}

      {/* 풀이 사이엔 트리만 보임 — 의도적으로 빈 영역 */}
      {phase === "transitioning" && (
        <div className="h-4" />
      )}
    </div>
  );
}

function Mini({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`card !p-2 ${muted ? "opacity-70" : ""}`}>
      <div className="text-[9px] text-muted uppercase tracking-wider">{label}</div>
      <div className="text-base font-bold tabular-nums">{value}</div>
    </div>
  );
}
