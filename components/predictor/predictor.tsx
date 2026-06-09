"use client";

import { fireConfetti } from "@/app/confetti";
import { Toaster } from "@/components/ui/sonner";
import { Tabs } from "@/components/ui/tabs";
import {
  ALLM,
  allGroups,
  BYID,
  champion,
  GROUPS,
  groupsDone,
  MById,
  resolve,
  TEAMS,
  validatePicks,
  type State,
} from "@/lib/bracket";
import { upcomingOrLive } from "@/lib/scores";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { GroupsStage } from "./groups-stage";
import { KnockoutStage } from "./knockout-stage";
import { LiveBanner } from "./live-banner";
import { Nav } from "./nav";
import { SubscribeDialog } from "./subscribe-dialog";
import { ThirdsStage } from "./thirds-stage";
import { useLiveScores } from "./use-live-scores";
import { useTheme } from "./use-theme";

export default function Predictor() {
  const [stage, setStage] = useState<string>("groups");
  const [order, setOrder] = useState<Record<string, string[]>>({}); // group -> [id,id,id,id]
  const [thirds, setThirds] = useState<Set<string>>(() => new Set()); // selected group letters (size 8)
  const [picks, setPicks] = useState<Record<number, string>>({}); // matchId -> teamId

  // Gate the body-level toast portal until after mount (no `document` on the server).
  const [mounted, setMounted] = useState(false);

  // Newsletter sign-up shown once a champion is crowned.
  const [email, setEmail] = useState("");
  // Honeypot: hidden from real users; a non-empty value flags a bot server-side.
  const hpRef = useRef<HTMLInputElement>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subOpen, setSubOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { live, demoFeed } = useLiveScores();

  useEffect(() => {
    setMounted(true);
  }, []);

  const state: State = { order, thirds, picks };

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

  return (
    <>
      {liveBanner.length > 0 && (
        <LiveBanner matches={liveBanner} demoFeed={demoFeed} />
      )}

      <Tabs value={stage} onValueChange={go}>
        <Nav
          tabs={tabs}
          stage={stage}
          themeLabel={themeLabel}
          onAutoPick={autoPick}
          onReset={resetAll}
          onToggleTheme={toggleTheme}
        />

        <GroupsStage
          order={order}
          done={done}
          groupsComplete={groupsComplete}
          onClickTeam={clickTeam}
          onClearGroup={clearGroup}
          onContinue={() => go("thirds")}
        />

        <ThirdsStage
          order={order}
          thirds={thirds}
          done={done}
          groupsComplete={groupsComplete}
          onToggleThird={toggleThird}
          onBackToGroups={() => go("groups")}
          onContinue={() => go("ko")}
        />

        <KnockoutStage
          state={state}
          picks={picks}
          thirds={thirds}
          champ={champ}
          subscribed={subscribed}
          onPickSlot={clickSlot}
          onOpenSub={() => setSubOpen(true)}
          onGoThirds={() => go(groupsComplete ? "thirds" : "groups")}
        />
      </Tabs>

      <SubscribeDialog
        open={subOpen}
        onOpenChange={setSubOpen}
        subscribed={subscribed}
        submitting={submitting}
        email={email}
        championName={champ?.name}
        hpRef={hpRef}
        onEmail={onEmail}
        onSubmit={subscribe}
      />

      {/* Portal to <body> so the toaster escapes `.wrap`'s stacking context and
          its z-index can sit above the sign-up modal (which Radix portals to body). */}
      {mounted && createPortal(<Toaster theme={theme} />, document.body)}
    </>
  );
}
