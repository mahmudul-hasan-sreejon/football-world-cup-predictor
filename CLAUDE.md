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

- **`lib/bracket.ts`** — the domain layer. Holds the static tournament data (`TEAMS`, `ANNEX` —
  the 495-combination Annex C table, bracket structures `R32`/`R16`/`QF`/`SF`/`FINAL`/`THIRDM`),
  the typed model (`Team`, `Slot`, `Match`, `Round`, `State`), and **pure** functions that take a
  `State` (`{ order, thirds, picks }`) and compute results — `resolve`, `validatePicks`,
  `champion`, etc. No React or DOM here.
- **`app/predictor.tsx`** — the only client component (`'use client'`). Owns all interactive state
  (`order`, `thirds`, `picks`, `stage`, `theme`) via `useState` and renders the three stages, nav,
  and toast. Delegates all bracket math to `lib/bracket.ts`.
- **`app/page.tsx`** — server component: static hero/footer, mounts `<Predictor />`.
- **`app/layout.tsx`** — SEO via the Metadata API, Google Fonts, JSON-LD, and a no-flash inline
  theme script. `<html>`/`<body>` use `suppressHydrationWarning` because that script mutates the
  class before hydration.
- **`app/globals.css`** — global styles; theming is driven by a `light` class on `<html>`.
- **`app/confetti.ts`** — dependency-free canvas confetti (`fireConfetti()`); client-only, self-cleans
  the canvas, and no-ops under `prefers-reduced-motion`. Fired from `predictor.tsx` on champion.
- **`app/api/subscribe/route.ts`** — `POST` handler and the abuse boundary for this public
  endpoint. In order: rejects oversized bodies (413), rate-limits per IP (429), drops honeypot
  hits (the hidden `website` field) as silent fake-success, caps/validates the email, and coerces
  `champion` to a known `TEAM_NAMES` value or `null`. Only then calls `addSubscriber()`.
- **`lib/rate-limit.ts`** — durable per-IP limiter (`allowSubscribe()`) backed by Upstash Redis
  (5 sign-ups / 10 min, sliding window). Reads `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN`; when unset (e.g. local dev) it allows every request so the app runs
  without an Upstash account.
- **`lib/subscribers.ts`** — Vercel Postgres data layer. `addSubscriber()` upserts on the unique
  `email` (refreshing `champion`), and lazily runs `CREATE TABLE IF NOT EXISTS` on first call, so a
  fresh DB needs no migration. Reads `POSTGRES_URL` from the env via `@vercel/postgres`.
- **`components/ui/`** — shadcn/ui primitives (button, card, dialog, tabs, sonner). `lib/utils.ts`
  holds the `cn()` helper (clsx + tailwind-merge); component config lives in `components.json`.
- **`lib/site.ts`** — resolves the canonical `SITE_URL` once (env: `NEXT_PUBLIC_SITE_URL` →
  `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → `localhost`). Imported by `layout.tsx`,
  `robots.ts`, and `sitemap.ts` — change the resolution logic here, not in those consumers.
- **File-based metadata** — `app/icon.svg` (favicon), `app/opengraph-image.tsx` (dynamic OG image
  via `next/og`; auto-populates `og:image`/`twitter:image`, so don't also set them in `layout.tsx`),
  `app/robots.ts`, and `app/sitemap.ts`. Next wires these into `<head>` / serves them by convention.

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
