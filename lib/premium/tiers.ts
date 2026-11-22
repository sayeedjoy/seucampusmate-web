/**
 * Freemium tier configuration — single source of truth for what is free vs premium
 * and the usage limits applied to free users.
 *
 * NOTE (Phase 1): premium entitlement is currently a client-side flag (see
 * `components/premium/PremiumProvider.tsx`). It is intentionally NOT tamper-proof.
 * Server-side, per-user enforcement arrives in Phase 2 together with real user accounts.
 * Keep all tier rules here so tools never hardcode limits.
 */

export type FeatureKey =
  | "resumePdf"
  | "coverpagePdf"
  | "marksTracker"
  | "chatbot"
  | "examRoutinePdf";

/** How a feature is gated for free users. */
export type FeatureRule =
  /** Premium-only: free users are always blocked. */
  | { kind: "premiumOnly" }
  /** Free users get `freeLimit` uses per calendar month; premium is unlimited. */
  | { kind: "monthlyLimit"; freeLimit: number }
  /** Free users can hold at most `freeCap` items at once; premium is unlimited. */
  | { kind: "itemCap"; freeCap: number };

export interface FeatureConfig {
  /** Human-readable name shown in upgrade prompts. */
  label: string;
  /** Short line describing what premium unlocks for this feature. */
  premiumBenefit: string;
  rule: FeatureRule;
}

// Tunable free-tier limits (keep in one place).
export const FREE_RESUME_PDF_PER_MONTH = 2;
export const FREE_COVERPAGE_PDF_PER_MONTH = 3;
export const FREE_MARKS_MAX_COURSES = 5;

export const FEATURES: Record<FeatureKey, FeatureConfig> = {
  resumePdf: {
    label: "Resume PDF export",
    premiumBenefit: "Export unlimited resume PDFs.",
    rule: { kind: "monthlyLimit", freeLimit: FREE_RESUME_PDF_PER_MONTH },
  },
  coverpagePdf: {
    label: "Cover page PDF export",
    premiumBenefit: "Generate unlimited cover pages and premium templates.",
    rule: { kind: "monthlyLimit", freeLimit: FREE_COVERPAGE_PDF_PER_MONTH },
  },
  marksTracker: {
    label: "Assessment tracking",
    premiumBenefit: "Track an unlimited number of courses per semester.",
    rule: { kind: "itemCap", freeCap: FREE_MARKS_MAX_COURSES },
  },
  chatbot: {
    label: "AI assistant",
    premiumBenefit: "Chat without the hourly message limit.",
    rule: { kind: "premiumOnly" },
  },
  examRoutinePdf: {
    label: "Exam routine PDF export",
    premiumBenefit: "Download your exam routine as a PDF.",
    rule: { kind: "premiumOnly" },
  },
};

/** The feature benefits advertised on the Pricing page and the upgrade dialog. */
export const PREMIUM_BENEFITS: readonly string[] = [
  "Unlimited resume builder PDF exports",
  "Unlimited cover page generator exports",
  "Unlimited AI assistant messages",
  "Unlimited assessment / marks tracking",
  "Exam routine PDF export",
  "Ad-free experience (coming soon)",
  "Priority access to new tools",
] as const;
