/**
 * Paddle Billing (Paddle.js) client helper.
 *
 * Phase 1 scaffolding: initializes Paddle.js with env config and exposes a single
 * `getPaddle()` that lazily loads the SDK. Price IDs and the client token come from
 * env and are placeholders until you create products in your Paddle dashboard.
 *
 * Docs: https://developer.paddle.com/paddlejs/overview
 */

import { initializePaddle, type Paddle } from "@paddle/paddle-js";

export type PaddleEnvironment = "sandbox" | "production";

export function getPaddleEnvironment(): PaddleEnvironment {
  return process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
    ? "production"
    : "sandbox";
}

export function getPaddleClientToken(): string | undefined {
  return process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || undefined;
}

/** Monthly / yearly price IDs created in your Paddle catalog (placeholders for now). */
export const PADDLE_PRICE_IDS = {
  monthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY || "",
  yearly: process.env.NEXT_PUBLIC_PADDLE_PRICE_YEARLY || "",
} as const;

export type BillingCycle = keyof typeof PADDLE_PRICE_IDS;

/** True once real Paddle config has been supplied via env. */
export function isPaddleConfigured(): boolean {
  return Boolean(getPaddleClientToken());
}

/** Window event dispatched when a Paddle checkout completes successfully. */
export const PADDLE_CHECKOUT_COMPLETED_EVENT = "cm:paddle:checkout-completed";

let paddlePromise: Promise<Paddle | undefined> | null = null;

/**
 * Lazily initialize and return the Paddle instance. Returns undefined when Paddle
 * is not yet configured (no client token), so callers can fall back to the pricing page.
 */
export function getPaddle(): Promise<Paddle | undefined> {
  if (typeof window === "undefined") return Promise.resolve(undefined);
  const token = getPaddleClientToken();
  if (!token) return Promise.resolve(undefined);

  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      environment: getPaddleEnvironment(),
      token,
      eventCallback: (event) => {
        // Phase 1: when checkout completes, let the app flip the local premium flag.
        // Phase 2 replaces this with a webhook-driven, server-verified entitlement.
        if (event?.name === "checkout.completed" && typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent(PADDLE_CHECKOUT_COMPLETED_EVENT, { detail: event.data })
          );
        }
      },
    }).catch((err) => {
      console.error("Failed to initialize Paddle.js", err);
      paddlePromise = null;
      return undefined;
    });
  }
  return paddlePromise;
}
