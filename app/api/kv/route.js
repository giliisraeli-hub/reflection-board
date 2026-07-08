import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET(req) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  try {
    const value = await kv.get(key);
    return NextResponse.json({ value: value ?? null });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { key, value } = await req.json();
    if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
    await kv.set(key, value);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
