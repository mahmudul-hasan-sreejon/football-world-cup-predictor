import { useEffect } from "react";

// Windows-10-Start-tile "reveal" hover: a soft light tracks the cursor along
// each card's border. One delegated pointermove listener writes the cursor's
// position (relative to the hovered `.reveal` card) into CSS custom properties
// — `--mx`/`--my` — and the border glow itself is painted in CSS. Updates are
// coalesced into a single rAF so a fast-moving pointer can't outrun layout.
export function useTileReveal() {
  useEffect(() => {
    let raf = 0;
    let pending: { el: HTMLElement; x: number; y: number } | null = null;

    function flush() {
      raf = 0;
      if (!pending) return;
      const { el, x, y } = pending;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      pending = null;
    }

    function onMove(e: PointerEvent) {
      const target = e.target;
      // `e.target` isn't always an Element (text nodes, document, window), so
      // guard at runtime before reaching for `closest`.
      if (!(target instanceof Element)) return;
      const card = target.closest<HTMLElement>(".reveal");
      if (!card) return;
      const r = card.getBoundingClientRect();
      pending = { el: card, x: e.clientX - r.left, y: e.clientY - r.top };
      if (!raf) raf = requestAnimationFrame(flush);
    }

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}
