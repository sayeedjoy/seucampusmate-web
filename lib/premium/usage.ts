/**
 * Client-side monthly usage counters for free-tier limits, backed by localStorage.
 *
 * Phase 1 only: this tracks how many times a free user has used a limited feature
 * in the current calendar month. It is best-effort (per-browser, clearable) and is
 * replaced by server-side, per-user metering in Phase 2.
 */

import type { FeatureKey } from "./tiers";

const STORAGE_KEY = "cm_usage_v1";

type UsageStore = Record<string, number>;

/** e.g. "resumePdf:2026-11" */
function currentPeriodKey(feature: FeatureKey, date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${feature}:${year}-${month}`;
}

function readStore(): UsageStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as UsageStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: UsageStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable — fail open, limits simply won't persist */
  }
}

/** How many times the feature has been used this month. */
export function getUsage(feature: FeatureKey): number {
  const store = readStore();
  return store[currentPeriodKey(feature)] ?? 0;
}

/** Uses remaining this month given a free limit (never negative). */
export function getRemaining(feature: FeatureKey, freeLimit: number): number {
  return Math.max(0, freeLimit - getUsage(feature));
}

/** Whether a free user may use the feature once more this month. */
export function canUse(feature: FeatureKey, freeLimit: number): boolean {
  return getUsage(feature) < freeLimit;
}

/** Record one use of the feature for the current month. Returns the new count. */
export function incrementUsage(feature: FeatureKey): number {
  const store = readStore();
  const key = currentPeriodKey(feature);
  const next = (store[key] ?? 0) + 1;
  store[key] = next;
  writeStore(store);
  return next;
}
