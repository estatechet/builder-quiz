import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <main>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-sm text-muted mt-1">
          대한민국 도급순위 100위권 시공사 브랜드를 효율적으로 외우는 학습 트레이너.
        </p>
      </div>
      <Dashboard />
    </main>
  );
}
