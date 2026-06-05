export type Taunt = { face: string; line: string };

/**
 * 틀렸을 때 출력되는 야유 멘트.
 * 학습 자극용 코미디 — 본인 학습용으로만 사용.
 */
export const TAUNTS: Taunt[] = [
  { face: "😤", line: "야 이 바보야!! 이것도 몰라??" },
  { face: "🤬", line: "멍청아... 다시 외워 와" },
  { face: "🙄", line: "에휴... 한심하다 한심해" },
  { face: "😡", line: "이걸 틀려? 분양대행사 맞아?" },
  { face: "😒", line: "초딩도 알겠다 진짜" },
  { face: "💢", line: "지금 장난쳐?? 정신차려!!" },
  { face: "🤡", line: "이 정도면 월급 반납해야지" },
  { face: "😠", line: "고객 앞에서도 이럴 거야?" },
  { face: "🥴", line: "공부 안 했지? 티 다 나" },
  { face: "😤", line: "다시!! 다시 봐 이 멍청아!!" },
  { face: "🤦", line: "내가 다 부끄럽다 진짜" },
  { face: "💀", line: "이걸 모르고 분양 현장 가게?" },
  { face: "🙃", line: "어이없네 ㅋㅋ 이걸 틀려?" },
  { face: "😩", line: "아오 답답해!! 진짜!!" },
  { face: "👎", line: "이 정도면 그만둬야 한다" },
  { face: "😾", line: "퇴근하지 마. 외울 때까지." },
  { face: "🫠", line: "...할 말을 잃었다" },
  { face: "😤", line: "야 너 어디까지 모르는 거야" },
  { face: "🤨", line: "분양 책자나 한 번 더 봐라" },
  { face: "😡", line: "이걸 모르면서 명함 파?" },
];

export function randomTaunt(): Taunt {
  return TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
}
