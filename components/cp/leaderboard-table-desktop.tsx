'use client';

import { CFUser } from '@/lib/cp/types';
import { ratingColor, ratingColorBg, ratingColorBorder } from '@/lib/cp/colors';
import { getMaxRankTitle } from '@/lib/cp/ranks';
import Image from 'next/image';
import { ExternalLink, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface LeaderboardTableDesktopProps {
  users: CFUser[];
  startRank?: number;
}

export function LeaderboardTableDesktop({ users, startRank = 1 }: LeaderboardTableDesktopProps) {
  const prefersReducedMotion = useReducedMotion();

  const getRatingDelta = (user: CFUser) => {
    const delta = user.maxRating - user.currentRating;
    if (delta === 0) return { icon: Minus, color: 'text-muted-foreground', text: '0' };
    if (delta > 0) return { icon: TrendingDown, color: 'text-orange-500 dark:text-orange-400', text: `-${delta}` };
    return { icon: TrendingUp, color: 'text-green-500 dark:text-green-400', text: `+${Math.abs(delta)}` };
  };

  return (
    <div className="hidden sm:block bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-muted via-muted/80 to-muted border-b border-border">
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Rating</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Activity</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user, index) => {
              const rank = startRank + index;
              const delta = getRatingDelta(user);
              const DeltaIcon = delta.icon;

              const MotionTr = prefersReducedMotion ? 'tr' : motion.tr;
              const motionProps = prefersReducedMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 10 },
                    animate: { opacity: 1, y: 0 },
                    transition: { 
                      duration: 0.3,
                      delay: index * 0.03,
                      ease: [0.25, 0.1, 0.25, 1] as const
                    }
                  };

              return (
                <MotionTr
                  key={user.handle}
                  className="hover:bg-muted/50 transition-colors duration-150 group cursor-pointer"
                  {...motionProps}
                >
                  <td className="px-6 py-4">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-foreground group-hover:bg-muted/80 transition-colors">
                      {rank}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={user.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 group/link focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                    >
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.handle}
                          width={40}
                          height={40}
                          className="rounded-full border border-border group-hover/link:border-primary/50 transition-colors"
                        />
                      ) : (
                        <div className={`w-10 h-10 ${ratingColorBg(user.currentRating)} rounded-full flex items-center justify-center`}>
                          <span className={`font-bold ${ratingColor(user.currentRating)}`}>
                            {user.handle.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${ratingColor(user.currentRating)} group-hover/link:underline`}>
                          {user.handle}
                        </span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </div>
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-lg text-foreground">{user.maxRating}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${ratingColorBg(user.maxRating)} ${ratingColor(user.maxRating)} ${ratingColorBorder(user.maxRating)} border`}>
                      {getMaxRankTitle(user.maxRating)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground">{user.currentRating}</span>
                      <div className={`flex items-center gap-0.5 ${delta.color}`}>
                        <DeltaIcon className="w-3 h-3" />
                        <span className="text-xs font-medium">{delta.text}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Zap className={`w-4 h-4 ${(user.recentSolvedCount || 0) > 0 ? 'text-green-500 dark:text-green-400' : 'text-muted-foreground'}`} />
                      <span className={`font-medium ${(user.recentSolvedCount || 0) > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                        {user.recentSolvedCount || 0} solved
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{user.registeredHuman}</span>
                  </td>
                </MotionTr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
