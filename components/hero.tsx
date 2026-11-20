'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MotionConfig, motion } from 'motion/react';
import { HeroPhone } from '@/components/hero-phone';
import { HeroWidgets } from '@/components/hero-widgets';
import { cn } from '@/lib/utils';

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.apppulse.seu&hl=en';

// One page-load sequence: copy, then the widget wall, then the phone.
const rise = (delay: number, y = 16) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: EASE },
});

export function Hero() {
  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-labelledby="hero-title"
        className="relative w-full overflow-hidden bg-background pt-12 sm:pt-16 lg:pt-20"
      >
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:px-8">
          {/* Copy */}
          <motion.div className="relative z-20 max-w-[34rem] lg:col-start-1 lg:row-start-1" {...rise(0)}>
            {/* Context before the claim. A label, not a link: no arrow, no hover. */}
            {/* A solid chip inside a soft pill, 4px in on every side (32px pill, 24px chip) */}
            <p className="inline-flex h-8 items-center gap-2.5 rounded-full border border-foreground/[0.06] bg-foreground/[0.04] pl-1 pr-3.5 text-[13.5px] font-medium leading-none text-foreground/85 dark:border-white/10 dark:bg-white/[0.06]">
              <span className="inline-flex h-6 items-center rounded-full bg-foreground px-2.5 text-[12px] font-semibold text-background">
                10K+
              </span>
              SEU students use it
            </p>
            <h1
              id="hero-title"
              className="mt-5 text-balance text-[44px] font-bold leading-[1.04] tracking-[-0.04em] text-foreground sm:text-[56px] lg:text-[64px]"
            >
              Your SEU semester, sorted.
            </h1>
            <p className="mt-4 max-w-[26rem] text-pretty text-base leading-relaxed text-muted-foreground sm:text-[17px]">
              CGPA, attendance and exam rooms for SEU students, in one app.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a
                href={PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg transition-transform duration-150 ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-label="Get CampusMate on Google Play (opens in a new tab)"
              >
                <Image
                  src="/google-play.webp"
                  alt=""
                  width={140}
                  height={42}
                  className="h-11 w-auto object-contain"
                  style={{ width: 'auto' }}
                  priority
                  fetchPriority="high"
                />
              </a>
              <Link
                href="/#features"
                className="rounded-sm text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Or use the tools on the web
              </Link>
            </div>
          </motion.div>

          {/* Scene: a block on small screens (tiles behind the phone); on lg its
              children join the grid, so the wall sits under the copy and slides
              beneath the phone. */}
          <div className="relative mt-10 lg:contents">
            <motion.div
              className={cn(
                // Small screens: the 960px design shifted so the CGPA and attendance tiles sit mid-screen
                'relative left-1/2 z-0 w-[960px] -translate-x-[calc(50%_-_90px)]',
                '[mask-image:linear-gradient(to_right,transparent_12%,#000_24%,#000_58%,transparent_68%)]',
                'lg:left-0 lg:col-start-1 lg:row-start-2 lg:mt-4 lg:-ml-[100px] lg:-mr-[200px] lg:w-auto lg:translate-x-0',
                'lg:[mask-image:linear-gradient(to_right,transparent_2%,#000_28%)]',
              )}
              {...rise(0.15, 24)}
            >
              <HeroWidgets />
            </motion.div>

            {/* The app, live. The stage is transparent around the phone, so the
                wall shows through beside it; xl/lg: the 560px stage draws its
                380px phone 90px in from each side (hero-phone.css). */}
            <motion.div
              className="relative z-10 mx-auto -mt-6 w-full max-w-[358px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:-mx-[90px] lg:mt-16 lg:w-[560px] lg:max-w-none"
              {...rise(0.3, 32)}
              role="img"
              aria-label="The CampusMate app: the CGPA card opens into the calculator, a grade is picked and the CGPA updates"
            >
              <HeroPhone />
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
