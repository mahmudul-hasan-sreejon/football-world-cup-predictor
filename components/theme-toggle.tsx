"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/use-theme";

// The navbar's theme switch, rendered inside <NavMenu> with the links — so it
// stacks in the phone dropdown and closes the inline row on wider screens.
// Server HTML and first client render both show the dark-theme label; useTheme
// syncs off localStorage right after mount.
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  // `clr` opts out of the glassy .btn skin — .topnav-theme restyles the bare
  // button to match the navbar's anchor links.
  return (
    <Button variant="clr" className="topnav-theme" onClick={toggleTheme}>
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </Button>
  );
}
