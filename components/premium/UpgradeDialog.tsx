"use client";

import Link from "next/link";
import { Sparkles, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePaddle } from "@/hooks/use-paddle";
import { FEATURES, PREMIUM_BENEFITS, type FeatureKey } from "@/lib/premium/tiers";

/**
 * Presentational upgrade prompt. State is owned by {@link PremiumProvider}, which renders a
 * single instance of this dialog and opens it via `openUpgrade(feature)`.
 */
export function UpgradeDialog({
  open,
  onOpenChange,
  feature,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: FeatureKey;
}) {
  const { openCheckout, loading } = usePaddle();
  const featureConfig = feature ? FEATURES[feature] : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle>
            {featureConfig
              ? `Unlock ${featureConfig.label}`
              : "Upgrade to CampusMate Premium"}
          </DialogTitle>
          <DialogDescription>
            {featureConfig?.premiumBenefit ??
              "Get unlimited access to every CampusMate tool."}{" "}
            You&apos;ve reached the free plan limit.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 py-2">
          {PREMIUM_BENEFITS.slice(0, 5).map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="w-full"
            disabled={loading}
            onClick={() => openCheckout("monthly")}
          >
            {loading ? "Opening checkout…" : "Upgrade to Premium"}
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/pricing" onClick={() => onOpenChange(false)}>
              See all plans &amp; pricing
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
