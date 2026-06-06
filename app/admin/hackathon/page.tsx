import { listHackathons } from '@/lib/db/hackathons';
import HackathonAdminClient from './HackathonAdminClient';

export const dynamic = 'force-dynamic';

export default async function HackathonAdminPage() {
  const hackathons = await listHackathons();
  return <HackathonAdminClient initialHackathons={hackathons} />;
}
