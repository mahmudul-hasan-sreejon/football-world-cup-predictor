"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Match } from "@/lib/bracket";
import {
  ALLM,
  BYID,
  FINAL,
  GROUPS,
  MById,
  QF,
  R16,
  R32,
  ROUNDS,
  SF,
  TEAMS,
  THIRDM,
  allGroups,
  champion,
  groupsDone,
  placeholder,
  resolve,
  validatePicks,
} from "@/lib/bracket";
import { upcomingOrLive, statusLabel, type LiveMatch } from "@/lib/scores";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { fireConfetti } from "./confetti";

// Format a match's kickoff for the card, in the viewer's local time, e.g.
// "Jun 11 · 19:00". Returns "" for missing/unparseable dates so the line hides.
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
  });
  return `${date} · ${time}`;
}

export default function Predictor() {
  const [stage, setStage] = useState<string>("groups");
  const [order, setOrder] = useState<Record<string, string[]>>({}); // group -> [id,id,id,id]
  const [thirds, setThirds] = useState<Set<string>>(() => new Set()); // selected group letters (size 8)
  const [picks, setPicks] = useState<Record<number, string>>({}); // matchId -> teamId

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  // Gate the body-level toast portal until after mount (no `document` on the server).
  const [mounted, setMounted] = useState(false);

  // Newsletter sign-up shown once a champion is crowned.
  const [email, setEmail] = useState("");
  // Honeypot: hidden from real users; a non-empty value flags a bot server-side.
  const hpRef = useRef<HTMLInputElement>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subOpen, setSubOpen] = useState(false);

  // Live scores, polled from our own cached /api/scores endpoint.
  const [live, setLive] = useState<LiveMatch[]>([]);
  // True when the endpoint is serving the stand-in feed (no API key configured).
  const [demoFeed, setDemoFeed] = useState(false);

  // Poll /api/scores on a self-rescheduling timer. The endpoint is Redis-cached,
  // so however often we poll, upstream is only hit ~once per cache window. We
  // still keep our own footprint low: fast cadence only while a match is in
  // play, slow otherwise, and no network work at all while the tab is hidden
  // (visibilitychange wakes the loop back up).
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stop = false;
    const FAST = 30_000,
      SLOW = 300_000;

    async function tick() {
      if (stop || document.hidden) return; // hidden: onVisible restarts us
      let next = SLOW;
      try {
        const res = await fetch("/api/scores");
        const data = await res.json();
        const ms: LiveMatch[] = Array.isArray(data?.matches) ? data.matches : [];
        if (!stop) {
          setLive(ms);
          setDemoFeed(!!data?.demo);
        }
        if (ms.some((m) => m.isLive)) next = FAST;
      } catch {}
      if (!stop) timer = setTimeout(tick, next);
    }
    function onVisible() {
      if (!document.hidden) {
        clearTimeout(timer);
        tick();
      }
    }

    tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stop = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Sync theme label from what the no-flash script already applied.
  useEffect(() => {
    setMounted(true);
    try {
      setTheme(
        localStorage.getItem("wc26-theme") === "light" ? "light" : "dark",
      );
    } catch (e) {}
  }, []);

  const state = { order, thirds, picks };

  // Apply a state mutation, then drop any picks that became invalid.
  function applyState(
    nextOrder: Record<string, string[]>,
    nextThirds: Set<string>,
    nextPicks: Record<number, string>,
  ) {
    const cleaned = validatePicks({
      order: nextOrder,
      thirds: nextThirds,
      picks: nextPicks,
    });
    setOrder(nextOrder);
    setThirds(nextThirds);
    setPicks(cleaned);
  }

  function showToast(m: string) {
    toast(m, { duration: 2200 });
  }

  function onEmail(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }
  async function subscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      showToast("Enter a valid email address");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: v,
          champion: champ?.name ?? null,
          website: hpRef.current?.value ?? "",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showToast(data?.error || "Subscription failed — try again");
        return;
      }
      setSubscribed(true);
      showToast("Subscribed — we’ll keep you posted");
    } catch {
      showToast("Network error — try again");
    } finally {
      setSubmitting(false);
    }
  }

  function go(s: string) {
    setStage(s);
    if (s === "ko") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---- Groups ----
  function ensureFour(g: string, o: string[]) {
    if (o.length === 3) {
      const last = TEAMS[g].map((_, i) => g + i).find((id) => !o.includes(id));
      if (last) o.push(last);
    }
  }
  function clickTeam(g: string, id: string) {
    const o = [...(order[g] || [])];
    const i = o.indexOf(id);
    if (i === -1) {
      if (o.length >= 4) return;
      o.push(id);
      ensureFour(g, o);
    } else {
      o.splice(i); // remove this and all after
    }
    applyState({ ...order, [g]: o }, thirds, picks);
  }
  function clearGroup(g: string) {
    const nextOrder = { ...order };
    delete nextOrder[g];
    applyState(nextOrder, thirds, picks);
  }

  // ---- Thirds ----
  function toggleThird(g: string) {
    const next = new Set(thirds);
    if (next.has(g)) next.delete(g);
    else {
      if (next.size >= 8) {
        showToast("Deselect one first — exactly 8 advance");
        return;
      }
      next.add(g);
    }
    applyState(order, next, picks);
  }

  // ---- Knockout ----
  function clickSlot(mid: number, side: "a" | "b") {
    const m = MById[mid];
    const tm = resolve(m[side], state);
    if (!tm) return;
    const next = { ...picks };
    if (next[mid] === tm.id) delete next[mid];
    else next[mid] = tm.id;
    applyState(order, thirds, next);
  }

  // ---- Auto / reset ----
  function autoPick() {
    const nextOrder: Record<string, string[]> = {};
    GROUPS.forEach((g) => {
      nextOrder[g] = TEAMS[g]
        .map((t, i) => ({ id: g + i, r: t[2] }))
        .sort((a, b) => b.r - a.r)
        .map((x) => x.id);
    });
    const thirdTeams = GROUPS.map((g) => ({
      g,
      r: BYID[nextOrder[g][2]].rating,
    })).sort((a, b) => b.r - a.r);
    const nextThirds = new Set(thirdTeams.slice(0, 8).map((x) => x.g));
    const nextPicks: Record<number, string> = {};
    const st = { order: nextOrder, thirds: nextThirds, picks: nextPicks };
    for (const m of ALLM) {
      const ta = resolve(m.a, st),
        tb = resolve(m.b, st);
      if (ta && tb) nextPicks[m.id] = tb.rating > ta.rating ? tb.id : ta.id;
    }
    setOrder(nextOrder);
    setThirds(nextThirds);
    setPicks(nextPicks);
    showToast("Filled by ranking — now edit anything you like");
  }
  function resetAll() {
    setOrder({});
    setThirds(new Set());
    setPicks({});
    go("groups");
    showToast("Cleared");
  }
  // ---- Theme ----
  function applyTheme(t: "dark" | "light") {
    document.documentElement.classList.toggle("light", t === "light");
  }
  function commitTheme(t: "dark" | "light") {
    setTheme(t);
    applyTheme(t);
    try {
      localStorage.setItem("wc26-theme", t);
    } catch (e) {}
  }
  function toggleTheme(e: MouseEvent<HTMLButtonElement>) {
    const btn = e.currentTarget;
    const next = theme === "light" ? "dark" : "light";
    const reduceMotion = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };
    // Modern path: circular clip-path reveal expanding from the button
    if (doc.startViewTransition && !reduceMotion) {
      const r = btn.getBoundingClientRect();
      const x = r.left + r.width / 2,
        y = r.top + r.height / 2;
      const end = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y),
      );
      doc
        .startViewTransition(() => commitTheme(next))
        .ready.then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${end}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 520,
              easing: "ease-in-out",
              pseudoElement: "::view-transition-new(root)",
            },
          );
        });
      return;
    }
    // Fallback: brief global color cross-fade
    const root = document.documentElement;
    root.classList.add("theme-fade");
    commitTheme(next);
    setTimeout(() => root.classList.remove("theme-fade"), 500);
  }

  // ---- Derived ----
  const done = groupsDone(order);
  const groupsComplete = allGroups(order);
  const champ = champion(state);

  // Matches to surface in the banner. The demo feed is curated, so show it all;
  // real data is filtered to in-play now or kicking off in the next few days.
  const liveBanner = !mounted
    ? []
    : demoFeed
      ? live
      : upcomingOrLive(live, new Date().toISOString());

  // Celebrate when a champion is newly crowned (or changed to a different team).
  const prevChamp = useRef<string | null>(null);
  useEffect(() => {
    const id = champ?.id ?? null;
    if (id && id !== prevChamp.current) {
      fireConfetti();
      if (!subscribed) setSubOpen(true); // open the sign-up modal on a fresh champion
    }
    prevChamp.current = id;
  }, [champ?.id, subscribed]);

  const tabs = [
    { k: "groups", num: "1", label: "Groups", done: groupsComplete },
    { k: "thirds", num: "2", label: "Best Thirds", done: thirds.size === 8 },
    { k: "ko", num: "3", label: "Knockout", done: !!champ },
  ];
  const themeLabel = theme === "light" ? "🌙 Dark" : "☀️ Light";

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
        onClick={tm ? () => clickSlot(m.id, side) : undefined}
      >
        <span className="fl">{flag}</span>
        <span className="nm">{label}</span>
      </div>
    );
  }

  return (
    <>
      {liveBanner.length > 0 && (
        <section className="livewrap" aria-label="Live and upcoming scores">
          <div className="livehead">
            <span className="livedot" aria-hidden="true" />
            <h2 className="livehd-title">Live &amp; Latest Results</h2>
            {demoFeed && <Badge variant="demo">Demo feed</Badge>}
          </div>
          <div className="livebar">
            {liveBanner.map((m) => {
              const badge = statusLabel(m);
              const when = kickoff(m.utcDate);
              return (
                <article
                  className={`livecard ${badge.toLowerCase()}`}
                  key={m.id}
                >
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
      )}

      <Tabs value={stage} onValueChange={go}>
        <nav className="bar">
          <TabsList className="tabs">
            {tabs.map((t) => (
              <TabsTrigger
                key={t.k}
                value={t.k}
                className={`tab${stage === t.k ? " active" : ""}${t.done ? " done" : ""}`}
              >
                <span className="n">{t.done ? "✓" : t.num}</span>
                <span className="lbl">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="actions">
            <Button variant="mag" size="sm" onClick={autoPick}>
              ⚡ Auto-pick by ranking
            </Button>
            <Button variant="ghost" size="sm" onClick={resetAll}>
              Reset
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {themeLabel}
            </Button>
          </div>
        </nav>

        {/* GROUPS */}
        <TabsContent value="groups" className="stage show">
          <div className="stage-head">
            <div>
              <h2>Group Stage</h2>
              <p>
                Tap teams in your predicted finishing order — 1st, 2nd, 3rd. The
                last spot fills in automatically. Top two of each group advance;
                third place may still qualify.
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
                <div className="gcard" key={g}>
                  <div className="gh">
                    <span className="gt">
                      Group <span>{g}</span>
                    </span>
                    <Button variant="clr" onClick={() => clearGroup(g)}>
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
                          onClick={() => clickTeam(g, id)}
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
                    {o.length >= 3
                      ? "✓ Ranked"
                      : "Tap teams in finishing order"}
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
              onClick={groupsComplete ? () => go("thirds") : undefined}
            >
              Pick best thirds →
            </Button>
          </div>
        </TabsContent>

        {/* THIRDS */}
        <TabsContent value="thirds" className="stage show">
          <div className="stage-head">
            <div>
              <h2>Best Third-Placed Teams</h2>
              <p>
                Eight of the twelve group-stage third-placed teams advance to
                the Round of 32. Pick the <b>8</b> you think make it. Which
                groups they come from determines the exact knockout seeding.
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
                You&apos;ve ranked {done} of 12 groups. Finish the group stage
                to reveal the twelve third-placed teams.
              </p>
              <Button variant="mag" onClick={() => go("groups")}>
                ← Back to groups
              </Button>
            </Card>
          ) : (
            (() => {
              const full = thirds.size >= 8;
              return (
                <>
                  <div className="thirds-grid">
                    {GROUPS.map((g) => {
                      const tm = BYID[order[g][2]];
                      const sel = thirds.has(g);
                      return (
                        <div
                          className={`third${sel ? " sel" : ""}${!sel && full ? " dis" : ""}`}
                          key={g}
                          onClick={() => toggleThird(g)}
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
                      onClick={full ? () => go("ko") : undefined}
                    >
                      Seed the bracket →
                    </Button>
                  </div>
                </>
              );
            })()
          )}
        </TabsContent>

        {/* KNOCKOUT */}
        <TabsContent value="ko" className="stage show">
          <div className="stage-head">
            <div>
              <h2>Knockout Bracket</h2>
              <p>
                Single elimination, Round of 32 through the Final. Tap the team
                you predict to win each tie — winners advance automatically.
                Change an earlier pick and the rounds after it reset.
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
                  onClick={() => setSubOpen(true)}
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
                Rank all 12 groups and select your 8 best third-placed teams,
                then the Round of 32 seeds itself.
              </p>
              <Button
                variant="mag"
                onClick={() => go(groupsComplete ? "thirds" : "groups")}
              >
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
                      <div
                        className={`round${fin ? " final-col" : ""}`}
                        key={r.key}
                      >
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
                                className={`match${isFinal ? " final-m" : ""}${isThird ? " third-m" : ""}`}
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
      </Tabs>

      <Dialog open={subOpen} onOpenChange={setSubOpen}>
        <DialogContent className="sub-modal">
          {subscribed ? (
            <div className="sub-done">
              <span className="sub-check">✓</span>
              <div>
                <DialogTitle className="sub-title">
                  You&apos;re on the list
                </DialogTitle>
                <DialogDescription>
                  Thanks for subscribing! We&apos;ll keep you posted about our
                  World Cup coverage and updates.
                </DialogDescription>
              </div>
            </div>
          ) : (
            <form className="sub-form" onSubmit={subscribe}>
              {/* Honeypot — off-screen and hidden from assistive tech; bots that
                  blindly fill inputs trip it, real users never see it. */}
              <input
                ref={hpRef}
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-9999px",
                  width: 1,
                  height: 1,
                  opacity: 0,
                }}
              />
              <span className="sub-tro">🏆</span>
              <div className="sub-copy">
                <DialogTitle className="sub-title">
                  Get updates from us!
                </DialogTitle>
                <DialogDescription>
                  You picked <b className="sub-champ">{champ?.name}</b> to lift
                  the trophy. Drop your email and we&apos;ll let you know about
                  the latest updates.
                </DialogDescription>
              </div>
              <div className="sub-row">
                <Input
                  type="email"
                  className="sub-input"
                  placeholder="you@example.com"
                  aria-label="Email address"
                  value={email}
                  onChange={onEmail}
                  disabled={submitting}
                  autoFocus
                  required
                />
                <Button type="submit" variant="mag" disabled={submitting}>
                  {submitting ? "Subscribing…" : "Subscribe"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Portal to <body> so the toaster escapes `.wrap`'s stacking context and
          its z-index can sit above the sign-up modal (which Radix portals to body). */}
      {mounted && createPortal(<Toaster theme={theme} />, document.body)}
    </>
  );
}
