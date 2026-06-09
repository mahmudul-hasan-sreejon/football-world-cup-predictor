import { useEffect, useState } from "react";
import type { LiveMatch } from "@/lib/scores";

// Polls our own Redis-cached /api/scores endpoint and returns the latest
// matches plus whether the endpoint is serving the stand-in demo feed.
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
    const FAST = 30_000,
      SLOW = 300_000;

    async function tick() {
      if (stop || document.hidden) return; // hidden: onVisible restarts us
      let next = SLOW;
      try {
        const res = await fetch("/api/scores");
        const data = await res.json();
        const ms: LiveMatch[] = Array.isArray(data?.matches) ? data.matches : [];
        if (!stop) {
          setLive(ms);
          setDemoFeed(!!data?.demo);
        }
        if (ms.some((m) => m.isLive)) next = FAST;
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
