import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * shadcn-style Input. Like Card/Tabs in this project, it stays unopinionated and
 * forwards className rather than imposing a default Tailwind skin that would
 * fight the bespoke design. The themed input look — including the light/dark
 * variants — lives in app/globals.css under `.sub-input`, which callers pass via
 * className.
 */
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input type={type} ref={ref} className={cn(className)} {...props} />
));
Input.displayName = "Input";

export { Input };
