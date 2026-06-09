import { Badge } from "@/components/ui/badge";
import { statusLabel, type LiveMatch } from "@/lib/scores";

// Format a match's kickoff for the card, in the viewer's local time with a
// timezone label, e.g. "Jun 11 · 19:00 GMT+6". Returns "" for missing/
// unparseable dates so the line hides.
function kickoff(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
  return `${date} · ${time}`;
}

// Live / latest results — a header row plus a horizontal strip of match cards,
// closed by a labeled divider that leads into the prediction UI.
export function LiveBanner({
  matches,
  demoFeed,
}: {
  matches: LiveMatch[];
  demoFeed: boolean;
}) {
  return (
    <section className="livewrap" aria-label="Live and upcoming scores">
      <div className="livehead">
        <span className="livedot" aria-hidden="true" />
        <h2 className="livehd-title">Live &amp; Latest Results</h2>
        {demoFeed && <Badge variant="demo">Demo feed</Badge>}
      </div>
      <div className="livebar">
        {matches.map((m) => {
          const badge = statusLabel(m);
          const when = kickoff(m.utcDate);
          return (
            <article className={`livecard ${badge.toLowerCase()}`} key={m.id}>
              <div className="lc-top">
                <Badge variant="status">{badge}</Badge>
                {m.group && <Badge variant="group">Grp {m.group}</Badge>}
              </div>
              <div className="lc-teams">
                <span className="fl">{m.homeFlag ?? "⚽"}</span>
                <span className="nm">{m.home}</span>
                <span className="sc">
                  {m.homeScore ?? "–"}
                  <i>:</i>
                  {m.awayScore ?? "–"}
                </span>
                <span className="nm">{m.away}</span>
                <span className="fl">{m.awayFlag ?? "⚽"}</span>
              </div>
              {when && (
                <div className="lc-time">
                  <span aria-hidden="true">🕑</span>
                  {when}
                </div>
              )}
            </article>
          );
        })}
      </div>
      <div className="sectionsep" role="separator">
        <span>Make your predictions</span>
      </div>
    </section>
  );
}
