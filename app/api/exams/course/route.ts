import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { ExamRow, ExamResult, ExamApiResponse } from '@/lib/exam-utils';

// Cache the response for 1 hour
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  if (!title) {
    return NextResponse.json(
      { error: 'Course title is required' },
      { status: 400 }
    );
  }

  try {
    // Get the CSV URL from environment variables
    const csvUrl = process.env.EXAMS_CSV_URL;
    if (!csvUrl) {
      return NextResponse.json(
        { error: 'CSV URL not configured' },
        { status: 500 }
      );
    }

    // Fetch the CSV data
    const response = await fetch(csvUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }

    const csvText = await response.text();

    // Parse the CSV
    const records: ExamRow[] = parse(csvText, {
      columns: true,
      trim: true,
      skip_empty_lines: true
    });

    // Filter records that match the course title (partial match, case-insensitive)
    const matchingRecords = records.filter(record =>
      record['Course Title'].toLowerCase().includes(title.toLowerCase())
    );

    // Transform the data to the desired format
    const results: ExamResult[] = matchingRecords.map(record => ({
      program: record.Program,
      slot: record.Slot,
      date: record.Date,
      startTime: record['Start Time'],
      endTime: record['End Time'],
      courseCode: record['Course Code'],
      courseTitle: record['Course Title'],
      faculty: record.Faculty
    }));

    const apiResponse: ExamApiResponse = {
      query: title.toLowerCase(),
      count: results.length,
      results
    };

    return NextResponse.json(apiResponse);

  } catch (error) {
    console.error('Error fetching exam data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exam data' },
      { status: 502 }
    );
  }
}
