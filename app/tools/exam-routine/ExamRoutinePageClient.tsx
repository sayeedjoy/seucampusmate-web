'use client';

import { useState, useRef, useEffect, useMemo, useCallback, startTransition } from 'react';
import { Container } from '@/components/ui/container';
import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer/footer';
import { ExamApiResponse, ExamResult } from '@/lib/exam-utils';
import { ArrowPathIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [showWarning, setShowWarning] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const scheduleRef = useRef<HTMLDivElement>(null);

    // Toast notification function
    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    }, []);

    // Auto-hide toast after 4 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

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
            setValidationError(`Invalid format: "${trimmedCode}". Please use format like CSE123.2 (with section number)`);
            return;
        }

        // Check if already exists
        if (courseCodes.includes(trimmedCode)) {
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
                showToast('Data refreshed and results updated!', 'success');
            } else {
                // Show success toast for general refresh
                showToast('Data refreshed successfully!', 'success');
            }

        } catch (err) {
            console.error('Refresh error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Refresh failed';
            setError(errorMessage);

            // Use shorter error message for toast
            const toastMessage = errorMessage.length > 50 ? 'Failed to refresh data' : errorMessage;
            showToast(toastMessage, 'error');
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
            setValidationError(`Invalid course code(s): ${invalidCodes.join(', ')}. Please use format like CSE123.2 (with section number)`);
            return;
        }

        if (codesToSearch.length === 0) {
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
                        setValidationError(`Course section "${codesToSearch[0]}" not found. Please check the course code and section number.`);
                    } else {
                        throw new Error(`Failed to fetch data for ${codesToSearch[0]}`);
                    }
                    return;
                }

                const data = await response.json();

                // Check if the API returned empty results (course exists but no exams)
                if (data.count === 0) {
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
                        setValidationError(`Course section(s) not found: ${nonExistentCodes.join(', ')}. Please check the course codes and section numbers.`);
                        return;
                    } else {
                        // Some codes are valid, show partial results with warning
                        setValidationError(`Warning: Some course sections not found: ${nonExistentCodes.join(', ')}. Showing results for available sections.`);
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

    const formatDate = useCallback((dateString: string) => {
        // Handle different date formats that might come from CSV
        if (!dateString || dateString.trim() === '') {
            return 'Date TBD';
        }

        try {
            let date: Date | null = null;
            const cleanDateString = dateString.trim();

            // Try multiple date parsing strategies

            // Strategy 1: Try DD/MM/YYYY or DD-MM-YYYY format first (most common in many regions)
            const parts = cleanDateString.split(/[\/\-\.]/);
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
                const year = parseInt(parts[2], 10);

                // Validate the parsed values
                if (!isNaN(day) && !isNaN(month) && !isNaN(year) &&
                    day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900) {
                    date = new Date(year, month, day);

                    // Double check if the date is valid
                    if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
                        // Valid date, use it
                    } else {
                        date = null; // Invalid date (e.g., Feb 30)
                    }
                }
            }

            // Strategy 2: Try YYYY-MM-DD format
            if (!date || isNaN(date.getTime())) {
                const isoMatch = cleanDateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
                if (isoMatch) {
                    const year = parseInt(isoMatch[1], 10);
                    const month = parseInt(isoMatch[2], 10) - 1;
                    const day = parseInt(isoMatch[3], 10);
                    date = new Date(year, month, day);
                }
            }

            // Strategy 3: Try MM/DD/YYYY format (US format)
            if (!date || isNaN(date.getTime())) {
                const usMatch = cleanDateString.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                if (usMatch) {
                    const month = parseInt(usMatch[1], 10) - 1;
                    const day = parseInt(usMatch[2], 10);
                    const year = parseInt(usMatch[3], 10);
                    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
                        date = new Date(year, month, day);
                    }
                }
            }

            // Strategy 4: Try parsing the date string directly as last resort
            if (!date || isNaN(date.getTime())) {
                date = new Date(cleanDateString);
            }

            // If still invalid, return the original string
            if (!date || isNaN(date.getTime())) {
                return cleanDateString;
            }

            // Return formatted date with day name
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.warn('Date parsing error for:', dateString, error);
            return dateString;
        }
    }, []);

    // Calculate days remaining until exam
    const getDaysRemaining = useCallback((dateString: string) => {
        try {
            const cleanDateString = dateString.trim();
            const parts = cleanDateString.split(/[\/\-\.]/);

            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                const examDate = new Date(year, month, day);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (!isNaN(examDate.getTime())) {
                    const diffTime = examDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays;
                }
            }
        } catch (error) {
            console.error('Error calculating days remaining:', error);
        }
        return null;
    }, []);

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
            showToast('Error generating PDF', 'error');
        } finally {
            setDownloading(false);
        }
    }, [getTotalResults, getAllExams, courseCodes, formatDate, formatTime, showToast]);

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
            showToast('Error generating PNG', 'error');
        } finally {
            setDownloading(false);
        }
    }, [getTotalResults, getAllExams, courseCodes, formatDate, formatTime, showToast]);

    return (
        <>
            <Navbar />
            <main className="pt-12 md:pt-16">
                <Container className="py-6 md:py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header Section */}
                        <div className="text-center mb-8 px-4">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                                Exam Routine Finder
                            </h1>
                            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                Find your exam schedules by entering course codes.
                            </p>
                        </div>

                        {/* Warning Section */}
                        {showWarning && (
                            <div className="mb-6 px-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-semibold text-red-900 mb-1">
                                                Important Notice
                                            </h3>
                                            <p className="text-sm text-red-800 leading-relaxed">
                                                The CSE exam routine may change without notice. Please verify with the official Google Sheet or department announcements from the CSE Department Office for updates.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowWarning(false)}
                                            className="flex-shrink-0 -mr-1 -mt-1 rounded-lg p-1.5 inline-flex h-8 w-8 transition-colors text-red-500 hover:bg-red-100 hover:text-red-700"
                                            title="Close notice"
                                        >
                                            <span className="sr-only">Close notice</span>
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Toast Notification */}
                        {toast && (
                            <div className={`fixed top-4 md:top-20 right-2 md:right-4 z-50 max-w-xs md:max-w-sm w-auto md:w-full p-3 md:p-4 rounded-lg shadow-lg border transition-all duration-500 ease-out transform animate-in slide-in-from-right-full ${toast.type === 'success'
                                    ? 'bg-green-50 border-green-200 text-green-800'
                                    : 'bg-red-50 border-red-200 text-red-800'
                                }`}>
                                <div className="flex items-start gap-2 md:gap-3">
                                    <div className={`flex-shrink-0 w-4 h-4 md:w-5 md:h-5 mt-0.5 ${toast.type === 'success' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {toast.type === 'success' ? (
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="text-xs md:text-sm font-medium flex-1 leading-relaxed">
                                        {toast.message}
                                    </div>
                                    <button
                                        onClick={() => setToast(null)}
                                        className={`flex-shrink-0 -mr-1 -mt-1 rounded-lg p-1 md:p-1.5 inline-flex h-6 w-6 md:h-8 md:w-8 transition-colors ${toast.type === 'success'
                                                ? 'text-green-500 hover:bg-green-100'
                                                : 'text-red-500 hover:bg-red-100'
                                            }`}
                                    >
                                        <span className="sr-only">Close</span>
                                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Search Section */}
                        <div className="max-w-5xl mx-auto mb-10">

                            <Card className="border-gray-200 shadow-sm">
                                <CardContent className="p-6">
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Search Input */}
                                        <div className="space-y-2">
                                            <label htmlFor="course-code-input" className="text-sm font-medium text-gray-700">
                                                Course Code
                                            </label>
                                            <input
                                                id="course-code-input"
                                                type="text"
                                                value={courseCode}
                                                onChange={handleInputChange}
                                                onKeyPress={handleKeyPress}
                                                placeholder="e.g., CSE181.5, CSE361.2"
                                                className={cn(
                                                    "flex h-11 w-full rounded-lg border bg-white px-4 py-2 text-sm text-gray-900",
                                                    "placeholder:text-gray-400",
                                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500",
                                                    "disabled:cursor-not-allowed disabled:opacity-50",
                                                    "transition-all duration-200",
                                                    validationError ? "border-red-300 ring-2 ring-red-500/20" : "border-gray-300"
                                                )}
                                                disabled={loading || refreshing}
                                                autoComplete="off"
                                            />
                                            <p className="text-xs text-gray-500">
                                                Separate multiple codes with commas or press Enter after each
                                            </p>
                                        </div>

                                        {/* Selected Courses */}
                                        {courseCodes.length > 0 && (
                                            <div className="space-y-2.5">
                                                <p className="text-xs font-medium text-gray-600">
                                                    Selected ({courseCodes.length})
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {courseCodes.map((code, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="secondary"
                                                            className="pl-3 pr-2 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                                                        >
                                                            {code.toUpperCase()}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeCourseCode(code)}
                                                                className="ml-1.5 rounded-sm hover:bg-blue-200 p-0.5 transition-colors"
                                                                disabled={loading}
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <Button
                                                type="submit"
                                                disabled={loading || refreshing || (courseCodes.length === 0 && !courseCode.trim())}
                                                size="default"
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Searching...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                        Search Exams
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={refreshExamData}
                                                disabled={loading || refreshing}
                                                className="border-gray-300 hover:bg-gray-50"
                                            >
                                                {refreshing ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                                                        <span className="hidden sm:inline">Refreshing...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArrowPathIcon className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Refresh Data</span>
                                                        <span className="sm:hidden">Refresh</span>
                                                    </>
                                                )}
                                            </Button>
                                            {courseCodes.length > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={clearAllCodes}
                                                    disabled={loading}
                                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                                >
                                                    Clear All
                                                </Button>
                                            )}
                                        </div>

                                        {/* Validation Error */}
                                        {validationError && (
                                            <div className="rounded-lg border border-red-200 bg-red-50 p-3.5">
                                                <div className="flex gap-2">
                                                    <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                    </svg>
                                                    <p className="text-sm text-red-800">{validationError}</p>
                                                </div>
                                            </div>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Content Area with Minimum Height */}
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
                                    {getTotalResults > 0 && (
                                        <div className="max-w-5xl mx-auto">
                                            {/* Header with Export Buttons */}
                                            <div className="mb-6 flex items-start justify-between gap-4">
                                                <div>
                                                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                                        Exam Schedule
                                                    </h2>
                                                    <p className="text-sm text-gray-600">
                                                        {getTotalResults} {getTotalResults === 1 ? 'exam' : 'exams'} • {Object.keys(results).length} {Object.keys(results).length === 1 ? 'course' : 'courses'}
                                                    </p>
                                                </div>
                                                {/* Export Buttons */}
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={downloadAsPDF}
                                                        disabled={downloading}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded transition-colors"
                                                    >
                                                        <DocumentIcon className="w-4 h-4" />
                                                        PDF
                                                    </button>
                                                    <button
                                                        onClick={downloadAsPNG}
                                                        disabled={downloading}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 rounded transition-colors"
                                                    >
                                                        <PhotoIcon className="w-4 h-4" />
                                                        PNG
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Exam Cards */}
                                            <div ref={scheduleRef} className="space-y-4">
                                                {getAllExams.map((exam, index) => {
                                                    const daysRemaining = getDaysRemaining(exam.date);
                                                    const isPast = daysRemaining !== null && daysRemaining < 0;
                                                    const isToday = daysRemaining === 0;

                                                    return (
                                                        <Card
                                                            key={`${exam.courseCode}-${index}`}
                                                            className={cn(
                                                                "border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200",
                                                                isPast && "opacity-60"
                                                            )}
                                                            style={{ contentVisibility: 'auto', containIntrinsicSize: '0 200px' }}
                                                        >
                                                            <CardHeader className="pb-4">
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div className="flex-1 space-y-3">
                                                                        {/* Status Badge */}
                                                                        {daysRemaining !== null && (
                                                                            <Badge
                                                                                className={cn(
                                                                                    "font-medium",
                                                                                    isToday ? "bg-blue-600 text-white hover:bg-blue-700" :
                                                                                        isPast ? "bg-gray-100 text-gray-600" :
                                                                                            "bg-blue-50 text-blue-700 border border-blue-200"
                                                                                )}
                                                                            >
                                                                                {isPast ? (
                                                                                    <>
                                                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                        </svg>
                                                                                        Completed
                                                                                    </>
                                                                                ) : isToday ? (
                                                                                    <>
                                                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                                        </svg>
                                                                                        Today
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                        </svg>
                                                                                        {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                                                                                    </>
                                                                                )}
                                                                            </Badge>
                                                                        )}

                                                                        {/* Course Title */}
                                                                        <CardTitle className="text-lg md:text-xl font-semibold text-gray-900 leading-tight">
                                                                            {exam.courseTitle}
                                                                        </CardTitle>
                                                                    </div>

                                                                    {/* Course Code Badge */}
                                                                    <Badge className="text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 shrink-0">
                                                                        {exam.courseCode}
                                                                    </Badge>
                                                                </div>
                                                            </CardHeader>

                                                            <CardContent className="pt-0">
                                                                {/* Details Grid */}
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="space-y-1.5">
                                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                            Date
                                                                        </p>
                                                                        <p className="text-sm font-medium text-gray-900">
                                                                            {formatDate(exam.date)}
                                                                        </p>
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                            Time
                                                                        </p>
                                                                        <p className="text-sm font-medium text-gray-900">
                                                                            {formatTime(exam.startTime, exam.endTime)}
                                                                        </p>
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                            Faculty
                                                                        </p>
                                                                        <p className="text-sm font-medium text-gray-900">
                                                                            {exam.faculty}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
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
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
}