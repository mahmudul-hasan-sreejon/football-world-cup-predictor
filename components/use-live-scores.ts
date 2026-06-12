import { useEffect, useState } from "react";
import type { LiveMatch } from "@/lib/scores";

// Polls our own Redis-cached /api/scores endpoint and returns the latest
// matches plus whether the endpoint is serving the stand-in demo feed.
// Mounted independently by the live banner (via the predictor) and the
// fixtures list — each instance runs its own loop, which is fine because the
// endpoint is cached and the loops are cheap.
//
// The timer is self-rescheduling. The endpoint is cached, so however often we
// poll, upstream is only hit ~once per cache window. We still keep our own
// footprint low: fast cadence only while a match is in play, slow otherwise,
// and no network work at all while the tab is hidden (visibilitychange wakes
// the loop back up).
export function useLiveScores(): { live: LiveMatch[]; demoFeed: boolean } {
  // True when the endpoint is serving the stand-in feed (no API key configured).
  const [live, setLive] = useState<LiveMatch[]>([]);
  const [demoFeed, setDemoFeed] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stop = false;
    // What's currently on screen — drives the cadence, so a transient empty
    // response mid-match doesn't drop us to the slow interval.
    let shown: LiveMatch[] = [];
    // Consecutive empty responses; bounds the quick-retry burst below.
    let misses = 0;
    const FAST = 30_000,
      SLOW = 300_000,
      RETRY = 3_000;

    async function tick() {
      if (stop || document.hidden) return; // hidden: onVisible restarts us
      let next = SLOW;
      try {
        const res = await fetch("/api/scores");
        const data = await res.json();
        const ms: LiveMatch[] = Array.isArray(data?.matches) ? data.matches : [];
        if (!stop) {
          // An empty list is the server's transient fallback (cache-miss lock
          // lost, upstream error) — keep what's on screen rather than wiping
          // live scores; a follow-up tick will catch up.
          if (ms.length > 0) {
            shown = ms;
            misses = 0;
            setLive(ms);
            setDemoFeed(!!data?.demo);
          } else {
            misses++;
          }
        }
        if (shown.some((m) => m.isLive)) next = FAST;
        // After a transient empty, real data is usually in the cache within
        // seconds — retry quickly a few times before falling back to the
        // regular cadence (so first load isn't blank until the next interval).
        if (ms.length === 0 && misses <= 3) next = RETRY;
      } catch {}
      if (!stop) timer = setTimeout(tick, next);
    }
    function onVisible() {
      if (!document.hidden) {
        clearTimeout(timer);
        tick();
      }
    }

    tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stop = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return { live, demoFeed };
}
