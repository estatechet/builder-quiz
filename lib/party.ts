// 연말 만찬 RSVP — 서버 전용 저장소 헬퍼
// 저장소: Upstash Redis (Vercel Marketplace 연동 시 KV_REST_API_* 환경변수가 자동 주입됨)
import { createHash, timingSafeEqual } from "crypto";

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const HASH_KEY = "party2026:rsvps";
export const MAX_RESPONSES = 300;

export const storeReady = () => Boolean(REDIS_URL && REDIS_TOKEN);

/** Upstash REST: POST [command, ...args] */
async function redis(...args: (string | number)[]): Promise<unknown> {
  if (!storeReady()) throw new Error("store_not_configured");
  const res = await fetch(REDIS_URL as string, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as { result?: unknown; error?: string };
  if (!res.ok || json.error) throw new Error(json.error || `redis_${res.status}`);
  return json.result;
}

export type Rsvp = {
  name: string;
  dates: Record<string, "yes" | "no">;
  budget: number | null;
  styles: string[];
  trip: string | null;
  memo: string;
  updatedAt: number;
  source?: "web" | "import";
};
type Stored = Rsvp & { tokenHash: string | null };

const STYLE_IDS = ["home", "studio", "pension", "dine"];
const TRIP_IDS = ["day", "1n", "2n", "skip"];

/** 클라이언트 입력 검증 (신뢰하지 않음) */
export function cleanRsvp(o: unknown): Omit<Rsvp, "updatedAt" | "source"> | null {
  if (!o || typeof o !== "object") return null;
  const r = o as Record<string, unknown>;
  const name = typeof r.name === "string" ? r.name.trim().slice(0, 30) : "";
  if (!name) return null;
  const dates: Record<string, "yes" | "no"> = {};
  if (r.dates && typeof r.dates === "object") {
    for (const [k, v] of Object.entries(r.dates as Record<string, unknown>).slice(0, 200)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && (v === "yes" || v === "no")) dates[k] = v;
    }
  }
  const b = Number(r.budget);
  const budget = r.budget != null && Number.isFinite(b) && b >= 0 && b <= 10_000_000 ? b : null;
  const styles = Array.isArray(r.styles) ? r.styles.filter((s): s is string => STYLE_IDS.includes(s as string)) : [];
  const trip = TRIP_IDS.includes(r.trip as string) ? (r.trip as string) : null;
  const memo = typeof r.memo === "string" ? r.memo.slice(0, 300) : "";
  return { name, dates, budget, styles: Array.from(new Set(styles)), trip, memo };
}

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export async function getRsvp(id: string): Promise<Stored | null> {
  const raw = await redis("HGET", HASH_KEY, id);
  if (typeof raw !== "string") return null;
  try { return JSON.parse(raw) as Stored; } catch { return null; }
}

export async function putRsvp(id: string, value: Stored) {
  await redis("HSET", HASH_KEY, id, JSON.stringify(value));
}

export async function countRsvps(): Promise<number> {
  return Number(await redis("HLEN", HASH_KEY)) || 0;
}

export async function listRsvps(): Promise<(Rsvp & { id: string })[]> {
  const flat = (await redis("HGETALL", HASH_KEY)) as string[] | null;
  const out: (Rsvp & { id: string })[] = [];
  if (!Array.isArray(flat)) return out;
  for (let i = 0; i < flat.length; i += 2) {
    try {
      const { tokenHash: _omit, ...rest } = JSON.parse(flat[i + 1]) as Stored;
      out.push({ ...rest, id: flat[i] });
    } catch { /* skip broken row */ }
  }
  return out;
}

/** 관리자 비밀번호 확인 (PARTY_ADMIN_PASSWORD 환경변수) */
export function isAdmin(key: string | null): boolean {
  const pw = process.env.PARTY_ADMIN_PASSWORD;
  if (!pw || !key) return false;
  const a = Buffer.from(sha256(pw)), b = Buffer.from(sha256(key));
  return timingSafeEqual(a, b);
}
