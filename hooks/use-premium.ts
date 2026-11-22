"use client";

import { usePremiumContext } from "@/components/premium/PremiumProvider";
import { canUse, getRemaining, incrementUsage } from "@/lib/premium/usage";
import { FEATURES, type FeatureKey } from "@/lib/premium/tiers";

/** Access the premium entitlement + upgrade controls. */
export function usePremium() {
  return usePremiumContext();
}

export interface FeatureGate {
  /** Whether the user may use the feature right now. */
  allowed: boolean;
  isPremium: boolean;
  /** Remaining free uses this month (monthlyLimit features only; Infinity if premium). */
  remaining: number;
  /**
   * Call at the moment of use. Returns true if allowed (and records the use for
   * monthlyLimit features); returns false and opens the upgrade dialog if blocked.
   * For `itemCap` features, pass the current item count.
   */
  requireAccess: (currentCount?: number) => boolean;
}

/**
 * Gate a feature against the current tier. Reads live from tier config + usage counters.
 *
 * - `premiumOnly`  → blocked entirely for free users.
 * - `monthlyLimit` → free users get N uses/month; `requireAccess()` records a use.
 * - `itemCap`      → free users capped at N items; pass the current count to `requireAccess`.
 */
export function useFeatureGate(feature: FeatureKey): FeatureGate {
  const { isPremium, openUpgrade } = usePremium();
  const rule = FEATURES[feature].rule;

  let allowed = true;
  let remaining = Number.POSITIVE_INFINITY;

  if (!isPremium) {
    switch (rule.kind) {
      case "premiumOnly":
        allowed = false;
        remaining = 0;
        break;
      case "monthlyLimit":
        allowed = canUse(feature, rule.freeLimit);
        remaining = getRemaining(feature, rule.freeLimit);
        break;
      case "itemCap":
        // Point-in-time allowance is evaluated in requireAccess with the live count.
        allowed = true;
        remaining = rule.freeCap;
        break;
    }
  }

  const requireAccess = (currentCount?: number): boolean => {
    if (isPremium) return true;

    switch (rule.kind) {
      case "premiumOnly":
        openUpgrade(feature);
        return false;
      case "monthlyLimit":
        if (!canUse(feature, rule.freeLimit)) {
          openUpgrade(feature);
          return false;
        }
        incrementUsage(feature);
        return true;
      case "itemCap":
        if ((currentCount ?? 0) >= rule.freeCap) {
          openUpgrade(feature);
          return false;
        }
        return true;
    }
  };

  return { allowed, isPremium, remaining, requireAccess };
}
