'use client';

import { CFUser } from '@/lib/cp/types';
import { PodiumCard } from './podium-card';

interface PodiumSectionProps {
  topThree: CFUser[];
  showPodium: boolean;
}

export function PodiumSection({ topThree, showPodium }: PodiumSectionProps) {
  if (!showPodium || topThree.length < 3) return null;

  return (
    <div className="bg-card/50 dark:bg-card/30 backdrop-blur-sm rounded-2xl border border-border p-6 md:p-8 shadow-sm">
      {/* Desktop/Tablet Podium */}
      <div className="hidden sm:flex justify-center items-end gap-4 pt-2">
        <PodiumCard user={topThree[1]} position={2} index={1} />
        <PodiumCard user={topThree[0]} position={1} index={0} />
        <PodiumCard user={topThree[2]} position={3} index={2} />
      </div>

      {/* Mobile Simplified Podium */}
      <div className="sm:hidden flex justify-center items-center gap-4">
        {topThree.map((user, index) => (
          <a
            key={user.handle}
            href={user.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 group"
          >
            <div className="relative">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                index === 0 
                  ? 'from-amber-400 via-yellow-300 to-amber-500' 
                  : index === 1 
                  ? 'from-slate-300 via-gray-200 to-slate-400'
                  : 'from-amber-600 via-orange-400 to-amber-700'
              } p-0.5 ring-2 ring-background group-hover:ring-primary transition-all`}>
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.handle}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    <span className="font-bold text-lg text-foreground">
                      {user.handle.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${
                index === 0 
                  ? 'bg-amber-500 text-white' 
                  : index === 1 
                  ? 'bg-slate-400 text-white'
                  : 'bg-amber-600 text-white'
              }`}>
                <span className="text-xs font-bold">{index + 1}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-xs text-foreground group-hover:underline truncate max-w-[80px]">
                {user.handle}
              </div>
              <div className="text-[10px] font-mono font-bold text-muted-foreground">
                {user.maxRating}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
