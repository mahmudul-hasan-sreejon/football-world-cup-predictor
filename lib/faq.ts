// FAQ copy shared by the visible FAQ section (app/page.tsx) and the FAQPage
// JSON-LD in app/layout.tsx. Google requires marked-up FAQ content to be
// visible on the page, so both must render the same entries — sourcing them
// from this single list keeps them in sync by construction.
export const FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "How does the World Cup 2026 bracket predictor work?",
    a: "Rank the teams in all 12 groups, pick the 8 best third-placed teams that advance, and the Round of 32 is automatically seeded using FIFA's official Annex C allocation. From there you click through the knockout stage to crown your champion.",
  },
  {
    q: "What is FIFA's Annex C seeding?",
    a: "Annex C is FIFA's official 495-combination table that determines which Round-of-32 slot each of the 8 best third-placed teams fills, based on exactly which groups those teams come from.",
  },
  {
    q: "When and where is the 2026 FIFA World Cup?",
    a: "The 2026 FIFA World Cup runs from June 11 to July 19, 2026, hosted across the United States, Canada, and Mexico, with the Final at MetLife Stadium in New Jersey. It is the first 48-team World Cup, with 12 groups and 104 matches.",
  },
  {
    q: "Is the bracket predictor free to use?",
    a: "Yes. The FIFA World Cup 2026 Bracket Predictor is completely free and runs in your browser — no account or sign-up is required to build your bracket.",
  },
];
