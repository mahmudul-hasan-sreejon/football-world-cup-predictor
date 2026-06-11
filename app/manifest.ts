import type { MetadataRoute } from "next";

// PWA web app manifest. Next serves this at /manifest.webmanifest and links it
// from <head> automatically. Icon is the file-based app/icon.svg (served at /icon.svg).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FIFA World Cup 2026 Bracket Predictor",
    short_name: "WC26 Predictor",
    description:
      "Predict the 2026 FIFA World Cup. Rank all 12 groups, pick the 8 best third-placed teams, and build your knockout bracket to the Final using FIFA's official Annex C seeding.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0f",
    theme_color: "#0b0b0f",
    categories: ["sports", "games", "entertainment"],
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
    ],
  };
}
