'use client';

import { CalendarClock, History } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HackathonCard } from '@/components/hackathon/HackathonCard';
import type { Hackathon } from '@/lib/db/schema';

type Props = {
  upcoming: Hackathon[];
  past: Hackathon[];
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <CalendarClock className="mb-3 size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function HackathonGrid({ items, emptyMessage }: { items: Hackathon[]; emptyMessage: string }) {
  if (items.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((hackathon) => (
        <HackathonCard key={hackathon.id} hackathon={hackathon} />
      ))}
    </div>
  );
}

export default function HackathonClient({ upcoming, past }: Props) {
  return (
    <Container className="py-10 md:py-14">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Hackathon Tracker Bangladesh</h1>
        <p className="mt-3 text-muted-foreground">
          Discover upcoming and past hackathons across Bangladesh — find the date, venue, and how to
          register, all in one place.
        </p>
      </header>

      <Tabs defaultValue="upcoming" className="mt-10">
        <TabsList className="mx-auto">
          <TabsTrigger value="upcoming">
            <CalendarClock />
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            <History />
            Past ({past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <HackathonGrid
            items={upcoming}
            emptyMessage="No upcoming hackathons right now. Check back soon!"
          />
        </TabsContent>
        <TabsContent value="past" className="mt-6">
          <HackathonGrid items={past} emptyMessage="No past hackathons to show yet." />
        </TabsContent>
      </Tabs>
    </Container>
  );
}
