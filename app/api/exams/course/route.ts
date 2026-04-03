import { NextRequest, NextResponse } from 'next/server';
import { ExamResult, ExamApiResponse } from '@/lib/exam-utils';
import { getExamCache } from '@/lib/exam-cache';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  if (!title) {
    return NextResponse.json({ error: 'Course title is required' }, { status: 400 });
  }

  try {
    const allRows = await getExamCache();
    const needle = title.toLowerCase();

    const results: ExamResult[] = allRows
      .filter(row => row.courseTitle.toLowerCase().includes(needle))
      .map(({ students: _s, ...rest }) => rest);

    const apiResponse: ExamApiResponse = {
      query: title.toLowerCase(),
      count: results.length,
      results,
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error('Error querying exam data by title:', error);
    return NextResponse.json({ error: 'Failed to fetch exam data' }, { status: 502 });
  }
}
