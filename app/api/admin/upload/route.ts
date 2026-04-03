import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { db } from '@/lib/db';
import { examSchedules, uploadHistory } from '@/lib/db/schema';
import { clearExamCache, populateExamCache } from '@/lib/exam-cache';

const REQUIRED_COLUMNS = [
  'Program', 'Slot', 'Date', 'Start Time', 'End Time',
  'Course Code', 'Course Title', 'Students', 'Faculty',
];

const PREVIEW_ROWS = 10;
const HEADER_ALIASES: Record<string, string> = {
  program: 'Program',
  slot: 'Slot',
  date: 'Date',
  'start time': 'Start Time',
  'end time': 'End Time',
  'course code': 'Course Code',
  'course title': 'Course Title',
  students: 'Students',
  faculty: 'Faculty',
};

function normalizeHeader(value: string) {
  return value
    .replace(/^\uFEFF/, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeRow(row: Record<string, unknown>) {
  const normalized: Record<string, string> = {};
  for (const [rawKey, rawValue] of Object.entries(row)) {
    const normalizedKey = normalizeHeader(rawKey);
    const canonicalKey = HEADER_ALIASES[normalizedKey] ?? rawKey.trim();
    normalized[canonicalKey] = String(rawValue ?? '');
  }
  return normalized;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get('action') as string;
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Parse with xlsx (handles .csv and .xlsx)
  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  const rows = rawRows.map(normalizeRow);

  if (rows.length === 0) {
    return NextResponse.json({ error: 'File contains no data rows.' }, { status: 400 });
  }

  // Validate required columns
  const firstRow = rows[0];
  const missingColumns = REQUIRED_COLUMNS.filter(col => !(col in firstRow));
  if (missingColumns.length > 0) {
    const detectedColumns = Object.keys(firstRow);
    return NextResponse.json(
      {
        error: `Missing required columns: ${missingColumns.join(', ')}`,
        detectedColumns,
      },
      { status: 400 }
    );
  }

  if (action === 'preview') {
    return NextResponse.json({
      preview: rows.slice(0, PREVIEW_ROWS),
      totalRows: rows.length,
      columns: REQUIRED_COLUMNS,
    });
  }

  if (action === 'confirm') {
    const adminId = session.user.id ? Number(session.user.id) : null;

    try {
      await db.transaction(async (tx) => {
        // Atomic replacement: old data is removed only if all inserts succeed.
        await tx.delete(examSchedules);

        const CHUNK = 100;
        for (let i = 0; i < rows.length; i += CHUNK) {
          const chunk = rows.slice(i, i + CHUNK).map(row => ({
            program: String(row['Program']),
            slot: String(row['Slot']),
            date: String(row['Date']),
            startTime: String(row['Start Time']),
            endTime: String(row['End Time']),
            courseCode: String(row['Course Code']),
            courseTitle: String(row['Course Title']),
            students: String(row['Students']),
            faculty: String(row['Faculty']),
          }));

          await tx.insert(examSchedules).values(chunk);
        }

        await tx.insert(uploadHistory).values({
          filename: file.name,
          uploadedBy: adminId,
          rowCount: rows.length,
          status: 'success',
        });
      });

      // Warm the cache immediately so the first read after upload is instant
      await clearExamCache();
      await populateExamCache();

      return NextResponse.json({ success: true, rowsInserted: rows.length });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      try {
        await db.insert(uploadHistory).values({
          filename: file.name,
          uploadedBy: adminId,
          rowCount: 0,
          status: 'failed',
          errorMessage,
        });
      } catch {
        // Ignore logging failure
      }

      console.error('Upload error:', error);
      return NextResponse.json({ error: 'Failed to insert data into database.' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid action. Use "preview" or "confirm".' }, { status: 400 });
}
