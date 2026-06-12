import {
  fetchUpstreamMatches,
  demoMatches,
  isFinished,
  anyPotentiallyLive,
  type LiveMatch,
} from "@/lib/scores";
import { saveFinished, getFinishedFromDb } from "@/lib/fixtures";
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

// Always run on request — never statically cached at build, since the payload
// is live data served from Redis.
export const dynamic = "force-dynamic";

const CACHE_KEY = "wc:matches";
const STALE_KEY = "wc:matches:stale";
const LOCK_KEY = "wc:matches:lock";
// Finished results, cached in front of the fixtures table in Postgres. A
// finished result never changes, so the long TTL is purely a freshness cap on
// the cache copy — the DB remains the durable source.
const DONE_KEY = "wc:fixtures:done";
// Last-known snapshot of every not-yet-finished match (schedule, kickoff
// times, knockout pairings). This is what lets us answer polls between
// matchdays without touching the upstream API: upcoming matches haven't been
// played, so the snapshot is as good as a live fetch. The TTL bounds how stale
// the schedule can get (pairings firm up between rounds) — between matchdays
// upstream is called at most once per window instead of once per 45s.
const SCHEDULE_KEY = "wc:schedule";
// Upstream is re-fetched at most once per window while a match is in play, no
// matter how many clients poll — this is what keeps us far under
// football-data.org's 10 req/min free ceiling. Independent of visitor count.
const TTL_SECONDS = 45;
// Long-lived copy of the last good payload, served instantly while a refresh
// is in flight (or after a failed one) so the banner never paints blank.
const STALE_TTL_SECONDS = 6 * 60 * 60;
const DONE_TTL_SECONDS = 24 * 60 * 60;
const SCHEDULE_TTL_SECONDS = 12 * 60 * 60;

interface Payload {
  matches: LiveMatch[];
  demo: boolean; // true when serving the stand-in feed (no API key configured)
  updatedAt: string | null;
}

// What SCHEDULE_KEY stores: the not-yet-finished matches as of the last real
// upstream fetch, plus how many finished matches existed then. The count lets
// the quiet path detect a hole (done-cache expired AND the DB is missing rows)
// and fall through to a real fetch instead of serving a list with results gone.
interface ScheduleSnapshot {
  matches: LiveMatch[];
  finished: number;
  updatedAt: string;
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

// Finished results: Redis first, then the fixtures table in Postgres (seeding
// Redis on the way out). A DB error degrades to [] — the quiet path's
// completeness check then forces a real fetch rather than serving a hole.
async function getFinishedResults(): Promise<LiveMatch[]> {
  if (redis) {
    const cached = await redis.get<LiveMatch[]>(DONE_KEY);
    if (cached) return cached;
  }
  let fromDb: LiveMatch[];
  try {
    fromDb = await getFinishedFromDb();
  } catch (err) {
    console.error("fixtures read failed", err);
    return [];
  }
  if (redis && fromDb.length > 0) {
    await redis.set(DONE_KEY, fromDb, { ex: DONE_TTL_SECONDS });
  }
  return fromDb;
}

// Tournament order for the merged quiet-path payload (the upstream API returns
// matches in this order too, so consumers see a consistent shape either way).
function byKickoff(a: LiveMatch, b: LiveMatch): number {
  return a.utcDate < b.utcDate ? -1 : a.utcDate > b.utcDate ? 1 : a.id - b.id;
}

export async function GET() {
  // Without a key we can't hit the real API — serve the demo feed so the
  // section still renders, clearly flagged. Not cached (it's static + cheap).
  if (!process.env.FOOTBALL_API_KEY) {
    return json({ matches: demoMatches(), demo: true, updatedAt: null });
  }

  if (redis) {
    // Fast path: a warm cache (≤45s old, so only ever during a live window)
    // serves everyone with no upstream call.
    const cached = await redis.get<Payload>(CACHE_KEY);
    if (cached) return json(cached);

    // Quiet path: no match can be in play right now, so nothing upstream has
    // changed since the snapshot was taken. Finished results come from
    // cache/DB, everything else from the schedule snapshot — zero API calls.
    // Skipped when the finished set can't be fully reassembled (snapshot says
    // more results exist than we recovered): fall through and re-fetch.
    const snap = await redis.get<ScheduleSnapshot>(SCHEDULE_KEY);
    if (snap && !anyPotentiallyLive(snap.matches, new Date().toISOString())) {
      const done = await getFinishedResults();
      if (done.length >= snap.finished) {
        return json({
          matches: [...done, ...snap.matches].sort(byKickoff),
          demo: false,
          updatedAt: snap.updatedAt,
        });
      }
    }

    // Live (or snapshot-expired) path with a cold cache: only one request
    // should refresh upstream. Losers serve the last good payload instantly;
    // only a first-ever visitor (no stale copy yet) waits briefly for the
    // winner's write.
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

  const updatedAt = new Date().toISOString();
  const payload: Payload = { matches, demo: false, updatedAt };

  // A real fetch is the one moment we can split the tournament into its
  // tiers: finished results go to Postgres (durable) + Redis (fast), the rest
  // becomes the schedule snapshot that answers polls until the next live
  // window. None of these writes may fail the response — the payload is
  // already in hand.
  const finished = matches.filter(isFinished);
  const rest = matches.filter((m) => !isFinished(m));
  const writes: Promise<unknown>[] = [
    saveFinished(finished).catch((err) =>
      console.error("fixtures write failed", err),
    ),
  ];
  if (redis) {
    writes.push(
      redis.set(CACHE_KEY, payload, { ex: TTL_SECONDS }),
      redis.set(STALE_KEY, payload, { ex: STALE_TTL_SECONDS }),
      redis.set(
        SCHEDULE_KEY,
        {
          matches: rest,
          finished: finished.length,
          updatedAt,
        } satisfies ScheduleSnapshot,
        { ex: SCHEDULE_TTL_SECONDS },
      ),
    );
    if (finished.length > 0) {
      writes.push(redis.set(DONE_KEY, finished, { ex: DONE_TTL_SECONDS }));
    }
  }
  await Promise.all(writes);
  return json(payload);
}
