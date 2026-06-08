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

## Project structure

- `app/layout.tsx` — root layout, SEO metadata, fonts, JSON-LD, no-flash theme script
- `app/page.tsx` — static hero/footer, mounts the predictor
- `app/predictor.tsx` — client component holding all interactive state and rendering
- `app/globals.css` — global styles
- `lib/bracket.ts` — tournament data + types + pure bracket logic (Annex C seeding, resolve/validate)

> The original static `index.html` and `assets/` files are superseded by the Next.js app and can
> be removed.
