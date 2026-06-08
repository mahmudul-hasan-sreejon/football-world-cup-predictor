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

// Insert a subscriber. The `email` column is UNIQUE, so a repeat sign-up can't
// create a duplicate row. `ON CONFLICT DO NOTHING` makes that a no-op instead of
// an error; the `RETURNING` row is present only when a new row was inserted, so
// the boolean tells the caller whether this was a fresh sign-up (true) or an
// already-subscribed email (false).
export async function addSubscriber(
  email: string,
  champion: string | null,
  tournament: string,
): Promise<boolean> {
  await ensureTable();
  const { rows } = await sql`
    INSERT INTO subscribers (email, champion, tournament)
    VALUES (${email}, ${champion}, ${tournament})
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `;
  return rows.length > 0;
}
