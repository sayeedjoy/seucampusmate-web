import { db } from '@/lib/db';
import { teamMembers } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import TeamClient from './TeamClient';

export default async function TeamAdminPage() {
  const rows = await db
    .select()
    .from(teamMembers)
    .orderBy(asc(teamMembers.displayOrder), asc(teamMembers.id));

  return <TeamClient initialMembers={rows} />;
}
