import { TEAMS } from "@/lib/bracket";

// Live/just-finished score for a single fixture, normalised from the upstream
// football-data.org match object into just what the banner needs. No React/DOM.
export interface LiveMatch {
  id: number;
  status: string; // upstream status: SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED | ...
  utcDate: string; // ISO kickoff time
  home: string;
  away: string;
  homeFlag: string | null; // our emoji flag when the team is one we know
  awayFlag: string | null;
  homeScore: number | null; // null until the match has started
  awayScore: number | null;
  isLive: boolean; // true while the ball is in play
  group: string | null; // group letter (e.g. "H") for group-stage ties, else null
  stage: string | null; // upstream stage id (e.g. "LAST_32"); null when unknown
}

// In-play statuses where a live score is meaningful and we want to poll faster.
const LIVE_STATUSES = new Set(["IN_PLAY", "PAUSED"]);
const DONE_STATUSES = new Set(["FINISHED", "AWARDED"]);

// Short badge for a match's state, as shown on each card: LIVE / FT / SOON.
export function statusLabel(m: LiveMatch): "LIVE" | "FT" | "SOON" {
  if (m.isLive) return "LIVE";
  if (isFinished(m)) return "FT";
  return "SOON";
}

// A finished match's result is immutable — these are the rows worth persisting
// to the fixtures table and serving from cache/DB instead of the upstream API.
export function isFinished(m: LiveMatch): boolean {
  return DONE_STATUSES.has(m.status);
}

// How long after kickoff a match could still plausibly be in play. Knockout
// ties can run ~3h from kickoff (ET + penalties + breaks); the extra slack
// covers delayed kickoffs without keeping the API polling all day.
const MATCH_WINDOW_MS = 3.5 * 60 * 60 * 1000;

// True when some match may be in play right now, judged from a (possibly
// stale) snapshot: either the snapshot already says it's live, or its kickoff
// has passed, it isn't finished, and we're still inside the match window.
// This is the gate for calling the upstream API at all — outside it, finished
// results come from cache/DB and upcoming fixtures from the snapshot. `now`
// is passed in (never read here) so this stays pure and testable.
export function anyPotentiallyLive(matches: LiveMatch[], now: string): boolean {
  const t = new Date(now).getTime();
  return matches.some((m) => {
    if (isFinished(m)) return false;
    if (m.isLive) return true;
    if (!m.utcDate) return false;
    const kickoff = new Date(m.utcDate).getTime();
    return t >= kickoff && t <= kickoff + MATCH_WINDOW_MS;
  });
}

// Short round tag for a fixture row. Group games are tagged with their group
// letter instead, so only the knockout stages are mapped; null for the group
// stage, unknown ids, and cached payloads that predate the `stage` field.
const STAGE_TAGS: Record<string, string> = {
  LAST_32: "R32",
  LAST_16: "R16",
  QUARTER_FINALS: "QF",
  SEMI_FINALS: "SF",
  THIRD_PLACE: "3rd",
  FINAL: "Final",
};
export function stageTag(stage: string | null): string | null {
  return stage ? (STAGE_TAGS[stage] ?? null) : null;
}

// Flag emoji by lowercased team name, derived from our own tournament data so a
// matched team renders with the same flag the bracket uses.
const FLAG_BY_NAME: Record<string, string> = {};
for (const g of Object.keys(TEAMS)) {
  for (const [name, flag] of TEAMS[g]) FLAG_BY_NAME[name.toLowerCase()] = flag;
}

// Reconcile upstream team names with ours. football-data.org uses different
// spellings for some nations; map the upstream name (lowercased) to our name so
// the flag lookup hits. Extend as mismatches surface against real data.
const NAME_ALIASES: Record<string, string> = {
  usa: "United States",
  "united states of america": "United States",
  "korea republic": "South Korea",
  "ir iran": "Iran",
  "côte d'ivoire": "Ivory Coast",
  "cote d'ivoire": "Ivory Coast",
  turkey: "Türkiye",
  turkiye: "Türkiye",
  "dr congo": "Congo DR",
  "congo dr": "Congo DR",
  "czech republic": "Czechia",
  "bosnia-herzegovina": "Bosnia & Herzegovina",
  "bosnia and herzegovina": "Bosnia & Herzegovina",
  "cape verde islands": "Cape Verde",
};

function canonicalName(raw: string): string {
  return NAME_ALIASES[raw.trim().toLowerCase()] ?? raw.trim();
}

// Exported for lib/fixtures.ts, which rebuilds LiveMatch objects from DB rows
// (flags are derived from team names, so they're recomputed, not stored).
export function flagFor(name: string): string | null {
  return FLAG_BY_NAME[name.toLowerCase()] ?? null;
}

// Shape of the bits we read off an upstream match. Everything is optional/loose
// because it's untrusted JSON from the network.
interface RawMatch {
  id?: number;
  utcDate?: string;
  status?: string;
  homeTeam?: { name?: string };
  awayTeam?: { name?: string };
  score?: { fullTime?: { home?: number | null; away?: number | null } };
  group?: string; // e.g. "GROUP_A" during the group stage, null in the knockouts
  stage?: string; // e.g. "GROUP_STAGE", "LAST_32", ..., "FINAL"
}

// "GROUP_A" -> "A"; anything else (knockout ties) -> null.
function groupLetter(raw?: string): string | null {
  const m = /^GROUP_([A-L])$/.exec(raw ?? "");
  return m ? m[1] : null;
}

function normalise(m: RawMatch): LiveMatch | null {
  if (typeof m.id !== "number" || !m.homeTeam?.name || !m.awayTeam?.name) {
    return null;
  }
  const home = canonicalName(m.homeTeam.name);
  const away = canonicalName(m.awayTeam.name);
  const ft = m.score?.fullTime ?? {};
  return {
    id: m.id,
    status: m.status ?? "SCHEDULED",
    utcDate: m.utcDate ?? "",
    home,
    away,
    homeFlag: flagFor(home),
    awayFlag: flagFor(away),
    homeScore: typeof ft.home === "number" ? ft.home : null,
    awayScore: typeof ft.away === "number" ? ft.away : null,
    isLive: LIVE_STATUSES.has(m.status ?? ""),
    group: groupLetter(m.group),
    stage: m.stage ?? null,
  };
}

// Fetch every World Cup match (scores + statuses) in a single upstream call.
// Returns [] when the API key is unset (local dev); THROWS when the request
// fails, so the caller can tell "upstream is down" apart from a genuinely
// empty fixture list and avoid caching a failure as real data.
export async function fetchUpstreamMatches(): Promise<LiveMatch[]> {
  const key = process.env.FOOTBALL_API_KEY;
  if (!key) return [];
  const res = await fetch(
    "https://api.football-data.org/v4/competitions/WC/matches",
    {
      headers: { "X-Auth-Token": key },
      cache: "no-store",
      // A hung upstream call would otherwise hold the refresh lock for its
      // full TTL while every client waits on an empty cache.
      signal: AbortSignal.timeout(8_000),
    },
  );
  if (!res.ok) {
    throw new Error(`football-data.org returned ${res.status}`);
  }
  const data: { matches?: RawMatch[] } = await res.json();
  return (data.matches ?? [])
    .map(normalise)
    .filter((m): m is LiveMatch => m !== null);
}

// Stand-in feed used when no FOOTBALL_API_KEY is configured (local dev, previews)
// so the section still renders fully — a mix of live, upcoming and finished
// fixtures. The UI flags this as a "demo feed" so it's never mistaken for real
// results. All teams are real group-mates so flags and group labels resolve.
export function demoMatches(): LiveMatch[] {
  const mk = (
    id: number,
    home: string,
    away: string,
    homeScore: number | null,
    awayScore: number | null,
    status: string,
    group: string,
    utcDate: string,
  ): LiveMatch => ({
    id,
    status,
    utcDate,
    home,
    away,
    homeFlag: flagFor(home),
    awayFlag: flagFor(away),
    homeScore,
    awayScore,
    isLive: LIVE_STATUSES.has(status),
    group,
    stage: "GROUP_STAGE", // every demo fixture is a group game
  });
  return [
    mk(9001, "Spain", "Uruguay", 1, 1, "IN_PLAY", "H", "2026-06-25T16:00:00Z"),
    mk(9002, "Germany", "Ecuador", 0, 1, "IN_PLAY", "E", "2026-06-25T19:00:00Z"),
    mk(9003, "France", "Norway", null, null, "TIMED", "I", "2026-06-26T19:00:00Z"),
    mk(9004, "Brazil", "Scotland", 3, 0, "FINISHED", "C", "2026-06-24T19:00:00Z"),
    mk(9005, "Argentina", "Jordan", 2, 0, "FINISHED", "J", "2026-06-24T22:00:00Z"),
  ];
}

// The matches worth showing in the banner: anything in play, or kicking off
// within the look-ahead window — today through `days` days from now (inclusive,
// UTC calendar days). `now` is passed in (never read here) so this stays pure
// and testable.
export function upcomingOrLive(
  matches: LiveMatch[],
  now: string,
  days = 3,
): LiveMatch[] {
  const today = now.slice(0, 10); // YYYY-MM-DD
  const horizon = new Date(now);
  horizon.setUTCDate(horizon.getUTCDate() + days);
  const cutoff = horizon.toISOString().slice(0, 10);
  return matches.filter((m) => {
    if (m.isLive) return true;
    if (!m.utcDate) return false;
    const day = m.utcDate.slice(0, 10);
    return day >= today && day <= cutoff; // lexicographic works for YYYY-MM-DD
  });
}
