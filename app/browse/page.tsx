import BrandTable from "@/components/BrandTable";

export default function BrowsePage() {
  return (
    <main>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">전체 브랜드 보기</h1>
        <p className="text-sm text-muted mt-1">검색/티어 필터로 탐색. 학습 전 훑어보기에 유용.</p>
      </div>
      <BrandTable />
    </main>
  );
}
