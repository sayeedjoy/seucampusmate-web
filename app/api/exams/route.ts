import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { ExamRow, ExamResult, ExamApiResponse, courseCodesMatch } from '@/lib/exam-utils';

// Cache the response for 5 minutes to ensure fresher data
export const revalidate = 300;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseCode = searchParams.get('code');
  const codes = searchParams.get('codes'); // Support multiple codes

  if (!courseCode && !codes) {
    return NextResponse.json(
      { error: 'Course code is required' },
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
      next: { revalidate: 300 } // Cache for 5 minutes
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

    if (codes) {
      // Handle multiple course codes
      const codeList = codes.split(',').map(code => code.trim()).filter(code => code.length > 0);
      const results: { [key: string]: ExamApiResponse } = {};

      codeList.forEach(code => {
        const matchingRecords = records.filter(record =>
          courseCodesMatch(record['Course Code'], code)
        );

        const examResults: ExamResult[] = matchingRecords.map(record => ({
          program: record.Program,
          slot: record.Slot,
          date: record.Date,
          startTime: record['Start Time'],
          endTime: record['End Time'],
          courseCode: record['Course Code'],
          courseTitle: record['Course Title'],
          faculty: record.Faculty
        }));

        results[code] = {
          query: code.toLowerCase(),
          count: examResults.length,
          results: examResults
        };
      });

      return NextResponse.json(results);
    } else {
      // Handle single course code (backward compatibility)
      const matchingRecords = records.filter(record =>
        courseCodesMatch(record['Course Code'], courseCode!)
      );

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
        query: courseCode!.toLowerCase(),
        count: results.length,
        results
      };

      return NextResponse.json(apiResponse);
    }

  } catch (error) {
    console.error('Error fetching exam data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exam data' },
      { status: 502 }
    );
  }
}
