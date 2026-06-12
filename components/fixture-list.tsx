"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { stageTag, statusLabel, type LiveMatch } from "@/lib/scores";
import { useLiveScores } from "./use-live-scores";

// The full tournament schedule, grouped by day — the body of the #fixture
// section in page.tsx. Client-only: it feeds off the same /api/scores payload
// the live banner uses (which carries every match of the tournament, not just
// the upcoming ones), so scores and statuses update in place while the
// section is open. Kickoff dates/times render in the viewer's local time.
// Styled by app/styles/fixtures.css.

function dayLabel(iso: string): string {
  const d = new Date(iso);
  if (!iso || isNaN(d.getTime())) return "Date TBC";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function kickoffTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function FixtureList() {
  const { live, demoFeed } = useLiveScores();

  // Server render and the pre-fetch client render both land here, so the
  // page never hydrates with locale-formatted dates the server can't know.
  if (live.length === 0) {
    return (
      <div className="fx-day" aria-hidden="true">
        <Skeleton style={{ height: 12, width: 160, marginBottom: 10 }} />
        <div className="fx-list">
          {Array.from({ length: 6 }, (_, i) => (
            <Card className="fx-row" key={i}>
              <Skeleton className="fx-tag" style={{ height: 11, width: 42 }} />
              <Skeleton className="fx-when" style={{ height: 11, width: 44 }} />
              <Skeleton
                className="fx-home"
                style={{ height: 13, width: "70%", justifySelf: "end" }}
              />
              <Skeleton className="fx-score" style={{ height: 15, width: 30 }} />
              <Skeleton className="fx-away" style={{ height: 13, width: "70%" }} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Chronological, then chunked into one block per local calendar day.
  const days: { label: string; matches: LiveMatch[] }[] = [];
  for (const m of [...live].sort((a, b) => a.utcDate.localeCompare(b.utcDate))) {
    const label = dayLabel(m.utcDate);
    const last = days[days.length - 1];
    if (last && last.label === label) last.matches.push(m);
    else days.push({ label, matches: [m] });
  }

  return (
    <>
      {demoFeed && (
        <div className="fx-demo">
          <Badge variant="demo">Demo feed</Badge>
        </div>
      )}
      {days.map(({ label, matches }) => (
        <section className="fx-day" key={label} aria-label={label}>
          <h3>{label}</h3>
          <div className="fx-list" role="list">
            {matches.map((m) => {
              const badge = statusLabel(m);
              const started = m.homeScore !== null && m.awayScore !== null;
              return (
                <Card
                  role="listitem"
                  className={`fx-row reveal ${badge.toLowerCase()}`}
                  key={m.id}
                >
                  <span className="fx-tag">
                    {m.group ? `Grp ${m.group}` : (stageTag(m.stage) ?? "")}
                  </span>
                  <span className="fx-team fx-home">
                    <span className="nm">{m.home}</span>
                    <span className="fl" aria-hidden="true">
                      {m.homeFlag ?? "⚽"}
                    </span>
                  </span>
                  <span className="fx-score">
                    {started ? `${m.homeScore}:${m.awayScore}` : "vs"}
                  </span>
                  <span className="fx-team fx-away">
                    <span className="fl" aria-hidden="true">
                      {m.awayFlag ?? "⚽"}
                    </span>
                    <span className="nm">{m.away}</span>
                  </span>
                  <span className="fx-when">
                    {badge === "SOON" ? kickoffTime(m.utcDate) : badge}
                  </span>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
