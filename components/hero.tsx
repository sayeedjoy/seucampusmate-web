'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Star, Download } from 'lucide-react';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { AuroraText } from '@/components/ui/aurora-text';
import { cn } from '@/lib/utils';

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: EASE },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay, ease: EASE },
  }),
};

export function Hero() {
  const [count, setCount] = useState(0);
  const targetCount = 10000;

  useEffect(() => {
    const duration = 2000;
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);
      setCount(Math.floor(easedProgress * targetCount));
      if (progress < 1) animationFrameId = requestAnimationFrame(animate);
    };

    const timeoutId = setTimeout(() => {
      animationFrameId = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const formatCount = (num: number) => {
    if (num >= 10000) return '10K+';
    if (num >= 1000) return `${Math.floor(num / 1000)}K+`;
    return num.toLocaleString();
  };

  return (
    <section className="relative bg-background min-h-[60vh] sm:min-h-[70vh] lg:min-h-fit w-full pt-8 pb-2 sm:pt-10 sm:pb-4 md:pt-12 md:pb-5 lg:pt-16 lg:pb-0 xl:pt-20 xl:pb-0 overflow-hidden">

      {/* Background glow blobs */}
      <div className="absolute -top-20 left-1/4 -translate-x-1/2 w-[500px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" aria-hidden />
      <div className="absolute top-10 right-0 w-[400px] h-[500px] bg-primary/6 rounded-full blur-3xl pointer-events-none" aria-hidden />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 0%, #000 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 0%, #000 50%, transparent 100%)',
        }}
        aria-hidden
      />

      <div className="relative z-20 mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-center">

          {/* Left: Text content */}
          <div className="order-1 space-y-5 sm:space-y-6 text-center lg:text-left px-4 sm:px-6 md:px-0">

            {/* Badge */}
            <motion.div
              className="flex justify-center lg:justify-start"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
            >
              <div className={cn(
                "group rounded-full border border-black/5 bg-neutral-100 text-sm transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              )}>
                <AnimatedShinyText className="inline-flex items-center justify-center px-3.5 py-1 whitespace-nowrap transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                  <span>✨ 10K+ SEU Students Trust Us</span>
                </AnimatedShinyText>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.1}
            >
              <h1 className="text-[36px] leading-[44px] sm:text-[48px] sm:leading-[56px] md:text-[56px] md:leading-[64px] lg:text-[60px] lg:leading-[68px] xl:text-[68px] xl:leading-[76px] 2xl:text-[76px] 2xl:leading-[84px] font-bold tracking-[-0.02em] text-foreground lg:whitespace-nowrap">
                Your{' '}
                <AuroraText colors={['#f59e0b', '#f97316', '#eab308', '#fb923c']} speed={0.8}>
                  SEU Buddy
                </AuroraText>
              </h1>
            </motion.div>

            {/* Subheading */}
            <motion.p
              className="text-[14px] leading-[22px] sm:text-[16px] sm:leading-[26px] md:text-[17px] md:leading-[28px] text-muted-foreground max-w-sm sm:max-w-lg mx-auto lg:mx-0"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.2}
            >
              Track attendance, calculate CGPA, manage routines, and stay connected with your SEU community — everything for academic success.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-row flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.3}
            >
              <a
                href="https://play.google.com/store/apps/details?id=com.apppulse.seu&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-all duration-300 hover:scale-105 hover:shadow-lg"
                aria-label="Download CampusMate on Google Play"
              >
                <Image
                  src="/google-play.webp"
                  alt="Get it on Google Play"
                  width={160}
                  height={48}
                  className="h-10 sm:h-11 md:h-12 w-auto object-contain"
                  priority
                  fetchPriority="high"
                />
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              className="flex flex-row flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 pt-2"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.4}
            >
              {/* Avatar group + count */}
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <AvatarGroup>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="w-7 h-7 border-2 border-background">
                          <AvatarImage src="/model/jihad-68b7340f77d12.webp" alt="Jihad" />
                          <AvatarFallback>J</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent><p>Jihad</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="w-7 h-7 border-2 border-background">
                          <AvatarImage src="/model/rafi-68b7340e7054e.webp" alt="Rafi" />
                          <AvatarFallback>R</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent><p>Rafi</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="w-7 h-7 border-2 border-background">
                          <AvatarImage src="/model/tomal-68b73419de9bc.webp" alt="Tomal" />
                          <AvatarFallback>T</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent><p>Tomal</p></TooltipContent>
                    </Tooltip>
                    <AvatarGroupCount className="!size-7 text-xs">+3</AvatarGroupCount>
                  </AvatarGroup>
                </TooltipProvider>
                <div className="text-left">
                  <span className="text-[15px] font-bold text-foreground leading-none">{formatCount(count)}</span>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">students</p>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-6 bg-border" aria-hidden />

              {/* Stars */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400" aria-hidden="true" />
                  ))}
                </div>
                <div className="text-left">
                  <span className="text-[15px] font-semibold text-foreground leading-none">4.9/5</span>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">rating</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Phone mockup */}
          <motion.div
            className="order-2 relative flex justify-center lg:justify-end lg:pl-12"
            variants={scaleIn}
            initial="hidden"
            animate="show"
            custom={0.15}
          >
            {/* Glow halo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
              <div className="w-[55%] h-[65%] bg-primary/20 rounded-full blur-3xl" />
            </div>

            <div className="relative animate-float will-change-transform mx-10 sm:mx-14 md:mx-0">
              <Image
                src="/hero-light.webp"
                alt="SEU CampusMate App Preview"
                width={480}
                height={960}
                className="w-full max-w-[200px] h-auto sm:max-w-[260px] md:max-w-[300px] lg:w-[340px] lg:max-w-none xl:w-[380px] 2xl:w-[420px] object-contain relative z-10"
                priority
              />

              {/* Floating stat: Downloads — hidden on xs */}
              <motion.div
                className="hidden sm:flex absolute -left-10 md:-left-12 top-[18%] z-20 items-center gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-full px-3 py-2 shadow-md"
                variants={scaleIn}
                initial="hidden"
                animate="show"
                custom={0.6}
              >
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Download className="w-3 h-3 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-foreground leading-none">10K+</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Downloads</p>
                </div>
              </motion.div>

              {/* Floating stat: Rating — hidden on xs */}
              <motion.div
                className="hidden sm:flex absolute -right-10 md:-right-12 bottom-[22%] z-20 items-center gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-full px-3 py-2 shadow-md"
                variants={scaleIn}
                initial="hidden"
                animate="show"
                custom={0.75}
              >
                <div className="w-6 h-6 rounded-full bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-foreground leading-none">4.9 / 5</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">App Rating</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
