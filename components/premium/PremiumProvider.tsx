"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { FeatureKey } from "@/lib/premium/tiers";
import { PADDLE_CHECKOUT_COMPLETED_EVENT } from "@/lib/paddle/client";
import { UpgradeDialog } from "./UpgradeDialog";

/**
 * Client-side premium entitlement.
 *
 * ⚠️ Phase 1: `isPremium` is read from localStorage and is NOT a secure, server-verified
 * entitlement — it can be toggled by the user. This is enough for the freemium UX and for
 * Paddle *domain approval* (which reviews the website, not a live billing backend). Phase 2
 * replaces this with user accounts + a subscription record updated via Paddle webhooks.
 */

const STORAGE_KEY = "cm_premium_v1";

type PremiumRecord = {
  active: boolean;
  /** epoch ms; undefined = no expiry (manual/dev). */
  expiresAt?: number;
};

interface PremiumContextValue {
  isPremium: boolean;
  /** true until the stored flag has been read on the client (avoids hydration flashes). */
  ready: boolean;
  /** Open the upgrade dialog, optionally noting which feature triggered it. */
  openUpgrade: (feature?: FeatureKey) => void;
  /** Mark the current browser as premium (checkout success / dev toggle). */
  activatePremium: (opts?: { expiresAt?: number }) => void;
  /** Clear the local premium flag. */
  deactivatePremium: () => void;
}

const PremiumContext = createContext<PremiumContextValue | null>(null);

function readRecord(): PremiumRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PremiumRecord;
    if (!parsed?.active) return null;
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [ready, setReady] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [triggerFeature, setTriggerFeature] = useState<FeatureKey | undefined>();

  const refresh = useCallback(() => {
    setIsPremium(Boolean(readRecord()));
    setReady(true);
  }, []);

  const activatePremium = useCallback<PremiumContextValue["activatePremium"]>(
    (opts) => {
      if (typeof window === "undefined") return;
      const record: PremiumRecord = { active: true, expiresAt: opts?.expiresAt };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      } catch {
        /* ignore storage errors */
      }
      setIsPremium(true);
      setDialogOpen(false);
    },
    []
  );

  const deactivatePremium = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
    setIsPremium(false);
  }, []);

  const openUpgrade = useCallback((feature?: FeatureKey) => {
    setTriggerFeature(feature);
    setDialogOpen(true);
  }, []);

  // Read stored flag on mount, and keep in sync across tabs.
  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  // Flip premium on a successful Paddle checkout (Phase 1 bridge).
  useEffect(() => {
    const onCompleted = () => activatePremium();
    window.addEventListener(PADDLE_CHECKOUT_COMPLETED_EVENT, onCompleted);
    return () =>
      window.removeEventListener(PADDLE_CHECKOUT_COMPLETED_EVENT, onCompleted);
  }, [activatePremium]);

  // Dev-only helpers for testing gates without a live checkout:
  //   window.cmPremium.on() / window.cmPremium.off()
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as { cmPremium?: unknown }).cmPremium = {
      on: () => activatePremium(),
      off: () => deactivatePremium(),
    };
  }, [activatePremium, deactivatePremium]);

  const value = useMemo<PremiumContextValue>(
    () => ({ isPremium, ready, openUpgrade, activatePremium, deactivatePremium }),
    [isPremium, ready, openUpgrade, activatePremium, deactivatePremium]
  );

  return (
    <PremiumContext.Provider value={value}>
      {children}
      <UpgradeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        feature={triggerFeature}
      />
    </PremiumContext.Provider>
  );
}

export function usePremiumContext(): PremiumContextValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) {
    throw new Error("usePremium must be used within a <PremiumProvider>");
  }
  return ctx;
}
