import { addSubscriber } from "@/lib/subscribers";
import { TOURNAMENT } from "@/lib/site";
import { TEAM_NAMES } from "@/lib/bracket";
import { allowSubscribe } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// RFC 5321 caps an address at 254 chars; anything longer is abuse, not a user.
const EMAIL_MAX = 254;
// Reject oversized payloads outright so a bot can't stream large bodies at us.
const BODY_MAX = 1024;

// Best-effort client IP for rate limiting, from the proxy headers Vercel sets.
function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  // Cheap up-front size guard before we read or parse anything.
  const len = Number(req.headers.get("content-length") || 0);
  if (len > BODY_MAX) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  if (!(await allowSubscribe(clientIp(req)))) {
    return NextResponse.json(
      { error: "Too many requests — try again later" },
      { status: 429 },
    );
  }

  let body: { email?: unknown; champion?: unknown; website?: unknown };
  try {
    const raw = await req.text();
    if (raw.length > BODY_MAX) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  // Honeypot: real users never see or fill `website`. A filled value is a bot —
  // pretend success so it doesn't learn to adapt, but persist nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (email.length > EMAIL_MAX || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address" },
      { status: 400 },
    );
  }

  // Only accept a known team name (or null). Bounds what an untrusted client can
  // store to a tiny fixed set, so `champion` can't be used to bloat the table.
  const champion =
    typeof body.champion === "string" && TEAM_NAMES.has(body.champion)
      ? body.champion
      : null;

  let inserted: boolean;
  try {
    inserted = await addSubscriber(email, champion, TOURNAMENT);
  } catch (err) {
    console.error("subscribe failed", err);
    return NextResponse.json(
      { error: "Could not save subscription" },
      { status: 500 },
    );
  }

  // The email is already in the table — reject as a duplicate rather than
  // silently re-subscribing.
  if (!inserted) {
    return NextResponse.json(
      { error: "This email is already subscribed" },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
