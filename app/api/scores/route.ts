import {
  fetchUpstreamMatches,
  demoMatches,
  type LiveMatch,
} from "@/lib/scores";
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

// Always run on request — never statically cached at build, since the payload
// is live data served from Redis.
export const dynamic = "force-dynamic";

const CACHE_KEY = "wc:matches";
const LOCK_KEY = "wc:matches:lock";
// Upstream is re-fetched at most once per window, no matter how many clients
// poll — this is what keeps us far under football-data.org's 10 req/min free
// ceiling. Independent of visitor count.
const TTL_SECONDS = 45;

interface Payload {
  matches: LiveMatch[];
  demo: boolean; // true when serving the stand-in feed (no API key configured)
  updatedAt: string | null;
}

// Tell Vercel's edge it may serve a shared copy for ~30s, absorbing bursts
// without even invoking this function.
function json(body: Payload) {
  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=30" },
  });
}

export async function GET() {
  // Without a key we can't hit the real API — serve the demo feed so the
  // section still renders, clearly flagged. Not cached (it's static + cheap).
  if (!process.env.FOOTBALL_API_KEY) {
    return json({ matches: demoMatches(), demo: true, updatedAt: null });
  }

  // Fast path: a warm cache serves everyone with no upstream call.
  if (redis) {
    const cached = await redis.get<Payload>(CACHE_KEY);
    if (cached) return json(cached);

    // Cold/expired cache: only one request should refresh upstream. Take a
    // short lock; losers return empty rather than stampeding the API.
    const gotLock = await redis.set(LOCK_KEY, "1", { nx: true, ex: 10 });
    if (!gotLock) return json({ matches: [], demo: false, updatedAt: null });
  }

  let matches: LiveMatch[];
  try {
    matches = await fetchUpstreamMatches();
  } catch (err) {
    console.error("scores fetch failed", err);
    return json({ matches: [], demo: false, updatedAt: null });
  }

  const payload: Payload = {
    matches,
    demo: false,
    updatedAt: new Date().toISOString(),
  };
  if (redis) await redis.set(CACHE_KEY, payload, { ex: TTL_SECONDS });
  return json(payload);
}
