import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'World Cup 2026 Bracket Predictor — Fill Your Knockout Bracket',
  description:
    "Predict the 2026 FIFA World Cup. Rank all 12 groups, pick the 8 best third-placed teams, and build your knockout bracket from the Round of 32 to the Final using FIFA's official Annex C seeding.",
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    title: 'World Cup 2026 Bracket Predictor',
    description:
      "Rank all 12 groups, pick the 8 best third-placed teams, and click your way to a champion with FIFA's official Annex C seeding.",
    url: SITE_URL,
    siteName: 'World Cup 2026 Predictor',
    // og:image is supplied automatically by app/opengraph-image.tsx
  },
  twitter: {
    card: 'summary_large_image',
    title: 'World Cup 2026 Bracket Predictor',
    description:
      'Rank all 12 groups, pick the 8 best third-placed teams, and click your way to a champion.',
    // twitter:image falls back to the generated og:image
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0b0f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'World Cup 2026 Bracket Predictor',
  description:
    "Interactive bracket predictor for the 2026 FIFA World Cup. Rank the 12 groups, choose the 8 best third-placed teams, and play out the knockout stage to the Final using FIFA's official Annex C seeding logic.",
  url: SITE_URL,
  applicationCategory: 'SportsApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

// Set the saved theme before paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('wc26-theme')||'dark';if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
