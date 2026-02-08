/**
 * Normalizes course codes for comparison by removing spaces, dashes, and converting to lowercase
 * @param courseCode - The course code to normalize
 * @returns Normalized course code
 */
export function normalizeCourseCode(courseCode: string): string {
  return courseCode.toLowerCase().replace(/[-\s]/g, '');
}

/**
 * Checks if two course codes match after normalization
 * @param code1 - First course code
 * @param code2 - Second course code
 * @returns True if the codes match
 */
export function courseCodesMatch(code1: string, code2: string): boolean {
  return normalizeCourseCode(code1) === normalizeCourseCode(code2);
}

/**
 * Type definition for a parsed exam row from the CSV
 */
export interface ExamRow {
  Program: string;
  Slot: string;
  Date: string;
  'Start Time': string;
  'End Time': string;
  'Course Code': string;
  'Course Title': string;
  Students: string;
  Faculty: string;
}

/**
 * Type definition for the API response
 */
export interface ExamResult {
  program: string;
  slot: string;
  date: string;
  startTime: string;
  endTime: string;
  courseCode: string;
  courseTitle: string;
  faculty: string;
}

/**
 * Type definition for the complete API response
 */
export interface ExamApiResponse {
  query: string;
  count: number;
  results: ExamResult[];
}
