import { Redis } from "@upstash/redis";

// Shared Upstash Redis client, reused for both rate limiting and caching live
// scores so the app provisions a single database.
//
// Vercel's Upstash/KV Marketplace integration injects the REST credentials as
// KV_REST_API_URL / KV_REST_API_TOKEN; a standalone Upstash database uses
// UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN. Accept either so it works
// however the database was provisioned.
//
// When neither pair is present (e.g. local dev without creds) `redis` is null;
// callers must treat that as "no cache / no limiter" and degrade gracefully.
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;
