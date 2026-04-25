import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { apiKeys } from '@/lib/db/schema';
import { getExamCache, CachedExamRow } from '@/lib/exam-cache';
import { normalizeCourseCode, ExamResult } from '@/lib/exam-utils';
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';

async function resolveApiKey(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const xApiKey = request.headers.get('x-api-key');
  const raw = xApiKey ?? (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);
  if (!raw) return null;

  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const rows = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, hash))
    .limit(1);

  if (!rows.length || !rows[0].isActive) return null;

  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, rows[0].id));
  return rows[0];
}

function stripStudents(row: CachedExamRow): ExamResult {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { students: _s, ...rest } = row;
  return rest;
}

function buildSummary(results: ExamResult[]): string {
  if (!results.length) return 'No exam found for this query.';
  return results
    .map(
      (r) =>
        `${r.courseCode} (${r.courseTitle}) — ${r.date}, ${r.startTime}–${r.endTime}, Slot ${r.slot}, ${r.program}`
    )
    .join('\n');
}

export async function GET(request: NextRequest) {
  const key = await resolveApiKey(request);
  if (!key) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  const rateLimit = checkRateLimit({
    key: `chatbot-routine:${key.id}`,
    limit: 60,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again shortly.' },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const codes = searchParams.get('codes');
  const search = searchParams.get('search');

  if (!code && !codes && !search) {
    return NextResponse.json(
      { error: 'Provide ?code=, ?codes=, or ?search= parameter.' },
      { status: 400, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const allRows = await getExamCache();

  if (search) {
    const q = search.toLowerCase();
    const results = allRows
      .filter(
        (r) =>
          r.courseTitle.toLowerCase().includes(q) ||
          normalizeCourseCode(r.courseCode).includes(normalizeCourseCode(q))
      )
      .map(stripStudents);

    return NextResponse.json(
      { query: search, count: results.length, results, summary: buildSummary(results) },
      { headers: rateLimitHeaders(rateLimit) }
    );
  }

  if (codes) {
    const codeList = codes
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const out: Record<
      string,
      { query: string; count: number; results: ExamResult[]; summary: string }
    > = {};

    for (const c of codeList) {
      const norm = normalizeCourseCode(c);
      const results = allRows
        .filter((r) => normalizeCourseCode(r.courseCode) === norm)
        .map(stripStudents);
      out[c] = { query: c, count: results.length, results, summary: buildSummary(results) };
    }

    return NextResponse.json(out, { headers: rateLimitHeaders(rateLimit) });
  }

  // Single code lookup
  const norm = normalizeCourseCode(code!);
  const results = allRows
    .filter((r) => normalizeCourseCode(r.courseCode) === norm)
    .map(stripStudents);

  return NextResponse.json(
    { query: code, count: results.length, results, summary: buildSummary(results) },
    { headers: rateLimitHeaders(rateLimit) }
  );
}
