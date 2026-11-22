import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

/**
 * Paddle Billing webhook endpoint.
 *
 * Phase 1 scaffolding: verifies the Paddle-Signature header and acknowledges events so you
 * can point Paddle at this URL today. It does NOT yet persist entitlements — that lands in
 * Phase 2 alongside user accounts + a subscriptions table.
 *
 * Signature docs: https://developer.paddle.com/webhooks/signature-verification
 * Set PADDLE_WEBHOOK_SECRET from Paddle > Notifications > (your destination).
 */

export const runtime = "nodejs";
// Must read the raw body for signature verification; never cache.
export const dynamic = "force-dynamic";

/** Parse the `ts=...;h1=...` Paddle-Signature header. */
function parseSignature(header: string): { ts: string; h1: string } | null {
  const parts = header.split(";");
  let ts = "";
  let h1 = "";
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "ts") ts = value;
    if (key === "h1") h1 = value;
  }
  return ts && h1 ? { ts, h1 } : null;
}

function isValidSignature(rawBody: string, header: string, secret: string): boolean {
  const parsed = parseSignature(header);
  if (!parsed) return false;

  const expected = createHmac("sha256", secret)
    .update(`${parsed.ts}:${rawBody}`)
    .digest("hex");

  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(parsed.h1, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[paddle] PADDLE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("paddle-signature");
  const rawBody = await request.text();

  if (!signature || !isValidSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event_type?: string; data?: unknown };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  switch (event.event_type) {
    case "subscription.created":
    case "subscription.updated":
    case "subscription.activated":
      // TODO Phase 2: look up the user by the Paddle customer email and grant Premium.
      break;
    case "subscription.canceled":
    case "subscription.paused":
      // TODO Phase 2: revoke Premium for the associated user.
      break;
    default:
      // Acknowledge other events without action.
      break;
  }

  return NextResponse.json({ received: true });
}
