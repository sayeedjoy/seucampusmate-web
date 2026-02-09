'use client';

import { CFUser } from '@/lib/cp/types';
import { PodiumCard } from './podium-card';
import { ratingColor, ratingColorBg } from '@/lib/cp/colors';
import { getMaxRankTitle } from '@/lib/cp/ranks';

interface PodiumSectionProps {
  topThree: CFUser[];
  showPodium: boolean;
}

const positionConfig = {
  0: {
    gradient: 'from-amber-400 via-yellow-300 to-amber-500',
    badge: 'bg-amber-500',
  },
  1: {
    gradient: 'from-slate-300 via-gray-200 to-slate-400',
    badge: 'bg-slate-400',
  },
  2: {
    gradient: 'from-amber-600 via-orange-400 to-amber-700',
    badge: 'bg-amber-600',
  },
} as const;

export function PodiumSection({ topThree, showPodium }: PodiumSectionProps) {
  if (!showPodium || topThree.length < 3) return null;

  return (
    <div className="bg-card/50 dark:bg-card/30 backdrop-blur-sm rounded-2xl border border-border p-4 md:p-8 shadow-sm">
      {/* Desktop/Tablet Podium */}
      <div className="hidden sm:flex justify-center items-end gap-4 pt-2">
        <PodiumCard user={topThree[1]} position={2} index={1} />
        <PodiumCard user={topThree[0]} position={1} index={0} />
        <PodiumCard user={topThree[2]} position={3} index={2} />
      </div>

      {/* Mobile Podium Style */}
      <div className="sm:hidden">
        <div className="flex justify-center items-end gap-2 pt-2">
          {/* 2nd Place */}
          <div className="flex flex-col items-center flex-1 max-w-[28%]">
            <a
              href={topThree[1].profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center w-full group"
            >
              <div className="relative mb-2">
                <div className={`absolute inset-0 bg-gradient-to-br ${positionConfig[1].gradient} rounded-full blur-sm opacity-60 dark:opacity-40`} />
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${positionConfig[1].gradient} p-0.5 relative`}>
                  {topThree[1].avatarUrl ? (
                    <img
                      src={topThree[1].avatarUrl}
                      alt={topThree[1].handle}
                      className="w-full h-full rounded-full object-cover border-2 border-background"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                      <span className={`font-bold text-base ${ratingColor(topThree[1].maxRating)}`}>
                        {topThree[1].handle.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${positionConfig[1].badge} flex items-center justify-center shadow-lg`}>
                  <span className="text-[10px] font-bold text-white">2</span>
                </div>
              </div>
              <div className={`font-semibold text-xs ${ratingColor(topThree[1].maxRating)} truncate max-w-[80px] text-center group-hover:underline`}>
                {topThree[1].handle}
              </div>
              <div className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${ratingColorBg(topThree[1].maxRating)} ${ratingColor(topThree[1].maxRating)} border border-border`}>
                {topThree[1].maxRating}
              </div>
              <div className={`mt-0.5 text-[9px] ${ratingColor(topThree[1].maxRating)} font-medium truncate max-w-[80px] text-center`}>
                {getMaxRankTitle(topThree[1].maxRating)}
              </div>
              <div className={`mt-2 w-full h-20 rounded-t-lg bg-gradient-to-b ${positionConfig[1].gradient} flex items-start justify-center pt-2 shadow-lg`}>
                <span className="text-white text-sm">🥈</span>
              </div>
            </a>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center flex-1 max-w-[38%]">
            <a
              href={topThree[0].profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center w-full group"
            >
              <div className="relative mb-2">
                <div className={`absolute inset-0 bg-gradient-to-br ${positionConfig[0].gradient} rounded-full blur-sm opacity-60 dark:opacity-40`} />
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${positionConfig[0].gradient} p-0.5 relative`}>
                  {topThree[0].avatarUrl ? (
                    <img
                      src={topThree[0].avatarUrl}
                      alt={topThree[0].handle}
                      className="w-full h-full rounded-full object-cover border-2 border-background"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                      <span className={`font-bold text-lg ${ratingColor(topThree[0].maxRating)}`}>
                        {topThree[0].handle.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${positionConfig[0].badge} flex items-center justify-center shadow-lg`}>
                  <span className="text-xs font-bold text-white">1</span>
                </div>
              </div>
              <div className={`font-bold text-sm ${ratingColor(topThree[0].maxRating)} truncate max-w-[100px] text-center group-hover:underline`}>
                {topThree[0].handle}
              </div>
              <div className={`mt-1 px-2.5 py-1 rounded-full text-xs font-bold ${ratingColorBg(topThree[0].maxRating)} ${ratingColor(topThree[0].maxRating)} border border-border`}>
                {topThree[0].maxRating}
              </div>
              <div className={`mt-0.5 text-[10px] ${ratingColor(topThree[0].maxRating)} font-medium truncate max-w-[100px] text-center`}>
                {getMaxRankTitle(topThree[0].maxRating)}
              </div>
              <div className={`mt-2 w-full h-28 rounded-t-lg bg-gradient-to-b ${positionConfig[0].gradient} flex items-start justify-center pt-3 shadow-lg`}>
                <span className="text-white text-lg">🏆</span>
              </div>
            </a>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center flex-1 max-w-[28%]">
            <a
              href={topThree[2].profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center w-full group"
            >
              <div className="relative mb-2">
                <div className={`absolute inset-0 bg-gradient-to-br ${positionConfig[2].gradient} rounded-full blur-sm opacity-60 dark:opacity-40`} />
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${positionConfig[2].gradient} p-0.5 relative`}>
                  {topThree[2].avatarUrl ? (
                    <img
                      src={topThree[2].avatarUrl}
                      alt={topThree[2].handle}
                      className="w-full h-full rounded-full object-cover border-2 border-background"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                      <span className={`font-bold text-sm ${ratingColor(topThree[2].maxRating)}`}>
                        {topThree[2].handle.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${positionConfig[2].badge} flex items-center justify-center shadow-lg`}>
                  <span className="text-[10px] font-bold text-white">3</span>
                </div>
              </div>
              <div className={`font-semibold text-xs ${ratingColor(topThree[2].maxRating)} truncate max-w-[80px] text-center group-hover:underline`}>
                {topThree[2].handle}
              </div>
              <div className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${ratingColorBg(topThree[2].maxRating)} ${ratingColor(topThree[2].maxRating)} border border-border`}>
                {topThree[2].maxRating}
              </div>
              <div className={`mt-0.5 text-[9px] ${ratingColor(topThree[2].maxRating)} font-medium truncate max-w-[80px] text-center`}>
                {getMaxRankTitle(topThree[2].maxRating)}
              </div>
              <div className={`mt-2 w-full h-16 rounded-t-lg bg-gradient-to-b ${positionConfig[2].gradient} flex items-start justify-center pt-2 shadow-lg`}>
                <span className="text-white text-sm">🥉</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
