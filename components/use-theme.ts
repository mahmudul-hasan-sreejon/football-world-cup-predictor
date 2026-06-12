import { useEffect, useState, type MouseEvent } from "react";

export type Theme = "dark" | "light";

// Cross-island sync: the hook is mounted twice (the navbar's ThemeToggle and
// the predictor, for the Toaster), so every commit is broadcast and every
// instance listens — otherwise the copy that didn't handle the click would
// keep a stale `theme`.
const THEME_EVENT = "wc26-theme";

// Owns the active theme and the toggle. The no-flash inline script in
// `app/layout.tsx` applies the persisted theme before hydration; here we sync
// our label off it on mount, then drive future changes ourselves.
export function useTheme(): {
  theme: Theme;
  toggleTheme: (e: MouseEvent<HTMLButtonElement>) => void;
} {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    try {
      setTheme(
        localStorage.getItem("wc26-theme") === "light" ? "light" : "dark",
      );
    } catch (e) {}
    const onTheme = (e: Event) => setTheme((e as CustomEvent<Theme>).detail);
    window.addEventListener(THEME_EVENT, onTheme);
    return () => window.removeEventListener(THEME_EVENT, onTheme);
  }, []);

  function applyTheme(t: Theme) {
    document.documentElement.classList.toggle("light", t === "light");
  }
  function commitTheme(t: Theme) {
    setTheme(t);
    applyTheme(t);
    try {
      localStorage.setItem("wc26-theme", t);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: t }));
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

  return { theme, toggleTheme };
}
