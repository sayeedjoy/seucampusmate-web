import { auth } from '@/auth';
import { db } from '@/lib/db';
import { teamMembers } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { orderedIds?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const orderedIds = body.orderedIds;
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return NextResponse.json({ error: 'orderedIds must be a non-empty array.' }, { status: 400 });
  }

  const ids = orderedIds.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0);
  if (ids.length !== orderedIds.length) {
    return NextResponse.json({ error: 'orderedIds must contain only positive integers.' }, { status: 400 });
  }

  if (new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: 'orderedIds must be unique.' }, { status: 400 });
  }

  const allIds = await db.select({ id: teamMembers.id }).from(teamMembers);
  if (allIds.length !== ids.length) {
    return NextResponse.json(
      { error: 'Must include every team member id exactly once.' },
      { status: 400 }
    );
  }

  const existing = await db
    .select({ id: teamMembers.id })
    .from(teamMembers)
    .where(inArray(teamMembers.id, ids));

  if (existing.length !== ids.length) {
    return NextResponse.json({ error: 'One or more ids do not exist.' }, { status: 400 });
  }

  await db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(teamMembers)
        .set({ displayOrder: i, updatedAt: new Date() })
        .where(eq(teamMembers.id, ids[i]));
    }
  });

  revalidatePath('/about');

  return NextResponse.json({ success: true });
}
