import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * shadcn-style Badge, styled to the project's existing pill/badge classes (see
 * app/globals.css) so the liquid-glass look and both the dark and light themes
 * are preserved exactly — no default Tailwind skin is imposed.
 *   pill   — stat capsule in a stage header (e.g. "Groups ranked 3 / 12")
 *   status — live-score state badge (LIVE / SOON / FT); its color is driven by
 *            the parent `.livecard` state class
 *   group  — group-letter tag on a live-score card (e.g. "Grp A")
 *   demo   — "Demo feed" marker on the live-results header
 */
const badgeVariants = cva("", {
  variants: {
    variant: {
      pill: "pill",
      status: "lc-badge",
      group: "lc-grp",
      demo: "livehd-pill",
    },
  },
  defaultVariants: {
    variant: "pill",
  },
});

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
