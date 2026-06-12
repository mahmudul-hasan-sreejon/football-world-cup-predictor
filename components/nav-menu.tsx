"use client";

import { useEffect, useState, type ReactNode } from "react";

// The navbar menu's mobile shell: a hamburger button plus the links container,
// which topnav.css renders as a dropdown panel under the bar on phones and
// responsive.css flattens into an inline row from 600px up (where the button
// is hidden and `open` is irrelevant). The links themselves stay
// server-rendered — they're passed through as children.
export function NavMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  // While open: Escape or a tap anywhere outside the navbar closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDocClick = (e: Event) => {
      if (!(e.target as HTMLElement).closest(".topnav")) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onDocClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onDocClick);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="topnav-burger"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="topnav-menu"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "✕" : "☰"}
      </button>
      <div
        id="topnav-menu"
        className={`topnav-links${open ? " open" : ""}`}
        // Following a link should also collapse the panel.
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        {children}
      </div>
    </>
  );
}
