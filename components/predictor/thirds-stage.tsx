import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { BYID, GROUPS } from "@/lib/bracket";

// Stage 2: pick the 8 third-placed teams that advance to the Round of 32.
export function ThirdsStage({
  order,
  thirds,
  done,
  groupsComplete,
  onToggleThird,
  onBackToGroups,
  onContinue,
}: {
  order: Record<string, string[]>;
  thirds: Set<string>;
  done: number;
  groupsComplete: boolean;
  onToggleThird: (g: string) => void;
  onBackToGroups: () => void;
  onContinue: () => void;
}) {
  const full = thirds.size >= 8;
  return (
    <TabsContent value="thirds" className="stage show">
      <div className="stage-head">
        <div>
          <h2>Best Third-Placed Teams</h2>
          <p>
            Eight of the twelve group-stage third-placed teams advance to the
            Round of 32. Pick the <b>8</b> you think make it. Which groups they
            come from determines the exact knockout seeding.
          </p>
        </div>
        <Badge variant="pill">
          Selected: <b>{thirds.size}</b> / 8
        </Badge>
      </div>
      {!groupsComplete ? (
        <Card className="lock">
          <h3>Rank your groups first</h3>
          <p>
            You&apos;ve ranked {done} of 12 groups. Finish the group stage to
            reveal the twelve third-placed teams.
          </p>
          <Button variant="mag" onClick={onBackToGroups}>
            ← Back to groups
          </Button>
        </Card>
      ) : (
        <>
          <div className="thirds-grid">
            {GROUPS.map((g) => {
              const tm = BYID[order[g][2]];
              const sel = thirds.has(g);
              return (
                <div
                  className={`third${sel ? " sel" : ""}${!sel && full ? " dis" : ""}`}
                  key={g}
                  onClick={() => onToggleThird(g)}
                >
                  <span className="fl">{tm.flag}</span>
                  <span className="meta">
                    <div className="nm">{tm.name}</div>
                    <div className="gp">3rd · Group {g}</div>
                  </span>
                  <span className="chk">✓</span>
                </div>
              );
            })}
          </div>
          <div className="thirdsbar">
            <div className="counter">
              <span>{thirds.size}</span>
              <span className="of"> / 8 selected</span>
            </div>
            <Button
              id="toko"
              variant="mag"
              className={full ? undefined : "ghost"}
              disabled={!full}
              style={full ? undefined : { opacity: 0.5 }}
              onClick={full ? onContinue : undefined}
            >
              Seed the bracket →
            </Button>
          </div>
        </>
      )}
    </TabsContent>
  );
}
