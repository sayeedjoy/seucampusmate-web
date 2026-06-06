'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ArrowUpRight, CalendarDays, CalendarClock, Globe, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Hackathon } from '@/lib/db/schema';

function parseDate(iso: string): Date | null {
  const parsed = new Date(`${iso}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatEventDate(startIso: string, endIso: string | null): string {
  const start = parseDate(startIso);
  if (!start) return startIso;
  const end = endIso ? parseDate(endIso) : null;
  if (!end || endIso === startIso) return format(start, 'd MMMM yyyy');
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${format(start, 'd')}–${format(end, 'd MMMM yyyy')}`;
  }
  return `${format(start, 'd MMM yyyy')} – ${format(end, 'd MMM yyyy')}`;
}

export function HackathonCard({ hackathon }: { hackathon: Hackathon }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {imageFailed ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-background">
            <span className="px-4 text-center text-sm font-medium text-muted-foreground line-clamp-2">
              {hackathon.name}
            </span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hackathon.bannerUrl}
            alt={hackathon.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute left-3 top-3">
          <Badge
            variant="secondary"
            className={cn(
              'gap-1 backdrop-blur-sm',
              hackathon.isOnline ? 'bg-emerald-500/90 text-white' : 'bg-background/85'
            )}
          >
            {hackathon.isOnline ? <Globe className="size-3" /> : <MapPin className="size-3" />}
            {hackathon.isOnline ? 'Online' : 'In person'}
          </Badge>
        </div>
        {hackathon.isPostponed && (
          <div className="absolute right-3 top-3">
            <Badge variant="secondary" className="gap-1 bg-amber-500/90 text-white backdrop-blur-sm">
              <CalendarClock className="size-3" />
              Postponed
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-semibold leading-snug line-clamp-2">{hackathon.name}</h3>
        <p className="text-sm text-muted-foreground">Hosted by {hackathon.host}</p>

        <div className="mt-1 space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0" />
            {formatEventDate(hackathon.eventDate, hackathon.endDate)}
          </p>
          <p className="flex items-center gap-2">
            {hackathon.isOnline ? (
              <>
                <Globe className="size-4 shrink-0" />
                Takes place online
              </>
            ) : (
              <>
                <MapPin className="size-4 shrink-0" />
                <span className="line-clamp-1">{hackathon.location}</span>
              </>
            )}
          </p>
        </div>

        <div className="mt-auto pt-3">
          <Button asChild className="w-full">
            <a href={hackathon.eventLink} target="_blank" rel="noopener noreferrer">
              Visit event
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
