import { sql } from "@vercel/postgres";
import { TOURNAMENT } from "@/lib/site";

// Data model for newsletter sign-ups captured after a user crowns a champion.
// Persisted in Vercel Postgres; the `sql` tag reads POSTGRES_URL from the env.
export type Subscriber = {
  email: string;
  champion: string | null;
  tournament: string;
  createdAt: string;
};

// Create the table on first use so a fresh database needs no migration step.
// The follow-up ALTER backfills `tournament` on databases created before that
// column existed, keeping older deployments migration-free too.
let ensured: Promise<void> | null = null;
function ensureTable() {
  if (!ensured) {
    ensured = sql`
      CREATE TABLE IF NOT EXISTS subscribers (
        id         SERIAL PRIMARY KEY,
        email      TEXT NOT NULL UNIQUE,
        champion   TEXT,
        tournament TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `
      // Backfill `tournament` on pre-existing tables: add it nullable, fill in
      // legacy rows, then enforce NOT NULL. New rows always supply the value.
      .then(() => sql`ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS tournament TEXT`)
      .then(
        () =>
          sql`UPDATE subscribers SET tournament = ${TOURNAMENT} WHERE tournament IS NULL`,
      )
      .then(() => sql`ALTER TABLE subscribers ALTER COLUMN tournament SET NOT NULL`)
      .then(() => undefined);
  }
  return ensured;
}

// Upsert a subscriber. Re-subscribing with the same email refreshes their
// last predicted champion rather than erroring on the unique constraint.
export async function addSubscriber(
  email: string,
  champion: string | null,
  tournament: string,
): Promise<void> {
  await ensureTable();
  await sql`
    INSERT INTO subscribers (email, champion, tournament)
    VALUES (${email}, ${champion}, ${tournament})
    ON CONFLICT (email) DO UPDATE SET
      champion = EXCLUDED.champion,
      tournament = EXCLUDED.tournament
  `;
}
