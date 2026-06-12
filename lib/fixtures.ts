import { sql } from "@vercel/postgres";
import { flagFor, type LiveMatch } from "@/lib/scores";

// Vercel Postgres data layer for finished matches. Once a match is FINISHED
// its result never changes, so each one is written here exactly once, keyed by
// the upstream football-data.org match id (every FIFA match has a stable
// serial). Reads come back in tournament order (kickoff time, then id).
//
// All functions degrade to a no-op / empty list when POSTGRES_URL is unset
// (local dev without a database), mirroring how lib/redis.ts degrades.

function hasDb(): boolean {
  return !!process.env.POSTGRES_URL;
}

// Create the table on first use so a fresh database needs no migration step
// (same lazy pattern as lib/subscribers.ts). `grp` not `group` — reserved word.
let ensured: Promise<void> | null = null;
function ensureTable() {
  if (!ensured) {
    ensured = sql`
      CREATE TABLE IF NOT EXISTS fixtures (
        id         INTEGER PRIMARY KEY,
        utc_date   TIMESTAMPTZ NOT NULL,
        status     TEXT NOT NULL,
        home       TEXT NOT NULL,
        away       TEXT NOT NULL,
        home_score INTEGER,
        away_score INTEGER,
        grp        TEXT,
        stage      TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return ensured;
}

interface FixtureRow {
  id: number;
  utc_date: string | Date;
  status: string;
  home: string;
  away: string;
  home_score: number | null;
  away_score: number | null;
  grp: string | null;
  stage: string | null;
}

// Rebuild the LiveMatch shape the API serves. Flags are derived from team
// names (lib/scores.ts owns that mapping) rather than stored; a finished match
// is by definition not live.
function rowToMatch(r: FixtureRow): LiveMatch {
  return {
    id: r.id,
    status: r.status,
    utcDate: new Date(r.utc_date).toISOString(),
    home: r.home,
    away: r.away,
    homeFlag: flagFor(r.home),
    awayFlag: flagFor(r.away),
    homeScore: r.home_score,
    awayScore: r.away_score,
    isLive: false,
    group: r.grp,
    stage: r.stage,
  };
}

// Persist any finished matches not already stored. Results are immutable, so
// rows already present are left untouched — one SELECT to diff, then one
// INSERT per genuinely new result (a handful per matchday at most).
export async function saveFinished(matches: LiveMatch[]): Promise<void> {
  if (!hasDb() || matches.length === 0) return;
  await ensureTable();
  const { rows } = await sql<{ id: number }>`SELECT id FROM fixtures`;
  const have = new Set(rows.map((r) => r.id));
  for (const m of matches) {
    if (have.has(m.id)) continue;
    await sql`
      INSERT INTO fixtures (id, utc_date, status, home, away, home_score, away_score, grp, stage)
      VALUES (${m.id}, ${m.utcDate}, ${m.status}, ${m.home}, ${m.away},
              ${m.homeScore}, ${m.awayScore}, ${m.group}, ${m.stage})
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

// Every stored result, in tournament order.
export async function getFinishedFromDb(): Promise<LiveMatch[]> {
  if (!hasDb()) return [];
  await ensureTable();
  const { rows } = await sql<FixtureRow>`
    SELECT id, utc_date, status, home, away, home_score, away_score, grp, stage
    FROM fixtures
    ORDER BY utc_date, id
  `;
  return rows.map(rowToMatch);
}
