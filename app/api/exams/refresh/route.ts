import { NextResponse } from 'next/server';
import { clearExamCache, populateExamCache } from '@/lib/exam-cache';
import { NextRequest } from 'next/server';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `exams-refresh:${clientIp}`,
    limit: 5,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many refresh requests. Please wait before trying again.' },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  try {
    await clearExamCache();
    const rows = await populateExamCache();
    return NextResponse.json(
      { success: true, rowCount: rows.length, timestamp: new Date().toISOString() },
      { headers: rateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    console.error('Exam cache refresh error:', error);
    return NextResponse.json({ error: 'Failed to refresh exam cache' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed. Use POST.' }, { status: 405 });
}
