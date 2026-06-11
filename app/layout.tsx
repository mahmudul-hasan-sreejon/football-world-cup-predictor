import { SITE_URL } from "@/lib/site";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "FIFA World Cup 2026 Bracket Predictor — Fill Your Knockout Bracket",
    template: "%s · FIFA World Cup 2026 Predictor",
  },
  description:
    "Predict the 2026 FIFA World Cup. Rank all 12 groups, pick the 8 best third-placed teams, and build your knockout bracket from the Round of 32 to the Final using FIFA's official Annex C seeding.",
  applicationName: "FIFA World Cup 2026 Predictor",
  authors: [{ name: "Mahmudul Hasan Sreejon" }],
  creator: "Mahmudul Hasan Sreejon",
  publisher: "Mahmudul Hasan Sreejon",
  category: "sports",
  keywords: [
    "FIFA World Cup 2026",
    "World Cup 2026 bracket",
    "World Cup bracket predictor",
    "World Cup 2026 predictor",
    "knockout bracket",
    "Annex C seeding",
    "World Cup 2026 groups",
    "Round of 32",
    "World Cup simulator",
    "World Cup 2026 schedule",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "FIFA World Cup 2026 Bracket Predictor",
    description:
      "Rank all 12 groups, pick the 8 best third-placed teams, and click your way to a champion with FIFA's official Annex C seeding.",
    url: SITE_URL,
    siteName: "FIFA World Cup 2026 Predictor",
    // og:image is supplied automatically by app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "FIFA World Cup 2026 Bracket Predictor",
    description:
      "Rank all 12 groups, pick the 8 best third-placed teams, and click your way to a champion.",
    // twitter:image falls back to the generated og:image
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "FIFA World Cup 2026 Bracket Predictor",
      description:
        "Interactive bracket predictor for the 2026 FIFA World Cup. Rank the 12 groups, choose the 8 best third-placed teams, and play out the knockout stage to the Final using FIFA's official Annex C seeding logic.",
      url: SITE_URL,
      applicationCategory: "SportsApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript.",
      inLanguage: "en",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@type": "Person", name: "Mahmudul Hasan Sreejon" },
    },
    {
      "@type": "SportsEvent",
      name: "FIFA World Cup 2026",
      sport: "Association football",
      description:
        "The 2026 FIFA World Cup — 48 teams, 12 groups, 104 matches across the United States, Canada, and Mexico.",
      startDate: "2026-06-11",
      endDate: "2026-07-19",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: [
        { "@type": "Country", name: "United States" },
        { "@type": "Country", name: "Canada" },
        { "@type": "Country", name: "Mexico" },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How does the World Cup 2026 bracket predictor work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Rank the teams in all 12 groups, pick the 8 best third-placed teams that advance, and the Round of 32 is automatically seeded using FIFA's official Annex C allocation. From there you click through the knockout stage to crown your champion.",
          },
        },
        {
          "@type": "Question",
          name: "What is FIFA's Annex C seeding?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Annex C is FIFA's official 495-combination table that determines which Round-of-32 slot each of the 8 best third-placed teams fills, based on exactly which groups those teams come from.",
          },
        },
        {
          "@type": "Question",
          name: "When and where is the 2026 FIFA World Cup?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The 2026 FIFA World Cup runs from June 11 to July 19, 2026, hosted across the United States, Canada, and Mexico, with the Final at MetLife Stadium in New Jersey. It is the first 48-team World Cup, with 12 groups and 104 matches.",
          },
        },
        {
          "@type": "Question",
          name: "Is the bracket predictor free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The FIFA World Cup 2026 Bracket Predictor is completely free and runs in your browser — no account or sign-up is required to build your bracket.",
          },
        },
      ],
    },
  ],
};

// Set the saved theme before paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('wc26-theme')||'dark';if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Sometype+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
