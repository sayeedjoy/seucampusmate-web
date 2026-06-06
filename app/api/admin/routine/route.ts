import { auth } from '@/auth';
import { requireAdmin } from '@/lib/roles';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { examSchedules } from '@/lib/db/schema';
import { clearExamCache } from '@/lib/exam-cache';

export async function DELETE() {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const result = await db.delete(examSchedules);
  await clearExamCache();
  return NextResponse.json({ success: true, deleted: result.rowCount ?? 0 });
}
