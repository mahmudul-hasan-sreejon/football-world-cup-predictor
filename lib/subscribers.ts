import { sql } from "@vercel/postgres";

// Data model for newsletter sign-ups captured after a user crowns a champion.
// Persisted in Vercel Postgres; the `sql` tag reads POSTGRES_URL from the env.
export type Subscriber = {
  email: string;
  champion: string | null;
  createdAt: string;
};

// Create the table on first use so a fresh database needs no migration step.
let ensured: Promise<void> | null = null;
function ensureTable() {
  if (!ensured) {
    ensured = sql`
      CREATE TABLE IF NOT EXISTS subscribers (
        id         SERIAL PRIMARY KEY,
        email      TEXT NOT NULL UNIQUE,
        champion   TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return ensured;
}

// Upsert a subscriber. Re-subscribing with the same email refreshes their
// last predicted champion rather than erroring on the unique constraint.
export async function addSubscriber(
  email: string,
  champion: string | null,
): Promise<void> {
  await ensureTable();
  await sql`
    INSERT INTO subscribers (email, champion)
    VALUES (${email}, ${champion})
    ON CONFLICT (email) DO UPDATE SET champion = EXCLUDED.champion
  `;
}
