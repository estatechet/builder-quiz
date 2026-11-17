// 응답자 본인 RSVP 조회/저장. 브라우저가 만든 id + 비밀 token으로 본인 확인.
import { NextResponse } from "next/server";
import { cleanRsvp, countRsvps, getRsvp, MAX_RESPONSES, putRsvp, sha256, storeReady } from "@/lib/party";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ID_RE = /^[a-f0-9]{32}$/;
const TOKEN_RE = /^[a-f0-9]{64}$/;
const err = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function GET(req: Request) {
  if (!storeReady()) return err("store_not_configured", 503);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "", token = searchParams.get("token") || "";
  if (!ID_RE.test(id) || !TOKEN_RE.test(token)) return err("bad_request", 400);
  try {
    const row = await getRsvp(id);
    if (!row || row.tokenHash !== sha256(token)) return err("not_found", 404);
    const { tokenHash: _omit, ...data } = row;
    return NextResponse.json({ data });
  } catch {
    return err("store_error", 502);
  }
}

export async function POST(req: Request) {
  if (!storeReady()) return err("store_not_configured", 503);
  const body = (await req.json().catch(() => null)) as { id?: string; token?: string; data?: unknown } | null;
  const id = body?.id || "", token = body?.token || "";
  if (!ID_RE.test(id) || !TOKEN_RE.test(token)) return err("bad_request", 400);
  const data = cleanRsvp(body?.data);
  if (!data) return err("invalid_data", 400);
  try {
    const existing = await getRsvp(id);
    if (existing) {
      if (existing.tokenHash !== sha256(token)) return err("forbidden", 403);
    } else if ((await countRsvps()) >= MAX_RESPONSES) {
      return err("full", 429);
    }
    await putRsvp(id, { ...data, updatedAt: Date.now(), source: "web", tokenHash: sha256(token) });
    return NextResponse.json({ ok: true });
  } catch {
    return err("store_error", 502);
  }
}
