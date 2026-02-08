'use client';

import { ExamResult } from '@/lib/exam-utils';

interface MultipleExamResults {
    [courseCode: string]: {
        data: {
            query: string;
            count: number;
            results: ExamResult[];
        };
        error?: string;
    };
}

interface ExamRoutineResultsProps {
    results: MultipleExamResults;
    loading: boolean;
    error: string | null;
    getTotalResults: () => number;
    getAllExams: () => (ExamResult & { searchCode: string })[];
    formatDate: (date: string) => string;
    formatTime: (startTime: string, endTime: string) => string;
}

export default function ExamRoutineResults({
    results,
    loading,
    error,
    getTotalResults,
    getAllExams,
    formatDate,
    formatTime,
}: ExamRoutineResultsProps) {
    return (
        <div className="min-h-[400px]">
            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-8 h-8 mb-4">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Searching Your Exams...</h3>
                    <p className="text-gray-600 text-sm">
                        Looking up exam schedules for your courses.
                    </p>
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-sm font-medium text-red-900 mb-1">Search Error</h3>
                    <p className="text-red-800 text-sm">{error}</p>
                </div>
            )}

            {/* Results Section with Loading Overlay */}
            {!loading && Object.keys(results).length > 0 && (
                <div className="space-y-6 transition-opacity duration-300">
                    {/* Exam Schedule */}
                    {getTotalResults() > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Your Exam Schedule</h3>
                                <p className="text-sm text-gray-600 break-words">
                                    Found {getTotalResults()} exam{getTotalResults() === 1 ? '' : 's'} across {Object.keys(results).length} course{Object.keys(results).length === 1 ? '' : 's'}
                                </p>
                            </div>
                        
                            <div className="space-y-4 sm:space-y-6">
                                {getAllExams().map((exam, index) => (
                                    <div
                                        key={`${exam.courseCode}-${index}`}
                                        className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                                    >
                                        {/* Course Title and Code */}
                                        <div className="mb-6">
                                            <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 break-words leading-tight">
                                                {exam.courseTitle}
                                            </h4>
                                            <span className="inline-block px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                                {exam.courseCode}
                                            </span>
                                        </div>

                                        {/* Exam Details */}
                                        <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
                                            {/* Date */}
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-gray-700 text-xs uppercase tracking-wide mb-1">Date</div>
                                                    <div className="text-gray-900 text-sm font-medium break-words">{formatDate(exam.date)}</div>
                                                </div>
                                            </div>
                                            
                                            {/* Time */}
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-gray-700 text-xs uppercase tracking-wide mb-1">Time</div>
                                                    <div className="text-gray-900 text-sm font-medium break-words">{formatTime(exam.startTime, exam.endTime)}</div>
                                                </div>
                                            </div>
                                            
                                            {/* Faculty */}
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-gray-700 text-xs uppercase tracking-wide mb-1">Faculty</div>
                                                    <div 
                                                        className="text-gray-900 text-sm font-medium break-words leading-relaxed" 
                                                        title={exam.faculty}
                                                    >
                                                        {exam.faculty}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!loading && Object.keys(results).length === 0 && !error && (
                <div className="text-center py-12">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Ready to search exam schedules
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Enter one or more course codes above to view exam dates, times, and faculty information.
                    </p>
                </div>
            )}
        </div>
    );
}
