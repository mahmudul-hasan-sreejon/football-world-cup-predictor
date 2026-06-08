# World Cup 2026 Bracket Predictor

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

Both environment variables are optional. Copy the template and adjust as needed:

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

`.env.local` is gitignored; `.env.example` is the committed reference.

## Project structure

- `app/layout.tsx` — root layout, SEO metadata, fonts, JSON-LD, no-flash theme script
- `app/page.tsx` — static hero/footer, mounts the predictor
- `app/predictor.tsx` — client component holding all interactive state and rendering
- `app/confetti.ts` — dependency-free canvas confetti burst for the champion celebration
- `app/api/subscribe/route.ts` — POST endpoint that validates an email and upserts a subscriber
- `app/globals.css` — global styles
- `app/icon.svg` — favicon (served as `/icon.svg`)
- `app/opengraph-image.tsx` — dynamically generated 1200×630 social-share image (`next/og`)
- `app/robots.ts` / `app/sitemap.ts` — generated `robots.txt` and `sitemap.xml`
- `lib/bracket.ts` — tournament data + types + pure bracket logic (Annex C seeding, resolve/validate)
- `lib/subscribers.ts` — Vercel Postgres data layer for newsletter sign-ups (upsert + table bootstrap)
- `lib/site.ts` — resolves the canonical site URL (shared by layout, robots, and sitemap)
- `lib/utils.ts` — `cn()` class-name helper (clsx + tailwind-merge)
- `components/ui/` — shadcn/ui primitives (button, card, dialog, tabs, sonner toaster)

## Deployment

### Vercel (recommended)

Push this repo to GitHub/GitLab/Bitbucket and import it at [vercel.com/new](https://vercel.com/new).
Vercel auto-detects Next.js — no build settings needed. The canonical URL (and the OG image,
`robots.txt`, and `sitemap.xml` derived from it) fills in automatically from Vercel's
`VERCEL_PROJECT_PRODUCTION_URL`; see `lib/site.ts` for the resolution order.

When you attach a custom domain, set an environment variable so SEO metadata uses it:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com/
```

(Note the trailing slash.) Or deploy from the CLI with `npx vercel` / `npx vercel --prod`.

### Other hosts

`next build` produces a fully static site (every route prerenders), so it can also be hosted on any
static or Node host. Outside Vercel, set `NEXT_PUBLIC_SITE_URL` to your real URL; it defaults to
`http://localhost:3000/`.
