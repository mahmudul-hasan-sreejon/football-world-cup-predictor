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

Picks live in memory only (no persistence) — use **Copy summary** to export your bracket as text.
The theme preference is the one thing saved, in `localStorage` under `wc26-theme`.

## Project structure

- `app/layout.tsx` — root layout, SEO metadata, fonts, JSON-LD, no-flash theme script
- `app/page.tsx` — static hero/footer, mounts the predictor
- `app/predictor.tsx` — client component holding all interactive state and rendering
- `app/globals.css` — global styles
- `lib/bracket.ts` — tournament data + types + pure bracket logic (Annex C seeding, resolve/validate)

## Deployment

### Vercel (recommended)

Push this repo to GitHub/GitLab/Bitbucket and import it at [vercel.com/new](https://vercel.com/new).
Vercel auto-detects Next.js — no build settings needed. The canonical/OG URLs in `app/layout.tsx`
fill in automatically from Vercel's `VERCEL_PROJECT_PRODUCTION_URL`.

When you attach a custom domain, set an environment variable so SEO metadata uses it:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com/
```

(Note the trailing slash.) Or deploy from the CLI with `npx vercel` / `npx vercel --prod`.

### Other hosts

`next build` produces a fully static site (every route prerenders), so it can also be hosted on any
static or Node host. Outside Vercel, set `NEXT_PUBLIC_SITE_URL` to your real URL; it defaults to
`http://localhost:3000/`.
