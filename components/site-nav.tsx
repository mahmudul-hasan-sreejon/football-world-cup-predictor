import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";

// Sticky top navbar — static site chrome rendered by the root layout (server
// component; the theme toggle is its one client island). The menu items are
// in-page anchors to the index sections: the live-scores strip (#live), the
// predictor (#prediction), the server-rendered groups summary (#groups), the
// tournament schedule (#fixture), and the FAQ (#faq). Styled by
// app/styles/topnav.css.
export function SiteNav() {
  return (
    <nav className="topnav" aria-label="Site">
      <div className="topnav-in">
        <a className="topnav-brand" href="/">
          <Image src="/icon.svg" alt="" width={26} height={26} />
          <span>
            FIFA World Cup <span className="y">2026</span>
          </span>
        </a>
        <div className="topnav-links">
          <a href="#live">Live Results</a>
          <a href="#prediction">Prediction</a>
          <a href="#groups">Groups</a>
          <a href="#fixture">Fixture</a>
          <a href="#faq">FAQ</a>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}
