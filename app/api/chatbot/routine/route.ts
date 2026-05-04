import { NextRequest, NextResponse } from 'next/server';
import { getExamCache, CachedExamRow } from '@/lib/exam-cache';
import { normalizeCourseCode, ExamResult } from '@/lib/exam-utils';
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';

function resolveClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const clientIp = forwardedFor?.split(',')[0]?.trim();
  return clientIp || 'anonymous';
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
  const rateLimit = checkRateLimit({
    key: `chatbot-routine:${resolveClientKey(request)}`,
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
