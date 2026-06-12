import Image from "next/image";
import { NavMenu } from "./nav-menu";
import { ThemeToggle } from "./theme-toggle";

// Sticky top navbar — static site chrome rendered by the root layout (server
// component; the theme toggle and the hamburger shell are its client
// islands). The menu items are in-page anchors to the index sections: the
// live-scores strip (#live), the predictor (#prediction), the server-rendered
// groups summary (#groups), the tournament schedule (#fixture), and the FAQ
// (#faq). On phones the links live in NavMenu's dropdown panel; from 600px up
// they lay out inline. Styled by app/styles/topnav.css.
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
        <NavMenu>
          <a href="#live">Live Results</a>
          <a href="#prediction">Prediction</a>
          <a href="#groups">Groups</a>
          <a href="#fixture">Fixture</a>
          <a href="#faq">FAQ</a>
        </NavMenu>
        <ThemeToggle />
      </div>
    </nav>
  );
}
