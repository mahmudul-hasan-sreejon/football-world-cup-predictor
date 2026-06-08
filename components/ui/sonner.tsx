"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * shadcn-style Sonner Toaster, themed to match the project's original `.toast`
 * pill (see app/globals.css): a high-contrast frosted capsule centered at the
 * bottom — light pill on the dark theme, dark pill on the light theme.
 *
 * The app owns its own theme (no next-themes), so the active theme is passed in.
 */
export function Toaster({ theme = "dark", ...props }: ToasterProps) {
  const light = theme === "light";
  return (
    <Sonner
      theme={theme}
      position="bottom-center"
      toastOptions={{
        style: {
          background: light ? "#0d1c18" : "#fff",
          color: light ? "#fff" : "#06100f",
          border: `1px solid ${light ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.6)"}`,
          borderRadius: "12px",
          fontWeight: 700,
          fontSize: "14px",
          backdropFilter: "blur(22px) saturate(175%)",
          WebkitBackdropFilter: "blur(22px) saturate(175%)",
          boxShadow:
            "0 14px 40px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.8)",
          fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
        },
      }}
      {...props}
    />
  );
}
