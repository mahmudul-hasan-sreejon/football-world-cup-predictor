export interface Team {
  id: string;
  group: string;
  name: string;
  flag: string;
  rating: number;
}

export type Slot =
  | { t: "w"; g: string }
  | { t: "ru"; g: string }
  | { t: "3w"; wg: string }
  | { t: "mw"; m: number }
  | { t: "ml"; m: number };

export interface Match {
  id: number;
  a: Slot;
  b: Slot;
}

export interface Round {
  key: string;
  title: string;
  date: string;
  ms: Match[];
}

export interface State {
  order: Record<string, string[]>;
  thirds: Set<string>;
  picks: Record<number, string>;
}

// ---- Static tournament data ----
// The team table and the Annex C allocation table live in their own modules to
// keep this file focused on the model and logic; they are re-exported here so
// `@/lib/bracket` remains the single import site for the whole domain layer.
import { ANNEX, COL } from "./annex";
import { TEAMS, GROUPS, BYID, TEAM_NAMES } from "./teams";
export { ANNEX, COL, TEAMS, GROUPS, BYID, TEAM_NAMES };

// ---- Bracket structure (official) ----
export const R32: Match[] = [
  { id: 73, a: { t: "ru", g: "A" }, b: { t: "ru", g: "B" } },
  { id: 74, a: { t: "w", g: "E" }, b: { t: "3w", wg: "E" } },
  { id: 75, a: { t: "w", g: "F" }, b: { t: "ru", g: "C" } },
  { id: 76, a: { t: "w", g: "C" }, b: { t: "ru", g: "F" } },
  { id: 77, a: { t: "w", g: "I" }, b: { t: "3w", wg: "I" } },
  { id: 78, a: { t: "ru", g: "E" }, b: { t: "ru", g: "I" } },
  { id: 79, a: { t: "w", g: "A" }, b: { t: "3w", wg: "A" } },
  { id: 80, a: { t: "w", g: "L" }, b: { t: "3w", wg: "L" } },
  { id: 81, a: { t: "w", g: "D" }, b: { t: "3w", wg: "D" } },
  { id: 82, a: { t: "w", g: "G" }, b: { t: "3w", wg: "G" } },
  { id: 83, a: { t: "ru", g: "K" }, b: { t: "ru", g: "L" } },
  { id: 84, a: { t: "w", g: "H" }, b: { t: "ru", g: "J" } },
  { id: 85, a: { t: "w", g: "B" }, b: { t: "3w", wg: "B" } },
  { id: 86, a: { t: "w", g: "J" }, b: { t: "ru", g: "H" } },
  { id: 87, a: { t: "w", g: "K" }, b: { t: "3w", wg: "K" } },
  { id: 88, a: { t: "ru", g: "D" }, b: { t: "ru", g: "G" } },
];
export const R16: Match[] = [
  { id: 89, a: { t: "mw", m: 74 }, b: { t: "mw", m: 77 } },
  { id: 90, a: { t: "mw", m: 73 }, b: { t: "mw", m: 75 } },
  { id: 91, a: { t: "mw", m: 76 }, b: { t: "mw", m: 78 } },
  { id: 92, a: { t: "mw", m: 79 }, b: { t: "mw", m: 80 } },
  { id: 93, a: { t: "mw", m: 83 }, b: { t: "mw", m: 84 } },
  { id: 94, a: { t: "mw", m: 81 }, b: { t: "mw", m: 82 } },
  { id: 95, a: { t: "mw", m: 86 }, b: { t: "mw", m: 88 } },
  { id: 96, a: { t: "mw", m: 85 }, b: { t: "mw", m: 87 } },
];
export const QF: Match[] = [
  { id: 97, a: { t: "mw", m: 89 }, b: { t: "mw", m: 90 } },
  { id: 98, a: { t: "mw", m: 93 }, b: { t: "mw", m: 94 } },
  { id: 99, a: { t: "mw", m: 91 }, b: { t: "mw", m: 92 } },
  { id: 100, a: { t: "mw", m: 95 }, b: { t: "mw", m: 96 } },
];
export const SF: Match[] = [
  { id: 101, a: { t: "mw", m: 97 }, b: { t: "mw", m: 98 } },
  { id: 102, a: { t: "mw", m: 99 }, b: { t: "mw", m: 100 } },
];
export const FINAL: Match = {
  id: 104,
  a: { t: "mw", m: 101 },
  b: { t: "mw", m: 102 },
};
export const THIRDM: Match = {
  id: 103,
  a: { t: "ml", m: 101 },
  b: { t: "ml", m: 102 },
};
export const ALLM: Match[] = [...R32, ...R16, ...QF, ...SF, THIRDM, FINAL];
export const MById: Record<number, Match> = {};
ALLM.forEach((m) => {
  MById[m.id] = m;
});
export const ROUNDS: Round[] = [
  { key: "R32", title: "Round of 32", date: "Jun 28 – Jul 3", ms: R32 },
  { key: "R16", title: "Round of 16", date: "Jul 4 – 7", ms: R16 },
  { key: "QF", title: "Quarter-finals", date: "Jul 9 – 11", ms: QF },
  { key: "SF", title: "Semi-finals", date: "Jul 14 – 15", ms: SF },
  { key: "3RD", title: "3rd Place", date: "Jul 18 · Miami", ms: [THIRDM] },
  { key: "FIN", title: "Final", date: "Jul 19 · NJ", ms: [FINAL] },
];

// ---- Pure bracket logic (state = {order, thirds, picks}) ----
// order: { [group]: [id,id,id,id] }
// thirds: Set<groupLetter> (size 8 when complete)
// picks:  { [matchId]: teamId }

export function teamsOf(order: Record<string, string[]>, g: string): Team[] {
  return (order[g] || []).map((id) => BYID[id]);
}

export function annexKey(thirds: Set<string>): string {
  return [...thirds].sort().join("");
}

export function resolve(s: Slot | null | undefined, state: State): Team | null {
  const { order, thirds, picks } = state;
  if (!s) return null;
  if (s.t === "w") {
    const o = order[s.g];
    return o && o.length >= 1 ? BYID[o[0]] : null;
  }
  if (s.t === "ru") {
    const o = order[s.g];
    return o && o.length >= 2 ? BYID[o[1]] : null;
  }
  if (s.t === "3w") {
    if (thirds.size !== 8) return null;
    const v = ANNEX[annexKey(thirds)];
    if (!v) return null;
    const ag = v[COL[s.wg]];
    const o = order[ag];
    return o && o.length >= 3 ? BYID[o[2]] : null;
  }
  if (s.t === "mw") {
    const tid = picks[s.m];
    return tid ? BYID[tid] : null;
  }
  if (s.t === "ml") {
    const m = MById[s.m];
    const ta = resolve(m.a, state),
      tb = resolve(m.b, state),
      tid = picks[s.m];
    if (!ta || !tb || !tid) return null;
    return tid === ta.id ? tb : ta;
  }
  return null;
}

// Returns a cleaned copy of picks with any now-invalid picks removed.
export function validatePicks(state: State): Record<number, string> {
  const picks: Record<number, string> = { ...state.picks };
  const next: State = { ...state, picks };
  let changed = true,
    pass = 0;
  while (changed && pass++ < 10) {
    changed = false;
    for (const m of ALLM) {
      const p = picks[m.id];
      if (p === undefined) continue;
      const ta = resolve(m.a, next),
        tb = resolve(m.b, next);
      if (!ta || !tb || (p !== ta.id && p !== tb.id)) {
        delete picks[m.id];
        changed = true;
      }
    }
  }
  return picks;
}

export const groupsDone = (order: Record<string, string[]>): number =>
  GROUPS.filter((g) => (order[g] || []).length >= 3).length;
export const allGroups = (order: Record<string, string[]>): boolean =>
  groupsDone(order) === 12;
export const champion = (state: State): Team | null =>
  resolve({ t: "mw", m: 104 }, state);

export function placeholder(s: Slot): string {
  if (s.t === "w") return "Winner Group " + s.g;
  if (s.t === "ru") return "Runner-up " + s.g;
  if (s.t === "3w") return "Best 3rd place";
  if (s.t === "mw") return "Winner of #" + s.m;
  if (s.t === "ml") return "Loser of #" + s.m;
  return "";
}
