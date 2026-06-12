import Image from "next/image";
import { NavMenu } from "./nav-menu";
import { ThemeToggle } from "./theme-toggle";

// Sticky top navbar — static site chrome rendered by the root layout (server
// component; the theme toggle and the hamburger shell are its client
// islands). The menu items are in-page anchors to the index sections: the
// live-scores strip (#live), the predictor (#prediction), the server-rendered
// groups summary (#groups), the tournament schedule (#fixture), and the FAQ
// (#faq). The theme toggle rides inside the menu too, so on phones it stacks
// in NavMenu's dropdown panel and from 600px up it sits at the end of the
// inline row. Styled by app/styles/topnav.css.
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
          <a href="#prediction">Predictions</a>
          <a href="#groups">Groups</a>
          <a href="#fixture">Fixtures</a>
          <a href="#faq">FAQ</a>
          <ThemeToggle />
        </NavMenu>
      </div>
    </nav>
  );
}
