import { sql } from "@vercel/postgres";
import { flagFor, type LiveMatch } from "@/lib/scores";

// Vercel Postgres data layer for the fixtures table, keyed by the upstream
// football-data.org match id (every FIFA match has a stable serial). The table
// may hold the full confirmed schedule (rows seeded with their upstream
// status, e.g. TIMED), but only FINISHED/AWARDED rows are ever read back —
// a result is immutable once the final whistle goes, so each one is upserted
// exactly once when the match finishes. Reads come back in tournament order
// (kickoff time, then id).
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

// Persist any results not already stored as finished. The diff is against the
// rows already FINISHED — a pre-seeded schedule row (status TIMED) doesn't
// count, so the upsert overwrites it with the result the first time the match
// shows up finished; after that it's never touched again. One SELECT to diff,
// then one upsert per genuinely new result (a handful per matchday at most).
export async function saveFinished(matches: LiveMatch[]): Promise<void> {
  if (!hasDb() || matches.length === 0) return;
  await ensureTable();
  const { rows } = await sql<{ id: number }>`
    SELECT id FROM fixtures WHERE status IN ('FINISHED', 'AWARDED')
  `;
  const have = new Set(rows.map((r) => r.id));
  for (const m of matches) {
    if (have.has(m.id)) continue;
    await sql`
      INSERT INTO fixtures (id, utc_date, status, home, away, home_score, away_score, grp, stage)
      VALUES (${m.id}, ${m.utcDate}, ${m.status}, ${m.home}, ${m.away},
              ${m.homeScore}, ${m.awayScore}, ${m.group}, ${m.stage})
      ON CONFLICT (id) DO UPDATE SET
        utc_date   = EXCLUDED.utc_date,
        status     = EXCLUDED.status,
        home       = EXCLUDED.home,
        away       = EXCLUDED.away,
        home_score = EXCLUDED.home_score,
        away_score = EXCLUDED.away_score,
        grp        = EXCLUDED.grp,
        stage      = EXCLUDED.stage
    `;
  }
}

// Every stored result, in tournament order. Schedule rows seeded ahead of
// time (not yet finished) are deliberately excluded — the live schedule comes
// from the Redis snapshot, and serving these would duplicate it.
export async function getFinishedFromDb(): Promise<LiveMatch[]> {
  if (!hasDb()) return [];
  await ensureTable();
  const { rows } = await sql<FixtureRow>`
    SELECT id, utc_date, status, home, away, home_score, away_score, grp, stage
    FROM fixtures
    WHERE status IN ('FINISHED', 'AWARDED')
    ORDER BY utc_date, id
  `;
  return rows.map(rowToMatch);
}
