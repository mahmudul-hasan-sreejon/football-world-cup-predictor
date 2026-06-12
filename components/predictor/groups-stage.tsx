import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { GROUPS, TEAMS } from "@/lib/bracket";

// Stage 1: rank each group's four teams in predicted finishing order.
export function GroupsStage({
  order,
  done,
  groupsComplete,
  onClickTeam,
  onClearGroup,
  onContinue,
}: {
  order: Record<string, string[]>;
  done: number;
  groupsComplete: boolean;
  onClickTeam: (g: string, id: string) => void;
  onClearGroup: (g: string) => void;
  onContinue: () => void;
}) {
  return (
    <TabsContent value="groups" className="stage show">
      <div className="stage-head">
        <div>
          <h2 className="sec-title">Group Stage</h2>
          <p>
            Tap teams in your predicted finishing order — 1st, 2nd, 3rd. The last
            spot fills in automatically. Top two of each group advance; third
            place may still qualify.
          </p>
        </div>
        <Badge variant="pill">
          Groups ranked: <b>{done}</b> / 12
        </Badge>
      </div>
      <div className="groups">
        {GROUPS.map((g) => {
          const o = order[g] || [];
          return (
            <div className="gcard reveal" key={g}>
              <div className="gh">
                <span className="gt">
                  Group <span>{g}</span>
                </span>
                <Button variant="clr" onClick={() => onClearGroup(g)}>
                  clear
                </Button>
              </div>
              <div className="tlist">
                {TEAMS[g].map((t, i) => {
                  const id = g + i;
                  const pos = o.indexOf(id);
                  const rc = pos === -1 ? "" : "r" + (pos + 1);
                  const tag =
                    pos === 0
                      ? "WINNER"
                      : pos === 1
                        ? "RUNNER-UP"
                        : pos === 2
                          ? "3RD"
                          : pos === 3
                            ? "OUT"
                            : "";
                  return (
                    <div
                      className={`team ${rc}`}
                      key={id}
                      onClick={() => onClickTeam(g, id)}
                    >
                      <span className="fl">{t[1]}</span>
                      <span className="nm">{t[0]}</span>
                      <span className="tag">{tag}</span>
                      <span className="rk">{pos >= 0 ? pos + 1 : "·"}</span>
                    </div>
                  );
                })}
              </div>
              <div className="ghint">
                {o.length >= 3 ? "✓ Ranked" : "Tap teams in finishing order"}
              </div>
            </div>
          );
        })}
      </div>
      <div className="thirdsbar">
        <div className="counter">
          <span>{done}</span>
          <span className="of"> / 12 ranked</span>
        </div>
        <Button
          variant="mag"
          className={groupsComplete ? undefined : "ghost"}
          disabled={!groupsComplete}
          style={groupsComplete ? undefined : { opacity: 0.5 }}
          onClick={groupsComplete ? onContinue : undefined}
        >
          Pick best thirds →
        </Button>
      </div>
    </TabsContent>
  );
}
