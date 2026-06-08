// Canonical site URL, resolved once for metadata, robots, and sitemap.
// On Vercel this fills in automatically:
//   - NEXT_PUBLIC_SITE_URL — set this to your custom domain for production.
//   - VERCEL_PROJECT_PRODUCTION_URL — Vercel's stable production domain (build-time).
//   - VERCEL_URL — the per-deployment URL (preview deploys).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/`
      : "http://localhost:3000/");

// The tournament this predictor covers. Stored alongside each subscriber so the
// table stays meaningful if the app is ever pointed at a future tournament.
// Override via NEXT_PUBLIC_TOURNAMENT; defaults to the current edition.
export const TOURNAMENT =
  process.env.NEXT_PUBLIC_TOURNAMENT || "FIFA World Cup 2026";
