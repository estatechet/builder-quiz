"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  applyAnswer,
  checkTextAnswer,
  clearGame,
  GameState,
  initialGame,
  loadBest,
  loadGame,
  MAX_LIVES,
  nextQuestion,
  Question,
  saveBest,
  saveGame,
  START_LIVES,
} from "@/lib/game";
import { randomTaunt, Taunt } from "@/data/taunts";
import { recordAnswer } from "@/lib/storage";
import BrandLogo from "@/components/BrandLogo";
import TreeScene from "@/components/TreeScene";

const FALL_DURATION_MS = 1300;

export default function Quiz() {
  const [game, setGame] = useState<GameState>(initialGame());
  const [best, setBest] = useState(loadBest());
  const [q, setQ] = useState<Question | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [taunt, setTaunt] = useState<Taunt | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [wobble, setWobble] = useState(0);
  const [falling, setFalling] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 초기 로드
  useEffect(() => {
    const g = loadGame();
    setGame(g);
    setBest(loadBest());
    if (g.gameOver) {
      setShowGameOver(true);
      setFalling(true);
    } else {
      const n = nextQuestion(g, g.level === 2 ? "builder-to-brand" : undefined);
      const updated: GameState = { ...g, seenIds: n.nextSeen, round: n.nextRound };
      setGame(updated);
      saveGame(updated);
      setQ(n.question);
    }
  }, []);

  useEffect(() => {
    if (q && game.level === 2 && !answered) inputRef.current?.focus();
  }, [q, game.level, answered]);

  const advance = (state: GameState) => {
    const n = nextQuestion(state, state.level === 2 ? "builder-to-brand" : undefined);
    const updated: GameState = { ...state, seenIds: n.nextSeen, round: n.nextRound };
    setGame(updated);
    saveGame(updated);
    setQ(n.question);
    setPicked(null);
    setText("");
    setAnswered(false);
    setLastCorrect(null);
    setTaunt(null);
  };

  const handleResult = (correct: boolean) => {
    if (!q) return;
    setAnswered(true);
    setLastCorrect(correct);
    if (!correct) setTaunt(randomTaunt());

    recordAnswer(q.mode, q.entry.id, correct);

    const { game: next, best: nextBest, justLeveledUp } = applyAnswer(game, best, correct);
    setGame(next);
    setBest(nextBest);
    saveGame(next);
    saveBest(nextBest);

    if (!correct) {
      if (next.gameOver) {
        // 낙하 애니메이션 → 1.3s 뒤 게임오버 화면
        setFalling(true);
        setTimeout(() => setShowGameOver(true), FALL_DURATION_MS);
      } else {
        // 휘청 모션
        setWobble((c) => c + 1);
      }
    }

    if (justLeveledUp) {
      setTimeout(() => setShowLevelUp(true), 900);
    }
  };

  const onChoice = (opt: string) => {
    if (answered || !q) return;
    setPicked(opt);
    handleResult(opt === q.correct);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (answered || !q || !text.trim()) return;
    handleResult(checkTextAnswer(text, q.entry));
  };

  const restart = () => {
    const fresh = initialGame();
    clearGame();
    saveGame(fresh);
    setGame(fresh);
    setTaunt(null);
    setShowLevelUp(false);
    setShowGameOver(false);
    setFalling(false);
    setWobble(0);
    const n = nextQuestion(fresh);
    const updated: GameState = { ...fresh, seenIds: n.nextSeen, round: n.nextRound };
    setGame(updated);
    saveGame(updated);
    setQ(n.question);
    setPicked(null);
    setText("");
    setAnswered(false);
    setLastCorrect(null);
  };

  // ─── 게임오버 화면 ───
  if (showGameOver) {
    return (
      <div className="grid gap-4 text-center">
        <TreeScene lives={0} level={game.level} round={game.round} wobbleKey={0} falling />
        <div className="card !p-6 grid gap-3 reveal-pop">
          <div>
            <div className="text-3xl font-black tracking-wider text-bad">GAME OVER</div>
            <div className="text-xs text-muted mt-1">다람쥐가 나무에서 떨어졌습니다 🥲</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Mini label="이번 게임" value={`${game.totalAnswered}`} />
            <Mini label="정답률" value={`${game.totalAnswered ? Math.round((game.totalCorrect / game.totalAnswered) * 100) : 0}%`} />
            <Mini label="도달" value={`Lv${game.reachedLv2 ? 2 : 1}`} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Mini label="최고 ❤️" value={`${best.highestLives}`} muted />
            <Mini label="최장 기록" value={`${best.longestRun}`} muted />
            <Mini label="Lv2 달성" value={best.reachedLv2 ? "✓" : "—"} muted />
          </div>
          <button onClick={restart} className="btn btn-primary !py-3 mt-1">다시 시작</button>
        </div>
        <div className="text-[11px] text-muted">초기 ❤️ {START_LIVES} · 최대 {MAX_LIVES}</div>
      </div>
    );
  }

  // ─── 레벨업 화면 ───
  if (showLevelUp) {
    return (
      <div className="grid gap-4 text-center">
        <TreeScene lives={game.lives} level={game.level} round={game.round} wobbleKey={0} falling={false} />
        <div className="card !p-6 grid gap-3 reveal-pop">
          <div className="text-5xl taunt-face">🎉</div>
          <div>
            <div className="text-xs text-muted">LEVEL UP</div>
            <div className="text-2xl font-black text-accent">Lv 2 · 단답형 모드</div>
          </div>
          <div className="text-sm text-muted leading-relaxed">
            시공사를 보고 <strong className="text-text">대표 브랜드명을 직접 입력</strong>합니다.<br />
            목숨 규칙 동일 (정답 +1 / 오답 −1).
          </div>
          <button
            onClick={() => { setShowLevelUp(false); advance(game); }}
            className="btn btn-primary !py-3"
          >
            시작
          </button>
        </div>
      </div>
    );
  }

  if (!q) return <div className="text-center text-muted text-sm py-10">로딩 중…</div>;

  return (
    <div className="grid gap-4">
      <TreeScene
        lives={game.lives}
        level={game.level}
        round={game.round}
        wobbleKey={wobble}
        falling={falling}
      />

      {/* 질문 카드 */}
      <div className="card !p-5 text-center">
        <div className="text-[11px] text-muted mb-2">{q.questionLabel}</div>
        <div className="text-2xl sm:text-3xl font-bold break-keep">{q.question}</div>
      </div>

      {/* Lv1: 4지선다 */}
      {game.level === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {q.options.map((opt) => {
            const isC = answered && opt === q.correct;
            const isW = picked === opt && opt !== q.correct;
            return (
              <button
                key={opt}
                onClick={() => onChoice(opt)}
                disabled={answered}
                className={[
                  "px-4 py-3 rounded-xl border text-left text-base transition-all",
                  answered ? "cursor-default" : "hover:bg-panel2 active:scale-[0.98]",
                  isC ? "border-good bg-good/10 text-good font-medium" :
                  isW ? "border-bad bg-bad/10 text-bad" :
                  "border-border bg-panel",
                ].join(" ")}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Lv2: 단답형 */}
      {game.level === 2 && (
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={answered}
            placeholder="브랜드명 입력 (예: 래미안)"
            className={[
              "flex-1 px-4 py-3 rounded-xl bg-panel border outline-none text-base",
              answered
                ? lastCorrect
                  ? "border-good text-good"
                  : "border-bad text-bad"
                : "border-border focus:border-accent",
            ].join(" ")}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {!answered && <button type="submit" className="btn btn-primary !px-5">확인</button>}
        </form>
      )}

      {/* 야유 (오답 + 게임 미종료 시) */}
      {taunt && !falling && (
        <div
          key={taunt.line}
          className="border border-bad/50 bg-bad/10 rounded-xl p-3 flex items-center gap-3 taunt-bubble"
        >
          <div className="text-4xl shrink-0 taunt-face">{taunt.face}</div>
          <div className="text-bad font-bold text-base break-keep">{taunt.line}</div>
        </div>
      )}

      {/* 정답 공개 */}
      {answered && !falling && (
        <div className="card reveal-pop !p-4 grid gap-3">
          <div className="flex justify-center">
            <BrandLogo brand={q.entry.brands[0]} size="lg" />
          </div>
          <div className="text-center">
            <div className={`text-xs ${lastCorrect ? "text-good" : "text-muted"}`}>
              {lastCorrect ? "정답!" : "정답은"}
            </div>
            <div className="text-base font-semibold mt-0.5">
              {q.entry.builder} · {q.entry.brands.join(", ")}
            </div>
            {q.entry.premium && (
              <div className="text-xs text-accent mt-0.5">프리미엄: {q.entry.premium.join(", ")}</div>
            )}
            {q.entry.note && <div className="text-[11px] text-muted mt-1">{q.entry.note}</div>}
          </div>
          <button className="btn btn-primary !py-3" onClick={() => advance(game)}>다음 →</button>
        </div>
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
