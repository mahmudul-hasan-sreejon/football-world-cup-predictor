import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  placeholder,
  resolve,
  ROUNDS,
  type Match,
  type State,
  type Team,
} from "@/lib/bracket";

// Stage 3: play out the knockout bracket. Tap the team you predict to win each
// tie; winners advance automatically and changing an earlier pick resets the
// rounds after it (the parent cascades via validatePicks).
export function KnockoutStage({
  state,
  picks,
  thirds,
  champ,
  subscribed,
  onPickSlot,
  onOpenSub,
  onGoThirds,
}: {
  state: State;
  picks: Record<number, string>;
  thirds: Set<string>;
  champ: Team | null;
  subscribed: boolean;
  onPickSlot: (mid: number, side: "a" | "b") => void;
  onOpenSub: () => void;
  onGoThirds: () => void;
}) {
  function renderSlot(m: Match, side: "a" | "b") {
    const s = m[side];
    const tm = resolve(s, state);
    const p = picks[m.id];
    let cls = "slot";
    let flag: string, label: string;
    if (tm) {
      flag = tm.flag;
      label = tm.name;
      if (p === tm.id) cls += " win";
      else if (p) cls += " lose";
    } else {
      cls += " empty";
      flag = "○";
      label = placeholder(s);
    }
    return (
      <div
        className={cls}
        key={side}
        onClick={tm ? () => onPickSlot(m.id, side) : undefined}
      >
        <span className="fl">{flag}</span>
        <span className="nm">{label}</span>
      </div>
    );
  }

  return (
    <TabsContent value="ko" className="stage show">
      <div className="stage-head">
        <div>
          <h2 className="sec-title">Knockout Bracket</h2>
          <p>
            Single elimination, Round of 32 through the Final. Tap the team you
            predict to win each tie — winners advance automatically. Change an
            earlier pick and the rounds after it reset.
          </p>
        </div>
        <Badge variant="pill">
          R32 seeded via <b>Annex C</b>
        </Badge>
      </div>

      <div className={`champ${champ ? " show" : ""}`}>
        {champ && (
          <div className="champ-in">
            <span className="tro">🏆</span>
            <div className="champ-meta">
              <div className="lbl">Your predicted world champion</div>
              <div className="who">
                <span>{champ.flag}</span>
                {champ.name}
              </div>
            </div>
            <Button
              variant={subscribed ? "ghost" : "mag"}
              size="sm"
              className="champ-sub"
              onClick={onOpenSub}
            >
              {subscribed ? "✓ Subscribed" : "🔔 Get updates"}
            </Button>
          </div>
        )}
      </div>

      {thirds.size !== 8 ? (
        <Card className="lock">
          <h3>Bracket not seeded yet</h3>
          <p>
            Rank all 12 groups and select your 8 best third-placed teams, then
            the Round of 32 seeds itself.
          </p>
          <Button variant="mag" onClick={onGoThirds}>
            Go to Best Thirds →
          </Button>
        </Card>
      ) : (
        <>
          <p className="scrollhint">↔ scroll to see all rounds</p>
          <div className="bracket-scroll">
            <div className="bracket">
              {ROUNDS.map((r) => {
                const fin = r.key === "FIN";
                return (
                  <div className={`round${fin ? " final-col" : ""}`} key={r.key}>
                    <div className="rhead">
                      {r.title}
                      <small>{r.date}</small>
                    </div>
                    <div className="matches">
                      {r.ms.map((m) => {
                        const isFinal = m.id === 104,
                          isThird = m.id === 103;
                        const tag = isFinal
                          ? "★ FINAL"
                          : isThird
                            ? "3rd-place"
                            : "Match " + m.id;
                        return (
                          <div
                            className={`match reveal${isFinal ? " final-m" : ""}${isThird ? " third-m" : ""}`}
                            key={m.id}
                          >
                            <div className="mn">{tag}</div>
                            {renderSlot(m, "a")}
                            {renderSlot(m, "b")}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </TabsContent>
  );
}
