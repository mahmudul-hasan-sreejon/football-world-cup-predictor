import Predictor from "@/components/predictor/predictor";
import { AdSlot } from "@/components/predictor/ad-slot";
import { GROUPS, TEAMS } from "@/lib/bracket";
import { FAQS } from "@/lib/faq";

export default function Home() {
  return (
    <div className="wrap">
      <header className="hero">
        <p className="kicker">USA · Canada · Mexico · Jun 11 – Jul 19</p>
        <h1>
          FIFA World Cup <span className="y">2026</span>
          <br />
          <span className="p">Predictor</span>
        </h1>
        <p className="sub">
          Fill in your bracket round by round. Rank all <b>12 groups</b>, choose
          the <b>8 best third-placed teams</b>, and your Round of 32 is seeded
          with FIFA&apos;s <b>official Annex C</b> logic — then click your way
          to a champion.
        </p>
        <p className="hostline">
          48 teams · 12 groups · 104 matches · 16 host cities · Final at MetLife
          Stadium, NJ
        </p>
      </header>

      <Predictor />

      <p className="note">
        <b>Data:</b> Final Draw (Dec 5, 2025) groups, all 48 qualified teams,
        and the official Round-of-32 fixture map (Matches 73–104) with
        FIFA&apos;s complete 495-combination Annex C third-place allocation.
        Knockout pairings, dates and venues per the published tournament
        schedule.
        <br />
        <b>Ranking strengths</b> used only by the &quot;Auto-pick&quot; helper
        are rough approximations to give you an editable starting point — not
        predictions. Your picks reset on reload.
      </p>

      <section id="groups" className="seo-block" aria-labelledby="groups-title">
        <h2 id="groups-title" className="sec-title">
          The 12 Groups of the 2026 World Cup
        </h2>
        <p className="seo-sub">
          All 48 qualified teams as drawn at the Final Draw on December 5,
          2025 — the starting point for every bracket prediction.
        </p>
        <div className="seo-groups">
          {GROUPS.map((g) => (
            <div className="seo-group" key={g}>
              <h3>Group {g}</h3>
              <ul>
                {TEAMS[g].map(([name, flag]) => (
                  <li key={name}>
                    <span aria-hidden="true">{flag}</span> {name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="seo-block" aria-labelledby="faq-title">
        <h2 id="faq-title" className="sec-title">
          Frequently Asked Questions
        </h2>
        <div className="seo-faq">
          {FAQS.map(({ q, a }) => (
            <div className="seo-faq-item" key={q}>
              <h3>{q}</h3>
              <p>{a}</p>
            </div>
          ))}
        </div>
      </section>

      <AdSlot
        id="d38de939263cc5574d2e2ae540e86ecc"
        src="https://pl29725502.effectivecpmnetwork.com/d38de939263cc5574d2e2ae540e86ecc/invoke.js"
      />

      <footer className="footer">
        <p className="foot-brand">
          FIFA World Cup <span className="y">2026</span>{" "}
          <span className="p">Predictor</span>
        </p>
        <p className="foot-meta">
          An unofficial fan project · Not affiliated with FIFA · Team and
          tournament data are publicly available facts.
        </p>
        <p className="foot-meta">
          © 2026 ·{" "}
          <a
            href="https://github.com/mahmudul-hasan-sreejon"
            target="_blank"
            rel="noopener noreferrer"
          >
            mahmudul-hasan-sreejon
          </a>{" "}
          · Built with{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js
          </a>{" "}
          and ❤️
        </p>
      </footer>
    </div>
  );
}
