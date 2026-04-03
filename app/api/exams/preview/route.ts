import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { examSchedules } from '@/lib/db/schema';
import { asc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawLimit = Number(searchParams.get('limit') ?? DEFAULT_LIMIT);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  try {
    const [rows, totalResult] = await Promise.all([
      db
        .select({
          program: examSchedules.program,
          slot: examSchedules.slot,
          date: examSchedules.date,
          startTime: examSchedules.startTime,
          endTime: examSchedules.endTime,
          courseCode: examSchedules.courseCode,
          courseTitle: examSchedules.courseTitle,
          students: examSchedules.students,
          faculty: examSchedules.faculty,
        })
        .from(examSchedules)
        .orderBy(asc(examSchedules.id))
        .limit(limit),
      db.select({ count: sql<number>`count(*)` }).from(examSchedules),
    ]);

    return NextResponse.json({
      totalRows: Number(totalResult[0]?.count ?? 0),
      previewCount: rows.length,
      rows,
    });
  } catch (error) {
    console.error('Error fetching exam preview data:', error);
    return NextResponse.json({ error: 'Failed to fetch exam preview data' }, { status: 502 });
  }
}
