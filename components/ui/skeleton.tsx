import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * shadcn-style Skeleton. Like the other primitives here it's structural only —
 * it delegates its shimmer + coloring to the bespoke `.skel` class in
 * app/styles/skeleton.css rather than imposing Tailwind's default skin, so the
 * placeholders match the liquid-glass look in both themes. Size each instance
 * with `className`/`style`.
 */
const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("skel", className)} {...props} />
));
Skeleton.displayName = "Skeleton";

export { Skeleton };
