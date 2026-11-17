// 관리자 전용: 전체 응답 조회(GET) / 회신 카드 가져오기(POST). x-admin-key 헤더 필요.
import { NextResponse } from "next/server";
import { cleanRsvp, isAdmin, listRsvps, putRsvp, sha256, storeReady } from "@/lib/party";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const err = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function GET(req: Request) {
  if (!process.env.PARTY_ADMIN_PASSWORD) return err("admin_not_configured", 503);
  if (!isAdmin(req.headers.get("x-admin-key"))) return err("unauthorized", 401);
  if (!storeReady()) return err("store_not_configured", 503);
  try {
    return NextResponse.json({ responses: await listRsvps() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return err("store_error", 502);
  }
}

export async function POST(req: Request) {
  if (!isAdmin(req.headers.get("x-admin-key"))) return err("unauthorized", 401);
  if (!storeReady()) return err("store_not_configured", 503);
  const body = (await req.json().catch(() => null)) as { items?: unknown[] } | null;
  const items = Array.isArray(body?.items) ? body!.items.slice(0, 50) : [];
  let ok = 0, bad = 0;
  for (const item of items) {
    const data = cleanRsvp(item);
    if (!data) { bad++; continue; }
    try {
      await putRsvp("imp-" + sha256(data.name).slice(0, 16), { ...data, updatedAt: Date.now(), source: "import", tokenHash: null });
      ok++;
    } catch { bad++; }
  }
  return NextResponse.json({ ok, bad });
}
