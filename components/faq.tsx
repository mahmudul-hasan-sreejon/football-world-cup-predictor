"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/faq";

/**
 * The FAQ section's interactive shell: a shadcn/Radix single-open accordion over
 * the shared FAQS list (app/page.tsx renders this under the #faq heading). The
 * answers are force-mounted (see components/ui/accordion.tsx), so the copy ships
 * in the server HTML and matches the FAQPage JSON-LD in app/layout.tsx.
 */
export function Faq() {
  return (
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
  );
}
