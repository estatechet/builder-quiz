import { Suspense } from "react";
import Quiz from "@/components/Quiz";

export default function QuizPage() {
  return (
    <main>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">퀴즈</h1>
        <p className="text-sm text-muted mt-1">정답·오답 기록은 자동 저장되며 약점 가중치에 반영됩니다.</p>
      </div>
      <Suspense>
        <Quiz />
      </Suspense>
    </main>
  );
}
