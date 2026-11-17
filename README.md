# 시공사 브랜드 퀴즈 · Builder Quiz

대한민국 도급순위 100위권 시공사의 아파트 브랜드를 효율적으로 외우는 학습 대시보드.

## 기능

- **대시보드**: 누적 정답률, 커버리지, 약점 항목 Top 8, 티어별 진행률
- **퀴즈**: 객관식 4지선다
  - 시공사 → 브랜드
  - 브랜드 → 시공사
  - 혼합 모드
  - 약점 가중치 (자주 틀린 항목 우선 출제)
- **전체 보기**: 시공사·브랜드·프리미엄 브랜드 검색/티어 필터
- 학습 기록은 브라우저 `localStorage`에 자동 저장

## 데이터

- 시공사 + 메인 브랜드 + 프리미엄 브랜드 + 티어를 `data/brands.ts`에 정의
- 정확한 도급순위는 **매년 7월 국토부 시공능력평가** 공시 기준
- 본 데이터는 학습 보조용. 임의 수정·추가 자유
- 티어 구분 (대략):
  - **S**: Top 10
  - **A**: 11~25위권
  - **B**: 26~40위권
  - **C**: 41위~

## 실행

```bash
npm install
npm run dev   # http://localhost:3000
npm run build
```

## 스택

Next.js 14 (App Router) · TypeScript · Tailwind CSS · localStorage

## 라이선스

MIT

---

## 연말 만찬 초대장 (`/party`)

친구들에게 링크(`/party`)를 보내 이름 · 가능/불가 날짜(드래그) · 희망 회비 · 원하는 방식을 받는 설문 페이지.

- 페이지: `public/party/index.html` (정적, `/party`로 rewrite)
- API: `app/api/party/rsvp` (본인 응답 저장/수정), `app/api/party/admin` (관리자 현황/가져오기)
- 저장소: Upstash Redis (REST)
- 응답 현황: `/party#admin` → 관리자 비밀번호 입력 시에만 열림

### Vercel 설정
1. 프로젝트 → **Storage** → **Upstash (Redis)** 생성 후 이 프로젝트에 Connect → `KV_REST_API_URL`, `KV_REST_API_TOKEN` 자동 추가
2. **Settings → Environment Variables** 에 `PARTY_ADMIN_PASSWORD` 추가
3. Redeploy
