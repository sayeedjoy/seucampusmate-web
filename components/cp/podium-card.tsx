'use client';

import { CFUser } from '@/lib/cp/types';
import { ratingColor, ratingColorBg, ratingColorBorder } from '@/lib/cp/colors';
import { getMaxRankTitle } from '@/lib/cp/ranks';
import Image from 'next/image';
import { Trophy, Medal, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface PodiumCardProps {
  user: CFUser;
  position: 1 | 2 | 3;
  index: number;
}

const positionConfig = {
  1: {
    gradient: 'from-amber-400 via-yellow-300 to-amber-500',
    border: 'border-amber-300 dark:border-amber-600/50',
    shadow: 'shadow-amber-200/50 dark:shadow-amber-900/30',
    icon: <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    label: '1st',
    height: 'h-32',
    avatarSize: 'w-20 h-20',
    order: 'order-2',
  },
  2: {
    gradient: 'from-slate-300 via-gray-200 to-slate-400',
    border: 'border-slate-300 dark:border-slate-600/50',
    shadow: 'shadow-slate-200/50 dark:shadow-slate-900/30',
    icon: <Medal className="w-5 h-5 text-slate-500 dark:text-slate-400" />,
    label: '2nd',
    height: 'h-24',
    avatarSize: 'w-16 h-16',
    order: 'order-1',
  },
  3: {
    gradient: 'from-amber-600 via-orange-400 to-amber-700',
    border: 'border-amber-500 dark:border-amber-700/50',
    shadow: 'shadow-amber-300/50 dark:shadow-amber-900/30',
    icon: <Award className="w-5 h-5 text-amber-700 dark:text-amber-500" />,
    label: '3rd',
    height: 'h-20',
    avatarSize: 'w-14 h-14',
    order: 'order-3',
  },
} as const;

export function PodiumCard({ user, position, index }: PodiumCardProps) {
  const style = positionConfig[position];
  const prefersReducedMotion = useReducedMotion();

  const MotionDiv = prefersReducedMotion ? 'div' : motion.div;
  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { 
          duration: 0.4,
          delay: index * 0.1,
          ease: [0.25, 0.1, 0.25, 1] as const
        }
      };

  return (
    <MotionDiv
      className={`${style.order} flex flex-col items-center`}
      {...motionProps}
    >
      {/* Avatar with gradient ring */}
      <div className="relative mb-3">
        <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} rounded-full blur-sm opacity-60 dark:opacity-40`} />
        <div className={`relative ${style.avatarSize} rounded-full bg-gradient-to-br ${style.gradient} p-0.5`}>
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.handle}
              width={80}
              height={80}
              className="w-full h-full rounded-full object-cover border-2 border-background"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <span className={`${ratingColor(user.maxRating)} font-bold text-lg`}>
                {user.handle.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        {/* Position badge */}
        <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-lg ${style.shadow}`}>
          <span className="text-xs font-bold text-white drop-shadow">{position}</span>
        </div>
      </div>

      {/* User info */}
      <a
        href={user.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`font-bold text-sm md:text-base ${ratingColor(user.maxRating)} hover:underline transition-all truncate max-w-[120px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded`}
      >
        {user.handle}
      </a>

      {/* Rating badge */}
      <div className={`mt-1.5 px-3 py-1 rounded-full ${ratingColorBg(user.maxRating)} ${ratingColorBorder(user.maxRating)} border`}>
        <span className={`font-mono font-bold text-sm ${ratingColor(user.maxRating)}`}>
          {user.maxRating}
        </span>
      </div>

      {/* Rank title */}
      <span className={`mt-1 text-xs ${ratingColor(user.maxRating)} font-medium`}>
        {getMaxRankTitle(user.maxRating)}
      </span>

      {/* Podium base */}
      <div className={`mt-3 w-28 md:w-32 ${style.height} rounded-t-xl bg-gradient-to-b ${style.gradient} flex items-start justify-center pt-3 shadow-lg ${style.shadow}`}>
        {style.icon}
      </div>
    </MotionDiv>
  );
}
