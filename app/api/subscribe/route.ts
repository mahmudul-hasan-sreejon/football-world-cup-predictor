import { addSubscriber } from "@/lib/subscribers";
import { TOURNAMENT } from "@/lib/site";
import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: unknown; champion?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const champion = typeof body.champion === "string" ? body.champion : null;

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address" },
      { status: 400 },
    );
  }

  try {
    await addSubscriber(email, champion, TOURNAMENT);
  } catch (err) {
    console.error("subscribe failed", err);
    return NextResponse.json(
      { error: "Could not save subscription" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
