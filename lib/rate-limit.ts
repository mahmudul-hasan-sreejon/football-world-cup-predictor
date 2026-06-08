import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Durable per-IP rate limiting for the subscribe endpoint. Serverless instances
// don't share memory, so the counter lives in Upstash Redis.
//
// Vercel's Upstash/KV Marketplace integration injects the REST credentials as
// KV_REST_API_URL / KV_REST_API_TOKEN; a standalone Upstash database uses
// UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN. Accept either so it works
// however the database was provisioned.
//
// When neither pair is present (e.g. local dev without creds) the limiter is
// disabled and `allowSubscribe()` allows every request, so the app stays
// runnable without an account.
const url =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const ratelimit =
  url && token
    ? new Ratelimit({
        redis: new Redis({ url, token }),
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
