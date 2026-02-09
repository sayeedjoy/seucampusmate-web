'use client';

import { Pill, PillIcon, PillIndicator } from "@/components/kibo-ui/pill";
import { Users, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LeaderboardStatsProps {
  userCount: number;
  showActiveOnly: boolean;
  cacheAge: number;
  isFallback?: boolean;
  stale?: boolean;
}

export function LeaderboardStats({
  userCount,
  showActiveOnly,
  cacheAge,
  isFallback,
  stale,
}: LeaderboardStatsProps) {
  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      <Pill className="px-2 py-1 border-border text-muted-foreground bg-muted/50 pointer-events-none" variant="secondary">
        <PillIcon icon={Users} className="size-3" />
        <span className="text-[10px] sm:text-xs font-medium">
          <strong className="text-foreground">{userCount}</strong> Users
        </span>
      </Pill>

      <Pill
        className={cn(
          "px-2 py-1 border-border pointer-events-none",
          showActiveOnly ? "text-green-600 dark:text-green-400 bg-green-500/10 dark:bg-green-500/20 border-green-500/30" : "text-muted-foreground bg-muted/50"
        )}
        variant="secondary"
      >
        <PillIcon icon={Zap} className={cn("size-3", showActiveOnly ? "text-green-500" : "text-muted-foreground")} />
        <span className="text-[10px] sm:text-xs font-medium">
          {showActiveOnly ? 'Active' : 'All'}
        </span>
      </Pill>

      <Pill className="px-2 py-1 border-border text-muted-foreground bg-muted/50 pointer-events-none" variant="secondary">
        <PillIndicator
          variant={isFallback ? "info" : stale ? "warning" : "success"}
          pulse={!!isFallback}
        />
        <span className="text-[10px] sm:text-xs font-medium">
          {isFallback ? 'Fallback' : formatTime(cacheAge)}
        </span>
      </Pill>
    </div>
  );
}
