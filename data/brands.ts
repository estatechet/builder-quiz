export type Tier = "S" | "A" | "B" | "C";

export type BuilderEntry = {
  id: number;
  builder: string;        // 시공사명
  brands: string[];       // 일반 분양 브랜드
  premium?: string[];     // 프리미엄 브랜드 (있는 경우)
  tier: Tier;             // S=Top10, A=11~25, B=26~40, C=41~
  note?: string;
};

/**
 * 주요 시공사 브랜드 데이터 (도급순위 100위권 중심).
 * - 정확한 도급순위는 매년 7월 국토부 시공능력평가 공시 기준.
 * - 본 리스트는 학습 보조용이며 임의 수정/추가 가능 (data/brands.ts).
 * - Tier 는 대략적 묶음 (S: Top10, A: 11~25, B: 26~40, C: 41~).
 */
export const BUILDERS: BuilderEntry[] = [
  // S-tier — Top 10
  { id: 1,  builder: "삼성물산 건설부문", brands: ["래미안"], tier: "S" },
  { id: 2,  builder: "현대건설", brands: ["힐스테이트"], premium: ["디에이치"], tier: "S" },
  { id: 3,  builder: "대우건설", brands: ["푸르지오"], premium: ["푸르지오 써밋"], tier: "S" },
  { id: 4,  builder: "현대엔지니어링", brands: ["힐스테이트"], premium: ["디에이치"], tier: "S", note: "현대건설과 브랜드 공유" },
  { id: 5,  builder: "GS건설", brands: ["자이"], tier: "S" },
  { id: 6,  builder: "DL이앤씨", brands: ["e편한세상"], premium: ["아크로"], tier: "S" },
  { id: 7,  builder: "포스코이앤씨", brands: ["더샵"], premium: ["오티에르"], tier: "S" },
  { id: 8,  builder: "롯데건설", brands: ["롯데캐슬"], premium: ["르엘"], tier: "S" },
  { id: 9,  builder: "SK에코플랜트", brands: ["SK뷰"], tier: "S" },
  { id: 10, builder: "HDC현대산업개발", brands: ["아이파크"], tier: "S" },

  // A-tier — 11~25
  { id: 11, builder: "호반건설", brands: ["호반써밋", "호반베르디움"], tier: "A" },
  { id: 12, builder: "중흥토건", brands: ["중흥S-클래스"], tier: "A" },
  { id: 13, builder: "한화 건설부문", brands: ["포레나"], tier: "A" },
  { id: 14, builder: "태영건설", brands: ["데시앙"], tier: "A" },
  { id: 15, builder: "계룡건설산업", brands: ["리슈빌"], tier: "A" },
  { id: 16, builder: "코오롱글로벌", brands: ["하늘채"], tier: "A" },
  { id: 17, builder: "금호건설", brands: ["어울림", "리첸시아"], tier: "A" },
  { id: 18, builder: "두산건설", brands: ["두산위브"], tier: "A" },
  { id: 19, builder: "동부건설", brands: ["센트레빌"], tier: "A" },
  { id: 20, builder: "서희건설", brands: ["스타힐스"], tier: "A" },
  { id: 21, builder: "한신공영", brands: ["한신더휴"], tier: "A" },
  { id: 22, builder: "우미건설", brands: ["린(LYNN)"], tier: "A" },
  { id: 23, builder: "신동아건설", brands: ["파밀리에"], tier: "A" },
  { id: 24, builder: "반도건설", brands: ["유보라"], tier: "A" },
  { id: 25, builder: "효성중공업 건설부문", brands: ["해링턴플레이스"], tier: "A" },

  // B-tier — 26~40
  { id: 26, builder: "대방건설", brands: ["디에트르", "대방노블랜드"], tier: "B" },
  { id: 27, builder: "동원개발", brands: ["비스타동원"], tier: "B" },
  { id: 28, builder: "신세계건설", brands: ["빌리브"], tier: "B" },
  { id: 29, builder: "쌍용건설", brands: ["더플래티넘"], tier: "B" },
  { id: 30, builder: "일성건설", brands: ["트루엘"], tier: "B" },
  { id: 31, builder: "KCC건설", brands: ["스위첸"], tier: "B" },
  { id: 32, builder: "동양건설산업", brands: ["파라곤"], tier: "B" },
  { id: 33, builder: "한양", brands: ["한양수자인"], tier: "B" },
  { id: 34, builder: "극동건설", brands: ["극동스타클래스"], tier: "B" },
  { id: 35, builder: "금성백조주택", brands: ["예미지"], tier: "B" },
  { id: 36, builder: "우방건설산업", brands: ["우방아이유쉘"], tier: "B" },
  { id: 37, builder: "제일건설", brands: ["제일풍경채"], tier: "B" },
  { id: 38, builder: "HJ중공업 건설부문", brands: ["해모로"], tier: "B", note: "구 한진중공업" },
  { id: 39, builder: "한라", brands: ["한라비발디"], tier: "B" },
  { id: 40, builder: "신영", brands: ["지웰"], tier: "B" },

  // C-tier — 41~
  { id: 41, builder: "협성건설", brands: ["휴포레"], tier: "C" },
  { id: 42, builder: "부영주택", brands: ["사랑으로"], tier: "C" },
  { id: 43, builder: "이수건설", brands: ["브라운스톤"], tier: "C" },
  { id: 44, builder: "남양건설", brands: ["휴튼"], tier: "C" },
  { id: 45, builder: "화성산업", brands: ["파크드림"], tier: "C" },
  { id: 46, builder: "동문건설", brands: ["동문굿모닝힐"], tier: "C" },
  { id: 47, builder: "모아종합건설", brands: ["모아엘가"], tier: "C" },
  { id: 48, builder: "양우건설", brands: ["양우내안애"], tier: "C" },
  { id: 49, builder: "라온건설", brands: ["라온프라이빗"], tier: "C" },
  { id: 50, builder: "동일토건", brands: ["동일하이빌"], tier: "C" },
  { id: 51, builder: "삼정기업", brands: ["삼정그린코아"], tier: "C" },
  { id: 52, builder: "영무토건", brands: ["영무예다음"], tier: "C" },
  { id: 53, builder: "시티건설", brands: ["시티프라디움"], tier: "C" },
  { id: 54, builder: "대명종합건설", brands: ["대명루첸"], tier: "C" },
  { id: 55, builder: "라인건설", brands: ["이지더원"], tier: "C" },
];

export const TIER_LABEL: Record<Tier, string> = {
  S: "Top 10",
  A: "11~25위권",
  B: "26~40위권",
  C: "41위~",
};

export const ALL_BRANDS: string[] = Array.from(
  new Set(BUILDERS.flatMap((b) => [...b.brands, ...(b.premium ?? [])]))
).sort();

export const ALL_BUILDERS: string[] = BUILDERS.map((b) => b.builder);
