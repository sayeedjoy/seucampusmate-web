'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Star } from 'lucide-react';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { cn } from '@/lib/utils';

export function Hero() {
  const [count, setCount] = useState(0);
  const targetCount = 10000;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = targetCount / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setCount(targetCount);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  const formatCount = (num: number) => {
    if (num >= 10000) return '10K+';
    if (num >= 1000) return `${Math.floor(num / 1000)}K+`;
    return num.toLocaleString();
  };

  const gridMaskStyle: React.CSSProperties = {
    backgroundImage:
      'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 0',
    maskImage:
      'repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)',
    WebkitMaskImage:
      'repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)',
    maskComposite: 'intersect',
    WebkitMaskComposite: 'source-in',
  };

  return (
    <section className="relative bg-background min-h-[60vh] sm:min-h-[70vh] lg:min-h-fit w-full pt-8 pb-2 sm:pt-10 sm:pb-4 md:pt-12 md:pb-5 lg:pt-16 lg:pb-0 xl:pt-20 xl:pb-0">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={gridMaskStyle}
        aria-hidden
      />
      <div className="relative z-20 mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-center">
          <div className="order-1 lg:order-1 space-y-5 sm:space-y-6 md:space-y-7 text-center lg:text-left px-4 sm:px-6 md:px-0">
            <div className="flex justify-center lg:justify-start">
              <div
                className={cn(
                  "group rounded-full border border-black/5 bg-neutral-100 text-base transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                )}
              >
                <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                  <span>✨ v12 released</span>
                </AnimatedShinyText>
              </div>
            </div>
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <h1 className="text-[32px] leading-[38px] sm:text-[40px] sm:leading-[48px] md:text-[48px] md:leading-[56px] lg:text-[52px] lg:leading-[60px] lg:whitespace-nowrap xl:text-[60px] xl:leading-[68px] 2xl:text-[64px] 2xl:leading-[72px] font-bold tracking-[-0.02em] text-foreground">Your Academic Companion</h1>
              <p className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] md:text-[20px] md:leading-[30px] text-muted-foreground max-w-2xl mx-auto lg:mx-0">Track attendance, calculate CGPA, manage routines, and stay connected with your SEU community. Everything you need for academic success in one place.</p>
            </div>
            <div className="flex justify-center lg:justify-start pt-1 sm:pt-2">
              <a href="https://play.google.com/store/apps/details?id=com.apppulse.seu&hl=en" target="_blank" rel="noopener noreferrer" className="group inline-block transition-all duration-300 transform hover:scale-105 hover:shadow-lg min-h-[44px] min-w-[152px]" aria-label="Download CampusMate on Google Play">
                <Image src="/google-play.webp" alt="Get it on Google Play" width={180} height={54} className="h-11 sm:h-12 md:h-14 lg:h-16 w-auto object-contain" priority />
              </a>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-5 md:gap-6 pt-3 sm:pt-4 md:pt-5">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <TooltipProvider>
                  <AvatarGroup className="grayscale">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border-2 border-background min-w-[24px] min-h-[24px]">
                          <AvatarImage src="/model/jihad-68b7340f77d12.webp" alt="Jihad" />
                          <AvatarFallback>J</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent><p>Jihad</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border-2 border-background min-w-[24px] min-h-[24px]">
                          <AvatarImage src="/model/rafi-68b7340e7054e.webp" alt="Rafi" />
                          <AvatarFallback>R</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent><p>Rafi</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border-2 border-background min-w-[24px] min-h-[24px]">
                          <AvatarImage src="/model/tomal-68b73419de9bc.webp" alt="Tomal" />
                          <AvatarFallback>T</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent><p>Tomal</p></TooltipContent>
                    </Tooltip>
                    <AvatarGroupCount className="!size-6 sm:!size-7 md:!size-8 text-xs sm:text-sm">+3</AvatarGroupCount>
                  </AvatarGroup>
                </TooltipProvider>
                <div className="text-left">
                  <span className="text-[16px] leading-[20px] sm:text-[18px] md:text-[20px] font-bold text-foreground">{formatCount(count)}</span>
                  <p className="text-[12px] leading-[16px] sm:text-[14px] md:text-[15px] text-muted-foreground">students trust us</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex items-center gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400" aria-hidden="true" />)}</div>
                <span className="text-[13px] sm:text-[14px] md:text-[15px] font-medium text-muted-foreground">4.9/5</span>
              </div>
            </div>
          </div>
          <div className="order-2 lg:order-2 relative flex justify-center lg:justify-end lg:pl-12 px-4 sm:px-6 md:px-0">
            <div className="relative animate-float will-change-transform">
              <Image src="/hero-light.webp" alt="SEU CampusMate App Preview" width={480} height={960} className="w-full max-w-[240px] h-auto sm:max-w-[280px] md:max-w-[320px] lg:w-[360px] lg:max-w-none xl:w-[400px] 2xl:w-[440px] object-contain" priority />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
