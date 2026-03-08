'use client';

import { CFUser } from '@/lib/cp/types';
import { ratingColor, ratingColorBg, ratingColorBorder } from '@/lib/cp/colors';
import { getMaxRankTitle } from '@/lib/cp/ranks';
import Image from 'next/image';
import { ExternalLink, Zap, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface UserCardProps {
  user: CFUser;
  rank: number;
  index: number;
}

export function UserCard({ user, rank, index }: UserCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const MotionDiv = prefersReducedMotion ? 'div' : motion.div;
  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { 
          duration: 0.3,
          delay: index * 0.05,
          ease: [0.25, 0.1, 0.25, 1] as const
        }
      };

  return (
    <MotionDiv {...motionProps}>
      <a
        href={user.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`block p-4 rounded-xl border ${ratingColorBorder(user.maxRating)} ${ratingColorBg(user.maxRating)} hover:shadow-md transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
      >
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-foreground shadow-sm">
            {rank}
          </div>

          {/* Avatar */}
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.handle}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full border-2 border-background shadow-sm flex-shrink-0"
            />
          ) : (
            <div className={`w-12 h-12 rounded-full ${ratingColorBg(user.maxRating)} flex items-center justify-center flex-shrink-0 border-2 border-background shadow-sm`}>
              <span className={`${ratingColor(user.maxRating)} font-bold text-lg`}>
                {user.handle.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* User info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-bold ${ratingColor(user.currentRating)} truncate`}>
                {user.handle}
              </span>
              <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ratingColorBg(user.maxRating)} ${ratingColor(user.maxRating)}`}>
                {getMaxRankTitle(user.maxRating)}
              </span>
            </div>
          </div>

          {/* Ratings */}
          <div className="flex-shrink-0 text-right">
            <div className="font-mono font-bold text-lg text-foreground">{user.maxRating}</div>
            <div className="text-xs text-muted-foreground">max rating</div>
          </div>
        </div>

        {/* Activity bar */}
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Zap className={`w-3.5 h-3.5 ${(user.recentSolvedCount || 0) > 0 ? 'text-green-500 dark:text-green-400' : 'text-muted-foreground'}`} />
            <span>{user.recentSolvedCount || 0} problems (3 months)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{user.registeredHuman}</span>
          </div>
        </div>
      </a>
    </MotionDiv>
  );
}
