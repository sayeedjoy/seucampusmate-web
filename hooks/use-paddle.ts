"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPaddle,
  isPaddleConfigured,
  PADDLE_PRICE_IDS,
  type BillingCycle,
} from "@/lib/paddle/client";

/**
 * Opens a Paddle checkout overlay for the chosen billing cycle.
 *
 * Phase 1: if Paddle isn't configured yet (no client token / price ids), this falls back
 * to routing the user to the Pricing page so the flow never dead-ends.
 */
export function usePaddle() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const openCheckout = useCallback(
    async (cycle: BillingCycle = "monthly", email?: string) => {
      const priceId = PADDLE_PRICE_IDS[cycle];

      if (!isPaddleConfigured() || !priceId) {
        router.push("/pricing");
        return;
      }

      setLoading(true);
      try {
        const paddle = await getPaddle();
        if (!paddle) {
          router.push("/pricing");
          return;
        }
        paddle.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          ...(email ? { customer: { email } } : {}),
        });
      } catch (err) {
        console.error("Paddle checkout failed to open", err);
        router.push("/pricing");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return { openCheckout, loading, configured: isPaddleConfigured() };
}
