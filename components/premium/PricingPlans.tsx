"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/site.config";
import { usePremium } from "@/hooks/use-premium";
import { usePaddle } from "@/hooks/use-paddle";
import type { BillingCycle } from "@/lib/paddle/client";

type Row = { label: string; free: string | boolean; premium: string | boolean };

const COMPARISON: Row[] = [
  { label: "CGPA & tuition calculators", free: true, premium: true },
  { label: "Exam routine search & view", free: true, premium: true },
  { label: "Academic calendar & blood donors", free: true, premium: true },
  { label: "CP leaderboard & hackathons", free: true, premium: true },
  { label: "AI assistant", free: "3 messages / hour", premium: "Unlimited" },
  { label: "Resume builder PDF export", free: "2 / month", premium: "Unlimited" },
  { label: "Cover page generator export", free: "3 / month", premium: "Unlimited" },
  { label: "Assessment tracking", free: "Up to 5 courses", premium: "Unlimited" },
  { label: "Exam routine PDF export", free: false, premium: true },
  { label: "Ad-free experience", free: false, premium: "Coming soon" },
  { label: "Priority access to new tools", free: false, premium: true },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true)
    return <Check className="h-4 w-4 text-primary" aria-label="Included" />;
  if (value === false)
    return <X className="h-4 w-4 text-muted-foreground/50" aria-label="Not included" />;
  return <span className="text-sm text-muted-foreground">{value}</span>;
}

export function PricingPlans() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const { isPremium } = usePremium();
  const { openCheckout, loading } = usePaddle();
  const { business } = siteConfig;

  const price = cycle === "monthly" ? business.priceMonthly : business.priceYearly;
  const period = cycle === "monthly" ? "/month" : "/year";

  return (
    <div className="space-y-10">
      {/* Billing cycle toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border bg-muted/40 p-1">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCycle(c)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                cycle === c
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Free plan */}
        <div className="flex flex-col rounded-2xl border bg-card p-8">
          <h2 className="text-lg font-semibold text-foreground">Free</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything a student needs to get started.
          </p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-foreground">{business.currency} 0</span>
            <span className="text-muted-foreground">/forever</span>
          </div>
          <Button variant="outline" className="mt-6" asChild>
            <Link href="/tools/cgpa-calculator">Start for free</Link>
          </Button>
        </div>

        {/* Premium plan */}
        <div className="relative flex flex-col rounded-2xl border-2 border-primary bg-card p-8 shadow-lg">
          <span className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            <Crown className="h-3 w-3" /> Most popular
          </span>
          <h2 className="text-lg font-semibold text-foreground">Premium</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Unlimited access to every CampusMate tool.
          </p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-foreground">
              {business.currency} {price}
            </span>
            <span className="text-muted-foreground">{period}</span>
          </div>
          {isPremium ? (
            <Button className="mt-6" disabled>
              You&apos;re on Premium
            </Button>
          ) : (
            <Button
              className="mt-6"
              disabled={loading}
              onClick={() => openCheckout(cycle)}
            >
              {loading ? "Opening checkout…" : "Upgrade to Premium"}
            </Button>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Billed securely by Paddle, our Merchant of Record. Cancel anytime.
          </p>
        </div>
      </div>

      {/* Comparison table */}
      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full text-left">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-foreground sm:px-6">
                Features
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                Free
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                Premium
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {COMPARISON.map((row) => (
              <tr key={row.label}>
                <td className="px-4 py-3 text-sm text-foreground sm:px-6">{row.label}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <Cell value={row.free} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <Cell value={row.premium} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Subscriptions renew automatically until cancelled. See our{" "}
        <Link href="/refund-policy" className="text-primary hover:underline">
          Refund Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>
        {" "}for cancellation and refund details.
      </p>
    </div>
  );
}
