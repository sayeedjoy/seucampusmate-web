import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small "Premium" chip to mark a locked / premium-only surface.
 */
export function PremiumBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400",
        className
      )}
    >
      <Crown className="h-3 w-3" />
      Premium
    </span>
  );
}
