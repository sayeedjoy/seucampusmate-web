import { db } from '@/lib/db';
import { hackathons, type Hackathon, type NewHackathon } from '@/lib/db/schema';
import { asc, desc, eq, gte, lt } from 'drizzle-orm';

/** Today's date as ISO 'YYYY-MM-DD', used for the upcoming/past split. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function listHackathons(): Promise<Hackathon[]> {
  return db.select().from(hackathons).orderBy(asc(hackathons.eventDate), asc(hackathons.id));
}

/** Upcoming = event_date >= today (soonest first); Past = event_date < today (most recent first). */
export async function listHackathonsSplit(): Promise<{ upcoming: Hackathon[]; past: Hackathon[] }> {
  const today = todayIso();
  const [upcoming, past] = await Promise.all([
    db
      .select()
      .from(hackathons)
      .where(gte(hackathons.eventDate, today))
      .orderBy(asc(hackathons.eventDate), asc(hackathons.id)),
    db
      .select()
      .from(hackathons)
      .where(lt(hackathons.eventDate, today))
      .orderBy(desc(hackathons.eventDate), desc(hackathons.id)),
  ]);
  return { upcoming, past };
}

export async function getHackathonById(id: number): Promise<Hackathon | null> {
  const [row] = await db.select().from(hackathons).where(eq(hackathons.id, id)).limit(1);
  return row ?? null;
}

export async function createHackathon(values: NewHackathon): Promise<Hackathon> {
  const [row] = await db.insert(hackathons).values(values).returning();
  return row;
}

export async function updateHackathon(
  id: number,
  values: Partial<NewHackathon>
): Promise<Hackathon | null> {
  const [row] = await db
    .update(hackathons)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(hackathons.id, id))
    .returning();
  return row ?? null;
}

export async function deleteHackathon(id: number): Promise<void> {
  await db.delete(hackathons).where(eq(hackathons.id, id));
}
