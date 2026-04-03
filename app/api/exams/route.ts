import { NextRequest, NextResponse } from 'next/server';
import { normalizeCourseCode, ExamResult, ExamApiResponse } from '@/lib/exam-utils';
import { getExamCache } from '@/lib/exam-cache';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit';

function filterByCode(rows: Awaited<ReturnType<typeof getExamCache>>, code: string): ExamResult[] {
  const normalized = normalizeCourseCode(code);
  return rows
    .filter(row => normalizeCourseCode(row.courseCode) === normalized)
    .map(row => {
      const { students, ...rest } = row;
      void students;
      return rest;
    });
}

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `exams-search:${clientIp}`,
    limit: 30,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many search requests. Please try again shortly.' },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const { searchParams } = new URL(request.url);
  const courseCode = searchParams.get('code');
  const codes = searchParams.get('codes');

  if (!courseCode && !codes) {
    return NextResponse.json({ error: 'Course code is required' }, { status: 400 });
  }

  try {
    const allRows = await getExamCache();

    if (codes) {
      const codeList = codes.split(',').map(c => c.trim()).filter(Boolean);
      const results: { [key: string]: ExamApiResponse } = {};

      for (const code of codeList) {
        const examResults = filterByCode(allRows, code);
        results[code] = { query: code.toLowerCase(), count: examResults.length, results: examResults };
      }

      return NextResponse.json(results, { headers: rateLimitHeaders(rateLimit) });
    }

    const examResults = filterByCode(allRows, courseCode!);
    const apiResponse: ExamApiResponse = {
      query: courseCode!.toLowerCase(),
      count: examResults.length,
      results: examResults,
    };
    return NextResponse.json(apiResponse, { headers: rateLimitHeaders(rateLimit) });
  } catch (error) {
    console.error('Error fetching exam data:', error);
    return NextResponse.json({ error: 'Failed to fetch exam data' }, { status: 502 });
  }
}
