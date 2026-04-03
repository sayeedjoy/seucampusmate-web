import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { examSchedules } from '@/lib/db/schema';
import { clearExamCache } from '@/lib/exam-cache';

export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await db.delete(examSchedules);
  await clearExamCache();
  return NextResponse.json({ success: true, deleted: result.rowCount ?? 0 });
}
