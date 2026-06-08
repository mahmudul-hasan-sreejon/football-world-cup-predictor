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
