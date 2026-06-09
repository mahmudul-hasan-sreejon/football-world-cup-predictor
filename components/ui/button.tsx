"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * shadcn-style Button, styled to the project's existing `.btn` design system
 * (see app/globals.css) so the liquid-glass look is preserved exactly.
 *   variant: default | mag (primary/magenta) | ghost | clr (bare text button,
 *            e.g. a group card's "clear" — opts out of the `.btn` skin)
 *   size:    default | sm
 */
const buttonVariants = cva("", {
  variants: {
    variant: {
      default: "btn",
      mag: "btn mag",
      ghost: "btn ghost",
      clr: "clr",
    },
    size: {
      default: "",
      sm: "sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
