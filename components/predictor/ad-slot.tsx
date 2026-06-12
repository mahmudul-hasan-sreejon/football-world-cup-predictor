"use client";

import Script from "next/script";

// A single Adsterra ad unit (e.g. a Native Banner). Adsterra's `invoke.js`
// script — loaded once, after hydration — finds the matching `container-<id>`
// div and injects the ad into it client-side, outside React's tree (so there's
// no hydration mismatch: server and client both render an empty container).
// The `.adslot` wrapper reserves a min-height so the injected ad doesn't shift
// surrounding content (CLS) while it loads.
export function AdSlot({
  id,
  src,
  label = "Advertisement",
}: {
  id: string;
  src: string;
  label?: string;
}) {
  return (
    <aside className="adslot" aria-label={label}>
      <Script
        id={`adsterra-${id}`}
        src={src}
        strategy="afterInteractive"
        async
        data-cfasync="false"
      />
      <div id={`container-${id}`} />
    </aside>
  );
}
