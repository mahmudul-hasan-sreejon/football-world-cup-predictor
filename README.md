# FIFA World Cup 2026 Bracket Predictor

An interactive FIFA World Cup 2026 bracket predictor — rank all 12 groups, pick the 8 best
third-placed teams, and play out the knockout stage to the Final using FIFA's official Annex C
seeding logic.

Built with [Next.js](https://nextjs.org) (App Router) and TypeScript.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — lint

## How it works

The predictor walks through three stages:

1. **Groups** — rank each of the 12 groups in your predicted finishing order. The 4th place fills
   in automatically once the top three are set.
2. **Best Thirds** — choose which 8 of the 12 third-placed teams advance. _Which_ groups they come
   from feeds FIFA's Annex C lookup, which determines the exact Round-of-32 pairings.
3. **Knockout** — a seeded single-elimination bracket from the Round of 32 to the Final. Pick a
   winner in each tie; changing an earlier pick automatically invalidates the rounds after it.

Crowning a champion fires a confetti burst (skipped for users who prefer reduced motion) and opens a
modal to optionally subscribe with an email — the only thing saved server-side, in Vercel Postgres
(see [Configuration](#configuration)).

Your bracket picks live in memory only (no persistence) — use **Copy summary** to export them as
text. The theme preference is saved client-side, in `localStorage` under `wc26-theme`.

## Configuration

All environment variables are optional. Copy the template and adjust as needed:

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SITE_URL` — the canonical site URL used for SEO metadata, `robots.txt`, and
  `sitemap.xml`. On Vercel it's resolved automatically (see [Deployment](#deployment)); locally it
  defaults to `http://localhost:3000/`.
- `POSTGRES_URL` — Vercel Postgres connection string used by the `/api/subscribe` route to store
  newsletter sign-ups. On Vercel it's injected automatically when you attach a Postgres store; set it
  locally only to test subscriptions. The `subscribers` table is created on first use, so no
  migration step is needed.
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis REST credentials used to
  rate-limit the `/api/subscribe` route per IP (see [Abuse protection](#abuse-protection)). On Vercel
  they're injected automatically when you attach an Upstash for Redis store (under the names
  `KV_REST_API_URL` / `KV_REST_API_TOKEN`, which the code also accepts). When unset, the limiter is
  disabled and every request is allowed, so the app still runs without them.

`.env.local` is gitignored; `.env.example` is the committed reference.

## Abuse protection

The `/api/subscribe` route is the only public write endpoint, so it's hardened against bots trying
to bloat the `subscribers` table (see `app/api/subscribe/route.ts` and `lib/rate-limit.ts`):

- **Rate limiting** — 5 sign-ups per IP per 10 minutes (sliding window), backed by Upstash Redis so
  the counter is durable across serverless instances. Disabled gracefully when Redis isn't
  configured.
- **Body size cap** — requests over 1 KB are rejected before parsing.
- **Bounded `champion`** — only a known team name (or `null`) is stored, never arbitrary free text.
- **Email cap** — addresses over the RFC 5321 maximum of 254 characters are rejected.
- **Honeypot** — a hidden form field that real users never fill; submissions that populate it get a
  silent fake-success and are not persisted.
- **Unique emails** — the `email` column is `UNIQUE` and normalized (trimmed + lowercased), so the
  same address can never create a second row; a repeat sign-up is rejected with a `409`.

## Project structure

- `app/layout.tsx` — root layout, SEO metadata, fonts, JSON-LD, no-flash theme script
- `app/page.tsx` — static hero/footer, mounts the predictor
- `app/predictor.tsx` — client component holding all interactive state and rendering
- `app/confetti.ts` — dependency-free canvas confetti burst for the champion celebration
- `app/api/subscribe/route.ts` — POST endpoint: rate-limits, validates input, and upserts a subscriber
- `lib/rate-limit.ts` — durable per-IP rate limiter for the subscribe route (Upstash Redis)
- `app/globals.css` — global styles
- `app/icon.svg` — favicon (served as `/icon.svg`)
- `app/opengraph-image.tsx` — dynamically generated 1200×630 social-share image (`next/og`)
- `app/robots.ts` / `app/sitemap.ts` — generated `robots.txt` and `sitemap.xml`
- `lib/bracket.ts` — tournament data + types + pure bracket logic (Annex C seeding, resolve/validate)
- `lib/subscribers.ts` — Vercel Postgres data layer for newsletter sign-ups (unique-email insert + table bootstrap)
- `lib/site.ts` — resolves the canonical site URL (shared by layout, robots, and sitemap)
- `lib/utils.ts` — `cn()` class-name helper (clsx + tailwind-merge)
- `components/ui/` — shadcn/ui primitives (button, card, dialog, tabs, sonner toaster)

## Deployment

### Vercel (recommended)

Push this repo to GitHub/GitLab/Bitbucket and import it at [vercel.com/new](https://vercel.com/new).
Vercel auto-detects Next.js — no build settings needed. The canonical URL (and the OG image,
`robots.txt`, and `sitemap.xml` derived from it) fills in automatically from Vercel's
`VERCEL_PROJECT_PRODUCTION_URL`; see `lib/site.ts` for the resolution order.

To enable the newsletter sign-up, attach a Postgres store under the project's **Storage** tab.
Vercel injects `POSTGRES_URL` automatically and the `subscribers` table is created on first use, so
no migration step is needed. Skip this and the app still works — only the `/api/subscribe` route
errors on submit.

To rate-limit that endpoint in production, also attach an **Upstash for Redis** store from the same
**Storage** tab. Vercel injects the REST credentials automatically (`KV_REST_API_URL` /
`KV_REST_API_TOKEN`), which `lib/rate-limit.ts` picks up — then redeploy. Skip this and the route
still works, just without rate limiting. See [Abuse protection](#abuse-protection).

When you attach a custom domain, set an environment variable so SEO metadata uses it:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com/
```

(Note the trailing slash.) Or deploy from the CLI with `npx vercel` / `npx vercel --prod`.

### Other hosts

Every page route prerenders to static HTML, but the `/api/subscribe` route is a server-rendered
function, so the app needs a Node host (not a static-only one) for the newsletter to work. Outside
Vercel, set `NEXT_PUBLIC_SITE_URL` to your real URL (it defaults to `http://localhost:3000/`) and
provide `POSTGRES_URL` yourself if you want sign-ups. To rate-limit the endpoint, also set
`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from any Upstash Redis database.
