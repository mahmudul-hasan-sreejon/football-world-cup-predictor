# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Interactive FIFA World Cup 2026 bracket predictor. A Next.js (App Router) + TypeScript app where
the user ranks the 12 groups, picks the 8 best third-placed teams, and plays out the knockout stage
using FIFA's official Annex C seeding.

## Commands

- `npm run dev` — dev server (`http://localhost:3000`)
- `npm run build` — production build (also runs type checking)
- `npm run start` — serve the production build
- `npm run lint` — lint

There are no automated tests; verify changes by running `npm run build` (type check) and the app.

## Architecture

- **`lib/bracket.ts`** — the domain layer's public entry point. Holds the typed model (`Team`,
  `Slot`, `Match`, `Round`, `State`), the bracket structures (`R32`/`R16`/`QF`/`SF`/`FINAL`/`THIRDM`),
  and the **pure** functions that take a `State` (`{ order, thirds, picks }`) and compute results —
  `resolve`, `validatePicks`, `champion`, etc. No React or DOM. The two large static tables live in
  sibling modules and are **re-exported** here, so `@/lib/bracket` stays the single import site:
  `lib/annex.ts` (`ANNEX` — the 495-combination Annex C table — and `COL`) and `lib/teams.ts`
  (`TEAMS` plus the `GROUPS`/`BYID`/`TEAM_NAMES` indexes derived from it).
- **`components/predictor/`** — the interactive UI, split into one stateful container plus
  presentational pieces and hooks (all `'use client'` via the container/hook boundary):
  - `predictor.tsx` — the container (default export, mounted by `page.tsx`). Owns all interactive
    state (`order`, `thirds`, `picks`, `stage`, subscription, `mounted`) and every state mutation
    (`applyState`, `clickTeam`, `toggleThird`, `clickSlot`, `autoPick`, `resetAll`, `subscribe`),
    delegating bracket math to `lib/bracket.ts` and passing data + callbacks down to the stages.
  - `nav.tsx`, `live-banner.tsx`, `groups-stage.tsx`, `thirds-stage.tsx`, `knockout-stage.tsx`,
    `subscribe-dialog.tsx` — presentational components; each stage renders its own `<TabsContent>`.
  - `predictor-skeleton.tsx` — the whole-page loading state the container renders while `mounted`
    is false. It reuses the real layout classes (`.livewrap`/`.bar`/`.groups`/…) filled with
    `<Skeleton>` blocks, so the server render and the pre-hydration client render match (no pop-in).
  - Theme state lives outside the predictor in `components/use-theme.ts` (see `site-nav.tsx`
    below); the container still calls it, but only to keep the Toaster's `theme` in sync. The
    `/api/scores` poller likewise lives at `components/use-live-scores.ts`, shared with the
    fixtures list.
  - `ad-slot.tsx` — a reusable `<AdSlot id src>` for a single Adsterra ad unit (e.g. a Native
    Banner). Loads Adsterra's `invoke.js` via `next/script` (`afterInteractive`) and renders the
    matching `container-<id>` div; the script injects the ad client-side, outside React's tree, so
    server and client both render an empty container (no hydration mismatch). The `.adslot` wrapper
    reserves a `min-height` to avoid layout shift while the ad loads. Adsterra serves nothing on
    `localhost`/unapproved domains, so the slot is empty in dev — verify on the live domain.
- **`app/page.tsx`** — server component: static hero/footer, mounts `<Predictor />` from
  `@/components/predictor/predictor`, and renders an `<AdSlot />` (native banner) above the footer.
  Between the data note and the ad it renders two static, crawlable sections — the 12-group/48-team
  summary (from `TEAMS`/`GROUPS` via `@/lib/bracket`) and the FAQ (from `lib/faq.ts`). These are
  the page's indexable copy: the predictor itself is client-only (the server renders only its
  skeleton). Styled by `app/styles/seo.css`. Between them sits the `#fixture` section: a
  server-rendered heading plus **`components/fixture-list.tsx`** (client), the full tournament
  schedule grouped by local calendar day. It reuses `useLiveScores` — the `/api/scores` payload
  carries every match, not just upcoming ones — so scores/statuses update in place; rows are
  tagged `Grp X` for group games or via `stageTag()` for knockout rounds. Pre-data it renders a
  skeleton day (also what the server sends, so locale date formatting never hits hydration).
  Styled by `app/styles/fixtures.css`.
- **`components/site-nav.tsx`** — the sticky top navbar (server component, rendered by
  `layout.tsx` above `children`): favicon + site name plus anchor links to the index sections —
  `#live` (live banner), `#prediction` (the predictor's `Tabs` root; the skeleton mirrors the id
  on a plain div), `#groups` (groups summary), `#fixture` (the tournament schedule), `#faq`. Also
  hosts the theme toggle
  (`components/theme-toggle.tsx`, the navbar's one client island), backed by
  `components/use-theme.ts` — theme state + the view-transition toggle. The hook is mounted twice
  (toggle + the predictor's Toaster), so commits are broadcast via a window event to keep both
  instances in sync. Styled mobile-first by `app/styles/topnav.css`: the base styles give phones a
  static two-row bar (brand + theme toggle, then the menu as a full-width swipe strip); from 600px
  `responsive.css` collapses it to a single sticky row, raises the anchors' `scroll-margin-top` by
  `--topnav-h`, and offsets the sticky stage `.bar` to sit below it.
- **`app/layout.tsx`** — SEO via the Metadata API (title template, keywords, author/publisher,
  `googleBot` directives, Open Graph, Twitter), Google Fonts, a no-flash inline theme script, and
  a JSON-LD `@graph` bundling `WebApplication` + `SportsEvent` + `FAQPage`. The FAQ entries live in
  **`lib/faq.ts`**, shared with the visible FAQ section in `page.tsx`, so the structured data and
  the on-page copy stay in sync by construction (Google only honors FAQ markup whose copy is
  visible on the page). `<html>`/`<body>` use
  `suppressHydrationWarning` because that script mutates the class before hydration.
- **`app/globals.css`** — the stylesheet entry point: the Tailwind theme/utilities imports followed
  by `@import "./styles/*.css"`. The bespoke rules are **unlayered**, so cascade order is import
  order — keep the `@import` sequence intact, and keep `theme-light.css`/`glass.css`/`glass-light.css`
  last so they override the base look. The partials under **`app/styles/`** are split by concern
  (`base`, `topnav`, `header`, `live-scores`, `nav`, `stage`, `groups`, `thirds`, `champion`, `modal`,
  `bracket`, `footer`, `seo`, `fixtures`, `adslot`, `skeleton`, `responsive`, plus the theme/glass overrides). Theming is driven by a `light`
  class on `<html>`.
- **`app/confetti.ts`** — dependency-free canvas confetti (`fireConfetti()`); client-only, self-cleans
  the canvas, and no-ops under `prefers-reduced-motion`. Fired from `predictor.tsx` on champion.
- **`app/api/subscribe/route.ts`** — `POST` handler and the abuse boundary for this public
  endpoint. In order: rejects oversized bodies (413), rate-limits per IP (429), drops honeypot
  hits (the hidden `website` field) as silent fake-success, caps/validates the email, and coerces
  `champion` to a known `TEAM_NAMES` value or `null`. Only then calls `addSubscriber()`.
- **`app/api/scores/route.ts`** — `GET` handler the client polls for live scores. Serves
  `{ matches, demo, updatedAt }` from the Redis key `wc:matches` (45s TTL); every good payload is
  also written to `wc:matches:stale` (6h TTL) as the last-known-good copy. On a cold/expired
  cache, one request takes a short `wc:matches:lock` and refreshes upstream (stampede guard);
  concurrent losers serve the stale copy instantly, waiting briefly for the winner's write only
  when no stale copy exists yet. A failed refresh releases the lock (so the next poll retries
  immediately) and likewise serves stale. The truly-empty fallback — possible only on a cold start
  with nothing cached during an upstream failure — goes out with `Cache-Control: no-store`, so an
  empty payload is never edge-cached over real data; real payloads carry `s-maxage=30` to let
  Vercel's edge absorb bursts without invoking the function. The 45s TTL caps upstream calls
  regardless of traffic, keeping us under the free 10 req/min limit. When `FOOTBALL_API_KEY` is
  unset it returns `demoMatches()` with `demo: true` (uncached) so the section still renders;
  falls back to a direct fetch when `redis` is null but a key is present.
- **`lib/redis.ts`** — the shared Upstash Redis client (`redis`), reused by both the rate limiter
  and the live-scores cache. Reads `UPSTASH_REDIS_REST_URL`/`_TOKEN` (or the `KV_REST_API_*`
  Marketplace pair); exports `null` when unset so callers degrade gracefully (local dev).
- **`lib/rate-limit.ts`** — durable per-IP limiter (`allowSubscribe()`) backed by the shared
  `redis` client (5 sign-ups / 10 min, sliding window). When `redis` is null it allows every
  request so the app runs without an Upstash account.
- **`lib/scores.ts`** — live-score domain layer (no React). `fetchUpstreamMatches()` makes one
  call to football-data.org (`/v4/competitions/WC/matches`, auth via `FOOTBALL_API_KEY`) and
  normalizes each match into `LiveMatch`, mapping team names to our flags via a `NAME_ALIASES`
  table, and tags each with its `group` letter and (via `statusLabel`) a LIVE/SOON/FT badge.
  Returns `[]` when the key is unset and **throws** when the request fails or exceeds its 8s
  timeout, so the route's catch path skips the cache write instead of caching an empty list as
  real data; `demoMatches()` is the stand-in feed the route serves without a key. Each match also
  carries the upstream `stage` id (`stageTag()` maps it to a short knockout label for the
  fixtures list; null on cached payloads that predate the field).
  `upcomingOrLive(matches, now, days=3)` is the pure filter for "in
  play, or kicking off within the next `days` days". The `useLiveScores` hook
  (`components/predictor/use-live-scores.ts`) polls `/api/scores` (paused while the tab is hidden,
  fast cadence only while a match is live); an empty response never wipes scores already on screen —
  the hook keeps them and quick-retries a few times before resuming the regular cadence.
  `LiveBanner` renders the strip.
- **`lib/subscribers.ts`** — Vercel Postgres data layer. `addSubscriber()` inserts on the unique
  `email` with `ON CONFLICT DO NOTHING RETURNING id`, returning `true` for a fresh sign-up and
  `false` when the email already exists (the route turns `false` into a 409). It lazily runs
  `CREATE TABLE IF NOT EXISTS` on first call, so a fresh DB needs no migration. Reads `POSTGRES_URL`
  from the env via `@vercel/postgres`.
- **`components/ui/`** — shadcn/ui primitives (badge, button, card, dialog, input, tabs, sonner,
  skeleton).
  These wrappers are **structural only**: they delegate all visuals to the bespoke classes in
  `globals.css` rather than imposing shadcn's default Tailwind skin, so the liquid-glass look and
  both themes survive. `button`/`badge` use `cva` to map a `variant` to an existing class
  (`.btn`/`.mag`/`.ghost`/`.clr`; `.pill`/`.lc-badge`/`.lc-grp`/`.livehd-pill`); `card`/`input`/`tabs`
  just forward `className`, and `skeleton` prepends the `.skel` shimmer class (sized per instance via
  `className`/`style`). Prefer these primitives for new/changed UI — add a new one here when none
  fits, following the same delegate-to-CSS convention. `lib/utils.ts` holds the `cn()` helper (clsx +
  tailwind-merge); component config lives in `components.json`.
- **`lib/site.ts`** — resolves the canonical `SITE_URL` once (env: `NEXT_PUBLIC_SITE_URL` →
  `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → `localhost`). Imported by `layout.tsx`,
  `robots.ts`, and `sitemap.ts` — change the resolution logic here, not in those consumers.
- **File-based metadata** — `app/icon.svg` (favicon), `app/opengraph-image.tsx` (dynamic OG image
  via `next/og`; auto-populates `og:image`/`twitter:image`, so don't also set them in `layout.tsx`),
  `app/manifest.ts` (PWA web manifest at `/manifest.webmanifest`, reusing `icon.svg`), `app/robots.ts`,
  and `app/sitemap.ts`. Next wires these into `<head>` / serves them by convention.

### Key invariants

- A `Slot` is a discriminated union on `t` (`w`/`ru`/`3w`/`mw`/`ml`). `resolve()` is recursive and
  the single source of truth for "who plays in this slot".
- After any mutation to `order` or `thirds`, run `validatePicks()` — it cascades, dropping knockout
  picks that are no longer reachable. `applyState()` in `predictor.tsx` does this centrally; new
  mutations should go through it rather than calling the setters directly.
- The path alias `@/` maps to the repo root (see `tsconfig.json`).

## Conventions

### Git Commits

Do not include `Co-Authored-By` lines in commit messages.
