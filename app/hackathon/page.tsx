import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/metadata';
import { listHackathonsSplit } from '@/lib/db/hackathons';
import HackathonClient from './HackathonClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  ...createPageMetadata('hackathon'),
  // Exact document <title> (bypasses the root "%s | SEU CampusMate" template).
  title: { absolute: 'Hackathon Tracker Bangladesh' },
};

export default async function HackathonPage() {
  const { upcoming, past } = await listHackathonsSplit();
  return <HackathonClient upcoming={upcoming} past={past} />;
}
