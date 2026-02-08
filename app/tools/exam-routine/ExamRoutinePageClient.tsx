'use client';

import { useState, useRef, useEffect, useMemo, useCallback, startTransition } from 'react';
import { Container } from '@/components/ui/container';
import { Header } from '@/components/navbar/header';
import { Footer } from '@/components/footer';
import { ExamApiResponse, ExamResult } from '@/lib/exam-utils';
import { toast } from 'sonner';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import RoutineSearch from '@/components/exam-routine/routine-search';
import type { ValidationVariant } from '@/components/exam-routine/routine-search';
import ExamRoutineResults from '@/components/exam-routine/routine-result-card';
import ExamRoutineDownload from '@/components/exam-routine/routine-download';

interface MultipleExamResults {
    [courseCode: string]: {
        data: ExamApiResponse;
        error?: string;
    };
}

export default function ExamRoutinePageClient() {
    const [courseCode, setCourseCode] = useState('');
    const [courseCodes, setCourseCodes] = useState<string[]>([]);
    const [results, setResults] = useState<MultipleExamResults>({});
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [validationVariant, setValidationVariant] = useState<ValidationVariant>('error');
    const [showWarning, setShowWarning] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const scheduleRef = useRef<HTMLDivElement>(null);

    // Auto-refresh when page becomes visible (user comes back to tab)
    useEffect(() => {
        let lastRefreshTime = 0;
        const REFRESH_COOLDOWN = 10000; // 10 seconds cooldown between refreshes

        const handleVisibilityChange = () => {
            const now = Date.now();
            // Avoid refreshing too frequently
            if (!document.hidden && Object.keys(results).length > 0 && (now - lastRefreshTime) > REFRESH_COOLDOWN) {
                lastRefreshTime = now;
                // Page is now visible and we have results, refresh them silently
                const refetchResults = async () => {
                    const currentCodes = Object.keys(results);

                    try {
                        // Re-fetch each course code with cache-busting timestamp
                        for (const code of currentCodes) {
                            const examResponse = await fetch(`/api/exams?code=${encodeURIComponent(code)}&timestamp=${Date.now()}`);
                            if (examResponse.ok) {
                                const examData = await examResponse.json();
                                // Use startTransition for non-urgent updates
                                startTransition(() => {
                                    setResults(prev => ({
                                        ...prev,
                                        [code]: { data: examData }
                                    }));
                                });
                            }
                        }
                    } catch (err) {
                        console.error('Failed to refresh data on visibility change:', err);
                    }
                };

                refetchResults();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [results]);

    // Periodic refresh every 5 minutes when results are displayed
    useEffect(() => {
        if (Object.keys(results).length === 0) return;

        const intervalId = setInterval(async () => {
            const currentCodes = Object.keys(results);

            try {
                // Silently re-fetch each course code
                for (const code of currentCodes) {
                    const examResponse = await fetch(`/api/exams?code=${encodeURIComponent(code)}&timestamp=${Date.now()}`);
                    if (examResponse.ok) {
                        const examData = await examResponse.json();
                        // Use startTransition for non-urgent background updates
                        startTransition(() => {
                            setResults(prev => ({
                                ...prev,
                                [code]: { data: examData }
                            }));
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to refresh data periodically:', err);
            }
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(intervalId);
    }, [results]);

    // Validate course code format (must include section like ABC123.2)
    const validateCourseCode = useCallback((code: string): boolean => {
        const trimmedCode = code.trim();
        // Pattern: Letters followed by numbers, then a dot, then section number
        const pattern = /^[A-Z]{2,4}\d{3}\.\d+$/i;
        return pattern.test(trimmedCode);
    }, []);

    // Check if course code format is correct
    const isValidFormat = useCallback((code: string): boolean => {
        return validateCourseCode(code);
    }, [validateCourseCode]);

    const addCourseCode = useCallback((code: string) => {
        const trimmedCode = code.trim().toUpperCase();

        if (!trimmedCode) return;

        // Validate format
        if (!isValidFormat(trimmedCode)) {
            setValidationVariant('error');
            setValidationError(`Invalid format: "${trimmedCode}". Please use format like CSE123.2 (with section number)`);
            return;
        }

        // Check if already exists
        if (courseCodes.includes(trimmedCode)) {
            setValidationVariant('error');
            setValidationError(`Course "${trimmedCode}" is already added`);
            return;
        }

        // Clear any previous validation error
        setValidationError(null);
        setCourseCodes(prev => [...prev, trimmedCode]);
        setCourseCode('');
    }, [courseCodes, isValidFormat]);

    const removeCourseCode = useCallback((codeToRemove: string) => {
        setCourseCodes(prev => prev.filter(code => code !== codeToRemove.toUpperCase()));
        setValidationError(null);
    }, []);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (courseCode.trim()) {
                addCourseCode(courseCode);
            }
        }
        // Handle comma separation in real-time
        if (e.key === ',') {
            e.preventDefault();
            if (courseCode.trim()) {
                addCourseCode(courseCode);
            }
        }
    }, [courseCode, addCourseCode]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();

        // Clear validation error when user starts typing
        if (validationError) {
            setValidationError(null);
        }

        // Auto-add codes when user types comma
        if (value.includes(',')) {
            const codes = value.split(',');
            const lastCode = codes.pop() || '';

            codes.forEach(code => {
                const trimmedCode = code.trim();
                if (trimmedCode) {
                    addCourseCode(trimmedCode);
                }
            });

            setCourseCode(lastCode.trim());
        } else {
            setCourseCode(value);
        }
    }, [validationError, addCourseCode]);

    const clearAllCodes = useCallback(() => {
        setCourseCodes([]);
        setCourseCode('');
        setResults({});
        setError(null);
        setValidationError(null);
    }, []);

    const refreshExamData = async () => {
        try {
            setRefreshing(true);
            setError(null);

            // Call the refresh API endpoint to update the cached data
            const response = await fetch('/api/exams/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to refresh exam data');
            }

            await response.json(); // Consume the response

            // If there are current results, re-fetch them with fresh data
            if (Object.keys(results).length > 0) {
                // Re-search with current course codes to get updated data
                const currentCodes = Object.keys(results);
                setResults({});

                // Re-fetch each course code
                for (const code of currentCodes) {
                    try {
                        const examResponse = await fetch(`/api/exams?code=${encodeURIComponent(code)}&timestamp=${Date.now()}`);
                        if (examResponse.ok) {
                            const examData = await examResponse.json();
                            startTransition(() => {
                                setResults(prev => ({
                                    ...prev,
                                    [code]: { data: examData }
                                }));
                            });
                        }
                    } catch (err) {
                        console.error(`Failed to refresh data for ${code}:`, err);
                    }
                }

                // Show success toast with updated results
                toast.success('Data refreshed and results updated!');
            } else {
                toast.success('Data refreshed successfully!');
            }

        } catch (err) {
            console.error('Refresh error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Refresh failed';
            setError(errorMessage);
            const toastMessage = errorMessage.length > 50 ? 'Failed to refresh data' : errorMessage;
            toast.error(toastMessage);
        } finally {
            setRefreshing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent multiple rapid submissions
        if (loading) {
            return;
        }

        // Clear previous errors
        setValidationError(null);
        setError(null);

        // Add current input to the list if it's not empty and valid
        const codesToSearch = [...courseCodes];
        if (courseCode.trim()) {
            const trimmedCode = courseCode.trim().toUpperCase();

            // Validate the current input
            if (!isValidFormat(trimmedCode)) {
                setValidationVariant('error');
                setValidationError(`Invalid format: "${trimmedCode}". Please use format like CSE123.2 (with section number)`);
                return;
            }

            if (!courseCodes.includes(trimmedCode)) {
                codesToSearch.push(trimmedCode);
                setCourseCodes(prev => [...prev, trimmedCode]);
                setCourseCode('');
            }
        }

        // Validate all codes before processing
        const invalidCodes = codesToSearch.filter(code => !isValidFormat(code));
        if (invalidCodes.length > 0) {
            setValidationVariant('error');
            setValidationError(`Invalid course code(s): ${invalidCodes.join(', ')}. Please use format like CSE123.2 (with section number)`);
            return;
        }

        if (codesToSearch.length === 0) {
            setValidationVariant('error');
            setValidationError('Please enter at least one course code');
            return;
        }

        // Set loading state immediately for smooth UX
        setLoading(true);
        // Don't clear results immediately to prevent layout shift
        // setResults({}) will be called only after new data arrives

        try {
            if (codesToSearch.length === 1) {
                // Single course code - use existing API
                const response = await fetch(`/api/exams?code=${encodeURIComponent(codesToSearch[0])}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setValidationVariant('error');
                        setValidationError(`Course section "${codesToSearch[0]}" not found. Please check the course code and section number.`);
                    } else {
                        throw new Error(`Failed to fetch data for ${codesToSearch[0]}`);
                    }
                    return;
                }

                const data = await response.json();

                // Check if the API returned empty results (course exists but no exams)
                if (data.count === 0) {
                    setValidationVariant('error');
                    setValidationError(`No exam data found for "${codesToSearch[0]}". This section may not exist or have no scheduled exams.`);
                    return;
                }

                // Clear old results and set new ones
                setResults({ [codesToSearch[0]]: { data } });
            } else {
                // Multiple course codes - use batch API
                const codesParam = codesToSearch.join(',');
                const response = await fetch(`/api/exams?codes=${encodeURIComponent(codesParam)}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch exam data');
                }

                const batchData = await response.json();

                // Check for non-existent sections
                const nonExistentCodes: string[] = [];
                const validResults: MultipleExamResults = {};

                codesToSearch.forEach(code => {
                    if (batchData[code]) {
                        // Check if the course has any exam data
                        if (batchData[code].count === 0) {
                            nonExistentCodes.push(code);
                        } else {
                            validResults[code] = { data: batchData[code] as ExamApiResponse };
                        }
                    } else {
                        nonExistentCodes.push(code);
                    }
                });

                // If some codes don't exist, show warning but still show results for valid ones
                if (nonExistentCodes.length > 0) {
                    if (Object.keys(validResults).length === 0) {
                        // All codes are invalid
                        setValidationVariant('error');
                        setValidationError(`Course section(s) not found: ${nonExistentCodes.join(', ')}. Please check the course codes and section numbers.`);
                        return;
                    } else {
                        // Some codes are valid, show partial results with warning
                        setValidationVariant('warning');
                        setValidationError(`Some course sections not found: ${nonExistentCodes.join(', ')}. Showing results for available sections.`);
                        // Clear old results and set new ones
                        setResults(validResults);
                    }
                } else {
                    // Clear old results and set new ones
                    setResults(validResults);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching exam data');
        } finally {
            // Always clear loading state
            setLoading(false);
        }
    };

    const formatTime = useCallback((startTime: string, endTime: string) => {
        return `${startTime} - ${endTime}`;
    }, []);

    // Shared parser: same logic as formatDate so days-remaining matches displayed date
    const parseExamDate = useCallback((dateString: string): Date | null => {
        if (!dateString || !dateString.trim()) return null;
        const clean = dateString.trim();
        let date: Date | null = null;

        const parts = clean.split(/[\/\-\.]/);
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year) && day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900) {
                date = new Date(year, month, day);
                if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) date = null;
            }
        }
        if (!date || isNaN(date.getTime())) {
            const isoMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
            if (isoMatch) {
                const y = parseInt(isoMatch[1], 10);
                const m = parseInt(isoMatch[2], 10) - 1;
                const d = parseInt(isoMatch[3], 10);
                date = new Date(y, m, d);
            }
        }
        if (!date || isNaN(date.getTime())) {
            const usMatch = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
            if (usMatch) {
                const m = parseInt(usMatch[1], 10) - 1;
                const d = parseInt(usMatch[2], 10);
                const y = parseInt(usMatch[3], 10);
                if (m >= 0 && m <= 11 && d >= 1 && d <= 31) date = new Date(y, m, d);
            }
        }
        if (!date || isNaN(date.getTime())) date = new Date(clean);
        return date && !isNaN(date.getTime()) ? date : null;
    }, []);

    const formatDate = useCallback((dateString: string) => {
        if (!dateString || dateString.trim() === '') return 'Date TBD';
        const date = parseExamDate(dateString);
        if (!date) return dateString.trim();
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    }, [parseExamDate]);

    const getDaysRemaining = useCallback((dateString: string): number | null => {
        const examDate = parseExamDate(dateString);
        if (!examDate) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        examDate.setHours(0, 0, 0, 0);
        const diffMs = examDate.getTime() - today.getTime();
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }, [parseExamDate]);

    // Memoize getTotalResults to avoid recalculation on every render
    const getTotalResults = useMemo(() => {
        return Object.values(results).reduce((total, result) => total + result.data.count, 0);
    }, [results]);

    // Memoize getAllExams with expensive sorting operation
    const getAllExams = useMemo((): (ExamResult & { searchCode: string })[] => {
        const allExams: (ExamResult & { searchCode: string })[] = [];
        Object.entries(results).forEach(([searchCode, result]) => {
            result.data.results.forEach(exam => {
                allExams.push({ ...exam, searchCode });
            });
        });

        // Sort by date and time chronologically
        return allExams.sort((a, b) => {
            try {
                // Parse date and time into a comparable format
                const parseExamDateTime = (dateStr: string, timeStr: string): Date => {
                    const cleanDate = dateStr.trim();
                    const cleanTime = timeStr.trim();

                    // Parse date - handle DD/MM/YYYY or similar formats
                    const dateParts = cleanDate.split(/[\/\-\.]/);
                    if (dateParts.length === 3) {
                        // Determine format by checking which part is likely the year
                        let day: number, month: number, year: number;

                        if (dateParts[2].length === 4) {
                            // Format: DD/MM/YYYY or MM/DD/YYYY
                            day = parseInt(dateParts[0], 10);
                            month = parseInt(dateParts[1], 10) - 1; // JS months are 0-based
                            year = parseInt(dateParts[2], 10);
                        } else if (dateParts[0].length === 4) {
                            // Format: YYYY/MM/DD
                            year = parseInt(dateParts[0], 10);
                            month = parseInt(dateParts[1], 10) - 1;
                            day = parseInt(dateParts[2], 10);
                        } else {
                            // Default to DD/MM/YYYY
                            day = parseInt(dateParts[0], 10);
                            month = parseInt(dateParts[1], 10) - 1;
                            year = parseInt(dateParts[2], 10);
                            // Assume 2-digit year
                            if (year < 100) {
                                year += 2000;
                            }
                        }

                        const datetime = new Date(year, month, day);

                        // Add time if provided
                        if (cleanTime) {
                            const timeParts = cleanTime.split(':');
                            if (timeParts.length >= 2) {
                                const hours = parseInt(timeParts[0], 10);
                                const minutes = parseInt(timeParts[1], 10);
                                if (!isNaN(hours) && !isNaN(minutes)) {
                                    datetime.setHours(hours, minutes, 0, 0);
                                }
                            }
                        }

                        return datetime;
                    }

                    // Fallback: try direct parsing
                    return new Date(cleanDate + ' ' + cleanTime);
                };

                const dateA = parseExamDateTime(a.date, a.startTime);
                const dateB = parseExamDateTime(b.date, b.startTime);

                // Handle invalid dates
                const isValidA = !isNaN(dateA.getTime());
                const isValidB = !isNaN(dateB.getTime());

                if (!isValidA && !isValidB) {
                    return a.courseCode.localeCompare(b.courseCode);
                }
                if (!isValidA) return 1;
                if (!isValidB) return -1;

                // Sort chronologically (ascending order)
                return dateA.getTime() - dateB.getTime();
            } catch (error) {
                console.error('Date parsing error:', error);
                return a.courseCode.localeCompare(b.courseCode);
            }
        });
    }, [results]);

    // Download as PDF
    const downloadAsPDF = useCallback(async () => {
        if (getTotalResults === 0) return;

        setDownloading(true);
        try {
            const jsPDFModule = await import('jspdf');
            const jsPDF = jsPDFModule.default;
            const doc = new jsPDF();

            doc.setFontSize(20);
            doc.setTextColor(59, 130, 246);
            doc.text('Exam Schedule', 20, 30);

            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 40);
            doc.text(`Course codes: ${courseCodes.join(', ')}`, 20, 50);

            let yPosition = 70;

            getAllExams.forEach((exam) => {
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 30;
                }

                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                doc.text(exam.courseTitle, 20, yPosition);
                yPosition += 10;

                doc.setFontSize(10);
                doc.setTextColor(59, 130, 246);
                doc.text(`Course: ${exam.courseCode}`, 20, yPosition);
                yPosition += 8;

                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.text(`Date: ${formatDate(exam.date)}`, 20, yPosition);
                yPosition += 6;
                doc.text(`Time: ${formatTime(exam.startTime, exam.endTime)}`, 20, yPosition);
                yPosition += 6;
                doc.text(`Faculty: ${exam.faculty}`, 20, yPosition);
                yPosition += 15;
            });

            doc.save(`exam-schedule-${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Error generating PDF');
        } finally {
            setDownloading(false);
        }
    }, [getTotalResults, getAllExams, courseCodes, formatDate, formatTime]);

    // Download as PNG
    const downloadAsPNG = useCallback(async () => {
        if (getTotalResults === 0) return;

        setDownloading(true);
        try {
            const html2canvas = (await import('html2canvas')).default;

            const wrapper = document.createElement('div');
            wrapper.style.width = '800px';
            wrapper.style.padding = '40px';
            wrapper.style.backgroundColor = 'white';
            wrapper.style.fontFamily = 'Arial, sans-serif';
            wrapper.style.position = 'absolute';
            wrapper.style.left = '-9999px';

            const header = document.createElement('div');
            header.style.marginBottom = '30px';

            const title = document.createElement('h1');
            title.textContent = 'Exam Schedule';
            title.style.fontSize = '24px';
            title.style.margin = '0 0 10px 0';
            title.style.color = '#3b82f6';

            const subtitle = document.createElement('p');
            subtitle.textContent = `Generated on ${new Date().toLocaleDateString()} | Courses: ${courseCodes.join(', ')}`;
            subtitle.style.fontSize = '12px';
            subtitle.style.margin = '0';
            subtitle.style.color = '#666666';

            header.appendChild(title);
            header.appendChild(subtitle);

            const content = document.createElement('div');

            getAllExams.forEach((exam) => {
                const examDiv = document.createElement('div');
                examDiv.style.marginBottom = '20px';
                examDiv.style.padding = '15px';
                examDiv.style.border = '1px solid #e5e7eb';
                examDiv.style.borderRadius = '8px';
                examDiv.style.backgroundColor = '#f9fafb';

                const courseTitle = document.createElement('h3');
                courseTitle.textContent = exam.courseTitle;
                courseTitle.style.margin = '0 0 8px 0';
                courseTitle.style.fontSize = '16px';
                courseTitle.style.color = '#111827';
                courseTitle.style.fontWeight = 'bold';

                const courseCode = document.createElement('div');
                courseCode.textContent = `Course: ${exam.courseCode}`;
                courseCode.style.fontSize = '12px';
                courseCode.style.color = '#3b82f6';
                courseCode.style.marginBottom = '8px';
                courseCode.style.fontWeight = '600';

                const examDate = document.createElement('div');
                examDate.textContent = `Date: ${formatDate(exam.date)}`;
                examDate.style.fontSize = '14px';
                examDate.style.color = '#374151';
                examDate.style.marginBottom = '4px';

                const examTime = document.createElement('div');
                examTime.textContent = `Time: ${formatTime(exam.startTime, exam.endTime)}`;
                examTime.style.fontSize = '14px';
                examTime.style.color = '#374151';
                examTime.style.marginBottom = '4px';

                const faculty = document.createElement('div');
                faculty.textContent = `Faculty: ${exam.faculty}`;
                faculty.style.fontSize = '14px';
                faculty.style.color = '#374151';

                examDiv.appendChild(courseTitle);
                examDiv.appendChild(courseCode);
                examDiv.appendChild(examDate);
                examDiv.appendChild(examTime);
                examDiv.appendChild(faculty);

                content.appendChild(examDiv);
            });

            wrapper.appendChild(header);
            wrapper.appendChild(content);
            document.body.appendChild(wrapper);

            const canvas = await html2canvas(wrapper, {
                width: 860,
                height: wrapper.scrollHeight,
                useCORS: false,
                allowTaint: false,
                logging: false
            });

            document.body.removeChild(wrapper);

            const link = document.createElement('a');
            link.download = `exam-schedule-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png', 0.9);

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Error generating PNG:', error);
            toast.error('Error generating PNG');
        } finally {
            setDownloading(false);
        }
    }, [getTotalResults, getAllExams, courseCodes, formatDate, formatTime]);

    return (
        <>
            <Header />
            <main className="pt-12 md:pt-16">
                <Container className="py-6 md:py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header Section */}
                        <div className="text-center mb-8 px-4">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
                                Exam Routine Finder
                            </h1>
                            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                Find your exam schedules by entering course codes.
                            </p>
                        </div>

                        {/* Important Notice */}
                        {showWarning && (
                            <div className="mb-6 px-4">
                                <Alert variant="warning" className="relative">
                                    <AlertTitle>Important Notice</AlertTitle>
                                    <AlertDescription>
                                        The CSE exam routine may change without notice. Please verify with the official Google Sheet or department announcements from the CSE Department Office for updates.
                                    </AlertDescription>
                                    <AlertAction>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => setShowWarning(false)}
                                            className="absolute top-2 right-2 cursor-pointer"
                                            aria-label="Close notice"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </AlertAction>
                                </Alert>
                            </div>
                        )}

                        <RoutineSearch
                            courseCode={courseCode}
                            courseCodes={courseCodes}
                            loading={loading}
                            refreshing={refreshing}
                            validationError={validationError}
                            validationVariant={validationVariant}
                            onCourseCodeChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            onRemoveCode={removeCourseCode}
                            onSubmit={handleSubmit}
                            onRefresh={refreshExamData}
                            onClearAll={clearAllCodes}
                        />

                        {/* Content Area */}
                        <div className="min-h-[400px]">
                            <ExamRoutineResults
                                loading={loading}
                                error={error}
                                totalResults={getTotalResults}
                                resultsCount={Object.keys(results).length}
                                allExams={getAllExams}
                                formatDate={formatDate}
                                formatTime={formatTime}
                                getDaysRemaining={getDaysRemaining}
                                scheduleRef={scheduleRef}
                            />
                            {getTotalResults > 0 && (
                                <ExamRoutineDownload
                                    totalResults={getTotalResults}
                                    downloading={downloading}
                                    onDownloadPDF={downloadAsPDF}
                                    onDownloadPNG={downloadAsPNG}
                                />
                            )}
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
}