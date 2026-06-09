import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ChangeEvent, FormEvent, RefObject } from "react";

// Newsletter sign-up, opened once a champion is crowned. Shows the form, or a
// confirmation once subscribed. The honeypot field traps bots server-side.
export function SubscribeDialog({
  open,
  onOpenChange,
  subscribed,
  submitting,
  email,
  championName,
  hpRef,
  onEmail,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscribed: boolean;
  submitting: boolean;
  email: string;
  championName?: string;
  hpRef: RefObject<HTMLInputElement | null>;
  onEmail: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sub-modal">
        {subscribed ? (
          <div className="sub-done">
            <span className="sub-check">✓</span>
            <div>
              <DialogTitle className="sub-title">
                You&apos;re on the list
              </DialogTitle>
              <DialogDescription>
                Thanks for subscribing! We&apos;ll keep you posted about our
                World Cup coverage and updates.
              </DialogDescription>
            </div>
          </div>
        ) : (
          <form className="sub-form" onSubmit={onSubmit}>
            {/* Honeypot — off-screen and hidden from assistive tech; bots that
                blindly fill inputs trip it, real users never see it. */}
            <input
              ref={hpRef}
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-9999px",
                width: 1,
                height: 1,
                opacity: 0,
              }}
            />
            <span className="sub-tro">🏆</span>
            <div className="sub-copy">
              <DialogTitle className="sub-title">
                Get updates from us!
              </DialogTitle>
              <DialogDescription>
                You picked <b className="sub-champ">{championName}</b> to lift
                the trophy. Drop your email and we&apos;ll let you know about the
                latest updates.
              </DialogDescription>
            </div>
            <div className="sub-row">
              <Input
                type="email"
                className="sub-input"
                placeholder="you@example.com"
                aria-label="Email address"
                value={email}
                onChange={onEmail}
                disabled={submitting}
                autoFocus
                required
              />
              <Button type="submit" variant="mag" disabled={submitting}>
                {submitting ? "Subscribing…" : "Subscribe"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
