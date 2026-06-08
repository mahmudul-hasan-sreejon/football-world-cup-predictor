'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import { cn } from '@/lib/utils';

/**
 * Minimal Radix-backed modal, styled to the project's design system via the
 * `.modal-*` classes in app/globals.css (focus trap, Escape-to-close, and
 * scroll lock come from Radix).
 */
const Dialog = DialogPrimitive.Root;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="modal-overlay" />
    <DialogPrimitive.Content ref={ref} className={cn('modal', className)} {...props}>
      {children}
      <DialogPrimitive.Close className="modal-x" aria-label="Close">
        ×
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = 'DialogContent';

const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

export { Dialog, DialogContent, DialogTitle, DialogDescription };
