import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Works with env vars named either UPSTASH_REDIS_REST_URL/TOKEN (Upstash's own naming)
// or KV_REST_API_URL/TOKEN (older Vercel KV naming) — whichever the Marketplace
// integration injects into your project.
function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      "No Redis credentials found. Connect a Redis/Upstash database to this project in Vercel's Storage tab, then redeploy."
    );
  }
  return new Redis({ url, token });
}

export async function GET(req) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  try {
    const redis = getRedis();
    const value = await redis.get(key);
    return NextResponse.json({ value: value ?? null });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { key, value } = await req.json();
    if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
    const redis = getRedis();
    await redis.set(key, value);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
