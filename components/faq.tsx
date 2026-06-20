"use client";

import { useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { FAQS } from "@/lib/faq";

// How long the faux "loading" skeleton shows before crossfading to the FAQ.
const FAKE_LOAD_MS = 700;

/**
 * The FAQ section's interactive shell: a shadcn/Radix single-open accordion over
 * the shared FAQS list (app/page.tsx renders this under the #faq heading).
 *
 * On mount it briefly shows a shadcn Skeleton to mirror the loading feel of the
 * predictor and fixtures sections, then crossfades to the real content. Crucially
 * the accordion is *always* rendered — it's just faded out (opacity, never
 * `hidden`/`display:none`) and stacked under the skeleton in the same grid cell.
 * So the answers still ship in the server HTML and stay in sync with the FAQPage
 * JSON-LD in app/layout.tsx (see components/ui/accordion.tsx); the skeleton is a
 * cosmetic overlay, not a gate that strips the crawlable copy.
 */
export function Faq() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), FAKE_LOAD_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="seo-faq-load"
      data-loading={loading ? "" : undefined}
      aria-busy={loading}
    >
      <div className="seo-faq-skel" aria-hidden="true">
        {FAQS.map((_, i) => (
          <div className="seo-faq-item" key={i}>
            <div className="seo-faq-skel-head">
              <Skeleton style={{ height: 14, width: `${52 + ((i * 11) % 30)}%` }} />
              <Skeleton style={{ height: 16, width: 16, borderRadius: 5 }} />
            </div>
          </div>
        ))}
      </div>
      <Accordion type="single" collapsible className="seo-faq">
        {FAQS.map(({ q, a }, i) => (
          <AccordionItem value={`faq-${i}`} key={q} className="seo-faq-item reveal">
            <AccordionTrigger className="seo-faq-q">{q}</AccordionTrigger>
            <AccordionContent className="seo-faq-answer">
              <p className="seo-faq-a">{a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
