import { db } from '@/lib/db';
import { examSchedules, uploadHistory, adminUsers } from '@/lib/db/schema';
import { sql, desc, asc } from 'drizzle-orm';
import DashboardClient from './DashboardClient';
import { UploadHistory, ExamSchedule } from '@/lib/db/schema';

type HistoryWithAdmin = UploadHistory & { uploadedByName: string | null };
type PreviewRow = Pick<
  ExamSchedule,
  'program' | 'slot' | 'date' | 'startTime' | 'endTime' | 'courseCode' | 'courseTitle' | 'students' | 'faculty'
>;
async function getStats() {
  const [countResult, history, previewRows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(examSchedules),
    db
      .select({
        id: uploadHistory.id,
        filename: uploadHistory.filename,
        rowCount: uploadHistory.rowCount,
        status: uploadHistory.status,
        errorMessage: uploadHistory.errorMessage,
        uploadedAt: uploadHistory.uploadedAt,
        uploadedByName: adminUsers.name,
      })
      .from(uploadHistory)
      .leftJoin(adminUsers, sql`${uploadHistory.uploadedBy} = ${adminUsers.id}`)
      .orderBy(desc(uploadHistory.uploadedAt))
      .limit(20),
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
      .limit(20),
  ]);

  return {
    totalRows: Number(countResult[0]?.count ?? 0),
    history: history as HistoryWithAdmin[],
    previewRows: previewRows as PreviewRow[],
  };
}

export default async function DashboardPage() {
  const { totalRows, history, previewRows } = await getStats();

  return (
    <DashboardClient
      totalRows={totalRows}
      history={history}
      previewRows={previewRows}
    />
  );
}
