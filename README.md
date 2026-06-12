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

Above the stages, a **Live & Latest Results** strip shows in-play and upcoming matches, polled from a
cached `/api/scores` endpoint; it falls back to a curated demo feed when no football-data.org key is
configured (see [Live scores](#live-scores)). The whole predictor renders a shimmering skeleton until
it mounts on the client, so the real picks and live data fade in without a layout pop-in.

Below the predictor, the page also serves as a reference: a crawlable summary of all 12 groups, a
**Fixtures** section with the full 104-match schedule (grouped by day in your local time, with live
scores updating in place — fed by the same cached endpoint), and an FAQ. A sticky top navbar links
to each section — behind a hamburger menu on phones — and houses the light/dark theme toggle.

Your bracket picks live in memory only and reset on reload. **Auto-pick by ranking** fills the entire
bracket from rough team-strength ratings as an editable starting point, and **Reset** clears it. The
theme preference is saved client-side, in `localStorage` under `wc26-theme`.

## Live scores

The **Live & Latest Results** strip and the **Fixtures** section are fed by one upstream source —
football-data.org — behind a tiered caching layer designed so they never go blank, the free API
tier is never exceeded, and **upstream is only called while a match may actually be in play** (see
`app/api/scores/route.ts`, `lib/scores.ts`, and `lib/fixtures.ts`):

- **Finished matches** — a result is immutable once the final whistle goes, so it's persisted to
  the `fixtures` table in Postgres (keyed by the match's serial id, in tournament order) and served
  from a 24-hour Redis cache in front of it; a cache miss falls back to the database and reseeds
  the cache. Finished matches never trigger an upstream call again.
- **Upcoming matches** — haven't been played, so there's nothing to fetch: they're answered from a
  12-hour Redis snapshot of the schedule taken at the last real fetch. The snapshot's expiry is the
  only reason upstream is touched between matchdays (about twice a day, to pick up schedule changes
  and knockout pairings as they firm up).
- **Ongoing matches** — the only tier that calls the API, gated by a pure check ("is some
  non-finished match live, or within ~3.5h of kickoff?"). During a live window, upstream responses
  are cached in Redis for 45 seconds, so upstream sees at most ~1 request per 45s regardless of
  traffic. A `Cache-Control: s-maxage=30` header additionally lets Vercel's edge absorb polling
  bursts without invoking the function.
- **Stampede lock** — when the fresh cache expires, a short Redis lock ensures exactly one request
  refreshes upstream while concurrent ones are served from the stale copy.
- **Stale fallback** — every good payload is also kept for 6 hours. If a refresh is in flight or
  upstream fails (timeout, rate limit, outage), clients get the last known good scores instantly
  instead of an empty list; a failed refresh also releases the lock so the next poll retries
  immediately. Only a cold start with nothing cached at all can serve empty — and that response is
  marked `no-store` so it's never cached over real data.
- **Client polling** — `use-live-scores.ts` polls every 30s while a match is in play and every 5
  minutes otherwise, pausing entirely while the tab is hidden. A transient empty response never
  wipes scores already on screen; the hook keeps them and quick-retries within seconds.
- **Demo feed** — with no `FOOTBALL_API_KEY` configured the endpoint serves a curated stand-in
  feed, flagged with a "Demo feed" badge in the UI, so both sections still render in local dev.

## Configuration

All environment variables are optional. Copy the template and adjust as needed:

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SITE_URL` — the canonical site URL used for SEO metadata, `robots.txt`, and
  `sitemap.xml`. On Vercel it's resolved automatically (see [Deployment](#deployment)); locally it
  defaults to `http://localhost:3000/`.
- `POSTGRES_URL` — Vercel Postgres connection string used by the `/api/subscribe` route to store
  newsletter sign-ups and by `/api/scores` to persist finished match results (the `fixtures`
  table). On Vercel it's injected automatically when you attach a Postgres store; set it locally
  only to test those paths. Both tables are created on first use, so no migration step is needed.
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis REST credentials used to
  rate-limit the `/api/subscribe` route per IP (see [Abuse protection](#abuse-protection)) and to
  cache live scores for `/api/scores` (see [Live scores](#live-scores)). On Vercel
  they're injected automatically when you attach an Upstash for Redis store (under the names
  `KV_REST_API_URL` / `KV_REST_API_TOKEN`, which the code also accepts). When unset, the limiter is
  disabled and every request is allowed, so the app still runs without them.
- `FOOTBALL_API_KEY` — [football-data.org](https://www.football-data.org/) API key for the live
  scores strip. The free tier is sufficient — the Redis cache caps upstream traffic at ~1 request
  per 45 seconds regardless of visitor count. When unset, the strip shows a curated demo feed
  instead (see [Live scores](#live-scores)).

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

- `app/layout.tsx` — root layout, SEO metadata, fonts, JSON-LD (`WebApplication` + `SportsEvent` + `FAQPage`), no-flash theme script; renders the sticky top navbar above the page
- `components/site-nav.tsx` — the sticky top navbar: favicon + site name, anchor links to the page
  sections (`#live`, `#prediction`, `#groups`, `#fixture`, `#faq`) — behind a hamburger dropdown on
  phones (`nav-menu.tsx`), inline on wider screens — and the theme toggle (`theme-toggle.tsx`,
  backed by the shared `use-theme` hook)
- `components/fixture-list.tsx` — the full tournament schedule (all 104 matches grouped by day, live
  scores in place), fed by the shared `use-live-scores` hook; the body of the `#fixture` section
- `app/page.tsx` — static hero/footer, mounts the predictor and the fixtures section; also
  server-renders the 12-group/48-team summary and FAQ sections — the page's crawlable copy, since
  the predictor itself is client-only
- `app/confetti.ts` — dependency-free canvas confetti burst for the champion celebration
- `app/globals.css` — stylesheet entry point; imports the per-concern partials under `app/styles/`
- `app/icon.svg` — favicon (served as `/icon.svg`)
- `app/opengraph-image.tsx` — dynamically generated 1200×630 social-share image (`next/og`)
- `app/manifest.ts` — PWA web manifest (served as `/manifest.webmanifest`)
- `app/robots.ts` / `app/sitemap.ts` — generated `robots.txt` and `sitemap.xml`
- `app/api/subscribe/route.ts` — POST endpoint: rate-limits, validates input, and upserts a subscriber
- `app/api/scores/route.ts` — GET endpoint the client polls for live scores (tiered: finished from
  cache/Postgres, upcoming from a schedule snapshot, the API called only while a match may be live;
  demo-feed fallback)
- `components/predictor/` — the interactive UI: a stateful container (`predictor.tsx`) plus presentational
  stages (`groups-stage`, `thirds-stage`, `knockout-stage`), `nav`, `live-banner`, `subscribe-dialog`, the
  pre-mount `predictor-skeleton`, and the `ad-slot` wrapper for Adsterra units (the shared
  `use-live-scores` poller lives at `components/use-live-scores.ts`)
- `components/ui/` — shadcn/ui primitives, structural wrappers over the bespoke CSS (badge, button, card,
  dialog, input, tabs, sonner toaster, skeleton)
- `lib/bracket.ts` — tournament types + pure bracket logic (resolve/validate); re-exports `lib/annex.ts`
  (the Annex C seeding table) and `lib/teams.ts` (team data + indexes)
- `lib/faq.ts` — FAQ copy shared by the visible FAQ section and the `FAQPage` JSON-LD, so the
  structured data always matches the on-page text
- `lib/scores.ts` — live-score domain layer: normalizes football-data.org matches and the demo feed
- `lib/fixtures.ts` — Vercel Postgres data layer for finished match results (insert-once by match
  serial + table bootstrap)
- `lib/subscribers.ts` — Vercel Postgres data layer for newsletter sign-ups (unique-email insert + table bootstrap)
- `lib/rate-limit.ts` — durable per-IP rate limiter for the subscribe route (Upstash Redis)
- `lib/redis.ts` — shared Upstash Redis client, reused by the rate limiter and the live-scores cache
- `lib/site.ts` — resolves the canonical site URL (shared by layout, robots, and sitemap)
- `lib/utils.ts` — `cn()` class-name helper (clsx + tailwind-merge)

## Deployment

### Vercel (recommended)

Push this repo to GitHub/GitLab/Bitbucket and import it at [vercel.com/new](https://vercel.com/new).
Vercel auto-detects Next.js — no build settings needed. The canonical URL (and the OG image,
`robots.txt`, and `sitemap.xml` derived from it) fills in automatically from Vercel's
`VERCEL_PROJECT_PRODUCTION_URL`; see `lib/site.ts` for the resolution order.

To enable the newsletter sign-up and the durable store of finished match results, attach a
Postgres store under the project's **Storage** tab. Vercel injects `POSTGRES_URL` automatically
and the `subscribers`/`fixtures` tables are created on first use, so no migration step is needed.
Skip this and the app still works — the `/api/subscribe` route errors on submit, and finished
results lean on the Redis caches and upstream API alone.

To rate-limit that endpoint in production, also attach an **Upstash for Redis** store from the same
**Storage** tab. Vercel injects the REST credentials automatically (`KV_REST_API_URL` /
`KV_REST_API_TOKEN`), which `lib/rate-limit.ts` picks up — then redeploy. Skip this and the route
still works, just without rate limiting. See [Abuse protection](#abuse-protection). The same store
also backs the live-scores cache, which is what keeps the football-data.org free tier sufficient
under real traffic — set `FOOTBALL_API_KEY` in the project's environment variables to enable real
scores (see [Live scores](#live-scores)).

When you attach a custom domain, set an environment variable so SEO metadata uses it:

```bash
NEXT_PUBLIC_SITE_URL=https://fifaworldcuppredictor.online/
```

(Note the trailing slash.) Or deploy from the CLI with `npx vercel` / `npx vercel --prod`.

### Other hosts

Every page route prerenders to static HTML, but the `/api/subscribe` route is a server-rendered
function, so the app needs a Node host (not a static-only one) for the newsletter to work. Outside
Vercel, set `NEXT_PUBLIC_SITE_URL` to your real URL (it defaults to `http://localhost:3000/`) and
provide `POSTGRES_URL` yourself if you want sign-ups. To rate-limit the endpoint, also set
`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from any Upstash Redis database.
