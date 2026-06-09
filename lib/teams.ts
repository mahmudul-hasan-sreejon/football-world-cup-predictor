// Static tournament data: the 48 teams by group, plus the indexes derived from
// them (GROUPS, BYID, TEAM_NAMES). No React/DOM. The bracket model and logic
// live in `bracket.ts`, which re-exports these so `@/lib/bracket` stays the
// single public entry point for the domain layer.
import type { Team } from "./bracket";

export const TEAMS: Record<string, [string, string, number][]> = {
  A: [
    ["Mexico", "🇲🇽", 78],
    ["South Africa", "🇿🇦", 68],
    ["South Korea", "🇰🇷", 76],
    ["Czechia", "🇨🇿", 73],
  ],
  B: [
    ["Canada", "🇨🇦", 74],
    ["Bosnia & Herzegovina", "🇧🇦", 71],
    ["Qatar", "🇶🇦", 69],
    ["Switzerland", "🇨🇭", 80],
  ],
  C: [
    ["Brazil", "🇧🇷", 90],
    ["Morocco", "🇲🇦", 83],
    ["Haiti", "🇭🇹", 58],
    ["Scotland", "🏴󠁧󠁢󠁳󠁣󠁴󠁿", 72],
  ],
  D: [
    ["United States", "🇺🇸", 78],
    ["Paraguay", "🇵🇾", 72],
    ["Australia", "🇦🇺", 74],
    ["Türkiye", "🇹🇷", 79],
  ],
  E: [
    ["Germany", "🇩🇪", 86],
    ["Curaçao", "🇨🇼", 59],
    ["Ivory Coast", "🇨🇮", 74],
    ["Ecuador", "🇪🇨", 77],
  ],
  F: [
    ["Netherlands", "🇳🇱", 88],
    ["Japan", "🇯🇵", 79],
    ["Sweden", "🇸🇪", 74],
    ["Tunisia", "🇹🇳", 71],
  ],
  G: [
    ["Belgium", "🇧🇪", 85],
    ["Egypt", "🇪🇬", 74],
    ["Iran", "🇮🇷", 76],
    ["New Zealand", "🇳🇿", 63],
  ],
  H: [
    ["Spain", "🇪🇸", 95],
    ["Cape Verde", "🇨🇻", 64],
    ["Saudi Arabia", "🇸🇦", 69],
    ["Uruguay", "🇺🇾", 84],
  ],
  I: [
    ["France", "🇫🇷", 93],
    ["Senegal", "🇸🇳", 80],
    ["Iraq", "🇮🇶", 67],
    ["Norway", "🇳🇴", 80],
  ],
  J: [
    ["Argentina", "🇦🇷", 94],
    ["Algeria", "🇩🇿", 74],
    ["Austria", "🇦🇹", 77],
    ["Jordan", "🇯🇴", 66],
  ],
  K: [
    ["Portugal", "🇵🇹", 90],
    ["Congo DR", "🇨🇩", 70],
    ["Uzbekistan", "🇺🇿", 68],
    ["Colombia", "🇨🇴", 83],
  ],
  L: [
    ["England", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 92],
    ["Croatia", "🇭🇷", 82],
    ["Ghana", "🇬🇭", 72],
    ["Panama", "🇵🇦", 67],
  ],
};
export const GROUPS: string[] = Object.keys(TEAMS);
export const BYID: Record<string, Team> = {};
GROUPS.forEach((g) =>
  TEAMS[g].forEach((t, i) => {
    const id = g + i;
    BYID[id] = { id, group: g, name: t[0], flag: t[1], rating: t[2] };
  }),
);

// Every valid team name, used to validate the `champion` accepted by the
// subscribe API so an untrusted client can only store one of these bounded
// values (or null) rather than arbitrary free text.
export const TEAM_NAMES: ReadonlySet<string> = new Set(
  GROUPS.flatMap((g) => TEAMS[g].map((t) => t[0])),
);
