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
const STALE_KEY = "wc:matches:stale";
const LOCK_KEY = "wc:matches:lock";
// Upstream is re-fetched at most once per window, no matter how many clients
// poll — this is what keeps us far under football-data.org's 10 req/min free
// ceiling. Independent of visitor count.
const TTL_SECONDS = 45;
// Long-lived copy of the last good payload, served instantly while a refresh
// is in flight (or after a failed one) so the banner never paints blank.
const STALE_TTL_SECONDS = 6 * 60 * 60;

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

// Transient fallback (lock lost, upstream error): must never be edge-cached,
// or an empty payload would mask the fresh data for up to s-maxage seconds.
function emptyFallback() {
  return NextResponse.json(
    { matches: [], demo: false, updatedAt: null } satisfies Payload,
    { headers: { "Cache-Control": "no-store" } },
  );
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

    // Cold/expired cache: only one request should refresh upstream. Losers
    // serve the last good payload instantly; only a first-ever visitor (no
    // stale copy yet) waits briefly for the winner's write.
    const gotLock = await redis.set(LOCK_KEY, "1", { nx: true, ex: 10 });
    if (!gotLock) {
      const stale = await redis.get<Payload>(STALE_KEY);
      if (stale) return json(stale);
      for (let i = 0; i < 6; i++) {
        await new Promise((r) => setTimeout(r, 500));
        const refreshed = await redis.get<Payload>(CACHE_KEY);
        if (refreshed) return json(refreshed);
      }
      return emptyFallback();
    }
  }

  // fetchUpstreamMatches throws on upstream failure, so a bad refresh lands
  // here and is never written to the cache as if it were real data.
  let matches: LiveMatch[];
  try {
    matches = await fetchUpstreamMatches();
  } catch (err) {
    console.error("scores fetch failed", err);
    if (redis) {
      // Release the lock so the next poll can retry immediately instead of
      // waiting out the lock TTL, and serve the last good payload meanwhile.
      await redis.del(LOCK_KEY);
      const stale = await redis.get<Payload>(STALE_KEY);
      if (stale) return json(stale);
    }
    return emptyFallback();
  }

  const payload: Payload = {
    matches,
    demo: false,
    updatedAt: new Date().toISOString(),
  };
  if (redis) {
    await Promise.all([
      redis.set(CACHE_KEY, payload, { ex: TTL_SECONDS }),
      redis.set(STALE_KEY, payload, { ex: STALE_TTL_SECONDS }),
    ]);
  }
  return json(payload);
}
