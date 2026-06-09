import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

// Durable per-IP rate limiting for the subscribe endpoint. Serverless instances
// don't share memory, so the counter lives in Upstash Redis (see lib/redis.ts
// for how the client is constructed).
//
// When Redis isn't configured (e.g. local dev without creds) the limiter is
// disabled and `allowSubscribe()` allows every request, so the app stays
// runnable without an account.
const ratelimit = redis
  ? new Ratelimit({
      redis,
      // 5 sign-ups per IP per 10 minutes — generous for a human, hostile to a
      // bot trying to mint rows. Sliding window smooths burst behaviour.
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      prefix: "subscribe",
      analytics: false,
    })
  : null;

// Returns whether the request from `ip` is allowed. No-ops (always allows) when
// the limiter isn't configured.
export async function allowSubscribe(ip: string): Promise<boolean> {
  if (!ratelimit) return true;
  const { success } = await ratelimit.limit(ip);
  return success;
}
