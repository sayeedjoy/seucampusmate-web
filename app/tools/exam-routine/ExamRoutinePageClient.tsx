'use client';

import { useState, useRef, useMemo, useCallback, startTransition } from 'react';
import { Container } from '@/components/ui/container';
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

    // Validate course code format (must include section like ABC123.2)
    const validateCourseCode = useCallback((code: string): boolean => {
        const trimmedCode = code.trim();
        // Pattern: Letters followed by numbers, then a dot, then section number
        //const pattern = /^[A-Z]{2,4}\d{3}\.\d+$/i;
         const pattern = /^[A-Z]{2,4}\d{3,4}\.\d+$/i;
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
                const payload = await response.json().catch(() => ({} as { error?: string }));
                if (response.status === 429) {
                    throw new Error(payload.error ?? 'Too many refresh requests. Please try again shortly.');
                }
                throw new Error(payload.error ?? 'Failed to refresh exam data');
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
                    const payload = await response.json().catch(() => ({} as { error?: string }));
                    if (response.status === 429) {
                        setValidationVariant('warning');
                        setValidationError(payload.error ?? 'Too many search requests. Please wait a moment and try again.');
                        return;
                    }
                    if (response.status === 404) {
                        setValidationVariant('error');
                        setValidationError(`Course section "${codesToSearch[0]}" not found. Please check the course code and section number.`);
                    } else {
                        throw new Error(payload.error ?? `Failed to fetch data for ${codesToSearch[0]}`);
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
                    const payload = await response.json().catch(() => ({} as { error?: string }));
                    if (response.status === 429) {
                        setValidationVariant('warning');
                        setValidationError(payload.error ?? 'Too many search requests. Please wait a moment and try again.');
                        return;
                    }
                    throw new Error(payload.error ?? 'Failed to fetch exam data');
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
            const doc = new jsPDF({ unit: 'pt', format: 'a4' });

            const pageW = doc.internal.pageSize.getWidth();
            const pageH = doc.internal.pageSize.getHeight();
            const marginX = 40;
            const contentW = pageW - marginX * 2;

            // Palette (RGB) matching the app's warm amber primary
            const BRAND: [number, number, number] = [217, 119, 6];
            const INK: [number, number, number] = [28, 25, 23];
            const MUTED: [number, number, number] = [120, 113, 108];
            const BORDER: [number, number, number] = [231, 229, 228];
            const SOFT: [number, number, number] = [250, 250, 249];

            const statusFor = (date: string) => {
                const days = getDaysRemaining(date);
                if (days === null) return 'TBD';
                if (days < 0) return 'Done';
                if (days === 0) return 'Today';
                if (days === 1) return 'Tomorrow';
                return `${days} days`;
            };

            const drawHeader = () => {
                // Top accent bar
                doc.setFillColor(...BRAND);
                doc.rect(0, 0, pageW, 6, 'F');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.setTextColor(...BRAND);
                doc.text('SEU CAMPUSMATE', marginX, 38);

                doc.setFontSize(22);
                doc.setTextColor(...INK);
                doc.text('Exam Schedule', marginX, 62);

                // Count, right aligned
                doc.setFontSize(22);
                doc.setTextColor(...INK);
                doc.text(String(getTotalResults), pageW - marginX, 56, { align: 'right' });
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(...MUTED);
                doc.text(getTotalResults === 1 ? 'EXAM' : 'EXAMS', pageW - marginX, 67, { align: 'right' });

                doc.setFontSize(9);
                doc.setTextColor(...MUTED);
                const meta = `Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  •  ${courseCodes.join(', ')}`;
                doc.text(meta, marginX, 82, { maxWidth: contentW });

                return 100; // y position after header
            };

            const drawFooter = (pageNum: number) => {
                doc.setDrawColor(...BORDER);
                doc.setLineWidth(0.5);
                doc.line(marginX, pageH - 34, pageW - marginX, pageH - 34);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(...MUTED);
                doc.text('campusmate.app — verify with official CSE Department announcements.', marginX, pageH - 20);
                doc.text(`Page ${pageNum}`, pageW - marginX, pageH - 20, { align: 'right' });
            };

            // Column layout
            const dateX = marginX + 12;
            const courseX = marginX + 150;
            const timeRightX = pageW - marginX - 12;
            let pageNum = 1;
            let y = drawHeader();

            // Table header row
            const drawTableHead = (startY: number) => {
                doc.setFillColor(...SOFT);
                doc.rect(marginX, startY, contentW, 24, 'F');
                doc.setDrawColor(...BORDER);
                doc.setLineWidth(0.5);
                doc.rect(marginX, startY, contentW, 24, 'S');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.setTextColor(...MUTED);
                doc.text('DATE', dateX, startY + 16);
                doc.text('COURSE', courseX, startY + 16);
                doc.text('TIME', timeRightX, startY + 16, { align: 'right' });
                return startY + 24;
            };

            y = drawTableHead(y);

            getAllExams.forEach((exam, i) => {
                const titleLines = doc.splitTextToSize(exam.courseTitle, courseX - marginX > 0 ? timeRightX - courseX - 60 : 260);
                const facultyLines = doc.splitTextToSize(`Faculty: ${exam.faculty}`, timeRightX - courseX - 60);
                const rowH = Math.max(48, 22 + titleLines.length * 13 + facultyLines.length * 11);

                // Page break
                if (y + rowH > pageH - 50) {
                    drawFooter(pageNum);
                    doc.addPage();
                    pageNum += 1;
                    y = drawHeader();
                    y = drawTableHead(y);
                }

                // Zebra background
                if (i % 2 === 1) {
                    doc.setFillColor(...SOFT);
                    doc.rect(marginX, y, contentW, rowH, 'F');
                }

                // Date + status
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.setTextColor(...INK);
                const dateLines = doc.splitTextToSize(formatDate(exam.date), courseX - dateX - 10);
                doc.text(dateLines, dateX, y + 16);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(...BRAND);
                doc.text(statusFor(exam.date), dateX, y + 16 + dateLines.length * 11 + 4);

                // Course title + code + faculty
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(...INK);
                doc.text(titleLines, courseX, y + 16);
                let cy = y + 16 + titleLines.length * 13;
                doc.setFont('courier', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(...BRAND);
                doc.text(exam.courseCode, courseX, cy);
                cy += 12;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8.5);
                doc.setTextColor(...MUTED);
                doc.text(facultyLines, courseX, cy);

                // Time, right aligned
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.setTextColor(...INK);
                doc.text(formatTime(exam.startTime, exam.endTime), timeRightX, y + 16, { align: 'right' });

                // Row separator
                doc.setDrawColor(...BORDER);
                doc.setLineWidth(0.5);
                doc.line(marginX, y + rowH, pageW - marginX, y + rowH);

                y += rowH;
            });

            // Outer table border on last page section
            drawFooter(pageNum);

            doc.save(`exam-schedule-${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('Schedule PDF downloaded');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Error generating PDF');
        } finally {
            setDownloading(false);
        }
    }, [getTotalResults, getAllExams, courseCodes, formatDate, formatTime, getDaysRemaining]);

    // Download as PNG — branded, table-style schedule poster
    const downloadAsPNG = useCallback(async () => {
        if (getTotalResults === 0) return;

        setDownloading(true);
        try {
            const html2canvas = (await import('html2canvas-pro')).default;

            // Brand / theme palette (warm amber to match the app's primary)
            const BRAND = '#d97706';
            const INK = '#1c1917';
            const MUTED = '#78716c';
            const BORDER = '#e7e5e4';
            const SOFT = '#fafaf9';

            const escapeHtml = (value: string) =>
                value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            const statusFor = (date: string) => {
                const days = getDaysRemaining(date);
                if (days === null) return { label: 'TBD', bg: '#f5f5f4', fg: MUTED };
                if (days < 0) return { label: 'Done', bg: '#dcfce7', fg: '#15803d' };
                if (days === 0) return { label: 'Today', bg: '#ffedd5', fg: '#c2410c' };
                if (days === 1) return { label: 'Tomorrow', bg: '#fef3c7', fg: '#b45309' };
                return { label: `${days} days`, bg: '#fef3c7', fg: '#b45309' };
            };

            const rowsHtml = getAllExams
                .map((exam, i) => {
                    const status = statusFor(exam.date);
                    const bg = i % 2 === 0 ? '#ffffff' : SOFT;
                    return `
                        <tr style="background:${bg};">
                            <td style="padding:14px 16px;border-bottom:1px solid ${BORDER};vertical-align:top;width:200px;">
                                <div style="font-size:13px;font-weight:600;color:${INK};">${escapeHtml(formatDate(exam.date))}</div>
                                <div style="margin-top:6px;display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;background:${status.bg};color:${status.fg};">${status.label}</div>
                            </td>
                            <td style="padding:14px 16px;border-bottom:1px solid ${BORDER};vertical-align:top;">
                                <div style="font-size:14px;font-weight:600;color:${INK};line-height:1.35;">${escapeHtml(exam.courseTitle)}</div>
                                <div style="margin-top:4px;font-family:'Courier New',monospace;font-size:12px;font-weight:700;color:${BRAND};">${escapeHtml(exam.courseCode)}</div>
                                <div style="margin-top:4px;font-size:12px;color:${MUTED};">${escapeHtml(exam.faculty)}</div>
                            </td>
                            <td style="padding:14px 16px;border-bottom:1px solid ${BORDER};vertical-align:top;text-align:right;white-space:nowrap;width:150px;">
                                <div style="font-size:13px;font-weight:600;color:${INK};">${escapeHtml(formatTime(exam.startTime, exam.endTime))}</div>
                            </td>
                        </tr>`;
                })
                .join('');

            const wrapper = document.createElement('div');
            wrapper.style.cssText =
                "position:absolute;left:-9999px;top:0;width:860px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:" +
                INK +
                ';';

            wrapper.innerHTML = `
                <div style="height:6px;background:linear-gradient(90deg,${BRAND},#f59e0b);"></div>
                <div style="padding:36px 40px 28px;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div>
                            <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND};">SEU CampusMate</div>
                            <h1 style="margin:6px 0 0;font-size:28px;font-weight:800;color:${INK};">Exam Schedule</h1>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:34px;font-weight:800;line-height:1;color:${INK};">${getTotalResults}</div>
                            <div style="font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${MUTED};">${getTotalResults === 1 ? 'Exam' : 'Exams'}</div>
                        </div>
                    </div>
                    <div style="margin-top:14px;font-size:12px;color:${MUTED};">
                        Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        &nbsp;•&nbsp; ${escapeHtml(courseCodes.join(', '))}
                    </div>
                </div>
                <div style="padding:0 40px;">
                    <table style="width:100%;border-collapse:collapse;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
                        <thead>
                            <tr style="background:${SOFT};">
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${MUTED};border-bottom:1px solid ${BORDER};">Date</th>
                                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${MUTED};border-bottom:1px solid ${BORDER};">Course</th>
                                <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${MUTED};border-bottom:1px solid ${BORDER};">Time</th>
                            </tr>
                        </thead>
                        <tbody>${rowsHtml}</tbody>
                    </table>
                </div>
                <div style="padding:24px 40px 36px;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:${MUTED};">
                    <span>campusmate.app</span>
                    <span>Always verify with official CSE Department announcements.</span>
                </div>`;

            document.body.appendChild(wrapper);

            const canvas = await html2canvas(wrapper, {
                width: 860,
                height: wrapper.scrollHeight,
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: false,
                allowTaint: false,
                logging: false,
            });

            document.body.removeChild(wrapper);

            const link = document.createElement('a');
            link.download = `exam-schedule-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png', 0.95);

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Schedule image downloaded');
        } catch (error) {
            console.error('Error generating PNG:', error);
            toast.error('Error generating PNG');
        } finally {
            setDownloading(false);
        }
    }, [getTotalResults, getAllExams, courseCodes, formatDate, formatTime, getDaysRemaining]);

    return (
        <div className="pt-12 md:pt-16">
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
        </div>
    );
}
