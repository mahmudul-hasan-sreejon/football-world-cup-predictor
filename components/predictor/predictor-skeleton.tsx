import { Skeleton } from "@/components/ui/skeleton";

// Whole-page loading state, shown until <Predictor /> mounts and hydrates.
// It reuses the real layout classes (.livewrap, .bar, .groups, …) and drops
// <Skeleton /> blocks where content goes, so the shape matches the live UI and
// there's no pop-in when the real stages take over.

const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function LiveBannerSkeleton() {
  return (
    <section id="live" className="livewrap" aria-hidden="true">
      <div className="livehead">
        <span className="livedot" />
        <Skeleton style={{ height: 13, width: 170 }} />
      </div>
      <div className="livebar">
        {Array.from({ length: 5 }, (_, i) => (
          <article className="livecard" key={i}>
            <div className="lc-top">
              <Skeleton style={{ height: 16, width: 44, borderRadius: 6 }} />
              <Skeleton style={{ height: 16, width: 50, borderRadius: 6 }} />
            </div>
            <div className="lc-teams">
              <Skeleton style={{ height: 17, width: 17, borderRadius: 4 }} />
              <Skeleton style={{ height: 13, flex: "1 1 0" }} />
              <Skeleton style={{ height: 15, width: 26 }} />
              <Skeleton style={{ height: 13, flex: "1 1 0" }} />
              <Skeleton style={{ height: 17, width: 17, borderRadius: 4 }} />
            </div>
            <div className="lc-time">
              <Skeleton style={{ height: 11, width: 96 }} />
            </div>
          </article>
        ))}
      </div>
      <div className="sectionsep" role="separator">
        <span>Make your predictions</span>
      </div>
    </section>
  );
}

function NavSkeleton() {
  return (
    <nav className="bar" aria-hidden="true">
      <div className="tabs">
        {Array.from({ length: 3 }, (_, i) => (
          <div className="tab" key={i}>
            <Skeleton style={{ height: 18, width: 18, borderRadius: 999 }} />
            <Skeleton style={{ height: 12, width: 64 }} />
          </div>
        ))}
      </div>
      <div className="actions">
        <Skeleton style={{ height: 32, width: 150, borderRadius: 999 }} />
        <Skeleton style={{ height: 32, width: 64, borderRadius: 999 }} />
      </div>
    </nav>
  );
}

function GroupsStageSkeleton() {
  return (
    <div className="stage show" aria-hidden="true">
      <div className="stage-head">
        <div>
          <Skeleton style={{ height: 24, width: 180, marginBottom: 10 }} />
          <Skeleton style={{ height: 13, width: "min(560px, 90%)", marginBottom: 6 }} />
          <Skeleton style={{ height: 13, width: "min(440px, 75%)" }} />
        </div>
        <Skeleton style={{ height: 28, width: 150, borderRadius: 999 }} />
      </div>
      <div className="groups">
        {GROUP_LETTERS.map((g) => (
          <div className="gcard" key={g}>
            <div className="gh">
              <Skeleton style={{ height: 16, width: 78 }} />
              <Skeleton style={{ height: 14, width: 38 }} />
            </div>
            <div className="tlist">
              {Array.from({ length: 4 }, (_, i) => (
                <div className="team" key={i}>
                  <Skeleton style={{ height: 17, width: 17, borderRadius: 4 }} />
                  <Skeleton style={{ height: 13, flex: "1 1 0" }} />
                  <Skeleton style={{ height: 18, width: 18, borderRadius: 6 }} />
                </div>
              ))}
            </div>
            <Skeleton style={{ height: 12, width: 130, marginTop: 2 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PredictorSkeleton() {
  return (
    <>
      <LiveBannerSkeleton />
      {/* Mirrors the real Tabs root, which carries id="fixture", so the
          navbar's anchor works before the predictor mounts. */}
      <div id="fixture">
        <NavSkeleton />
        <GroupsStageSkeleton />
      </div>
    </>
  );
}
