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
