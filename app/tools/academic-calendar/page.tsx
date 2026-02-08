'use client';

import { useState, useEffect, useCallback } from 'react';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, BookOpen, Clock, RefreshCw } from 'lucide-react';

const ACADEMIC_CALENDAR_API_URL =
    process.env.NEXT_PUBLIC_ACADEMIC_CALENDAR_URL || 'https://proxy.rsbmr.com/data.json';

interface AcademicEvent {
    Semester: string;
    Date: string;
    Details: string;
}

const CACHE_KEY = 'academic-calendar-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Fallback data in case the API is completely inaccessible
const FALLBACK_DATA: AcademicEvent[] = [
    {
        Semester: "Spring 2025",
        Date: "Jan 06 - 09",
        Details: "Pre-registration for Spring 2025"
    },
    {
        Semester: "Spring 2025", 
        Date: "Feb 03",
        Details: "Classes begin for Spring 2025"
    },
    {
        Semester: "Spring 2025",
        Date: "Feb 17",
        Details: "Last day for course add/drop"
    },
    {
        Semester: "Spring 2025",
        Date: "Mar 15",
        Details: "Mid-term examinations begin"
    },
    {
        Semester: "Spring 2025",
        Date: "Apr 10",
        Details: "Registration for Summer 2025"
    },
    {
        Semester: "Spring 2025",
        Date: "May 30",
        Details: "Classes end for Spring 2025"
    },
    {
        Semester: "Spring 2025",
        Date: "Jun 05",
        Details: "Final examinations end"
    },
    {
        Semester: "Summer 2025",
        Date: "Jun 16",
        Details: "Classes begin for Summer 2025"
    },
    {
        Semester: "Summer 2025",
        Date: "Jul 15",
        Details: "Mid-term examinations"
    },
    {
        Semester: "Summer 2025",
        Date: "Aug 30",
        Details: "Classes end for Summer 2025"
    },
    {
        Semester: "Fall 2025",
        Date: "Sep 01",
        Details: "Pre-registration for Fall 2025"
    },
    {
        Semester: "Fall 2025",
        Date: "Sep 15",
        Details: "Classes begin for Fall 2025"
    }
];

interface CacheData {
    data: AcademicEvent[];
    timestamp: number;
}

export default function AcademicCalendarPage() {
    const [events, setEvents] = useState<AcademicEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedSemester, setSelectedSemester] = useState<string>('All');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [usingFallbackData, setUsingFallbackData] = useState(false);

    // Check if cached data is still valid
    const getCachedData = (): AcademicEvent[] | null => {
        try {
            // Check if we're in the browser environment
            if (typeof window === 'undefined') return null;
            
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;
            
            const cacheData: CacheData = JSON.parse(cached);
            const now = Date.now();
            
            if (now - cacheData.timestamp < CACHE_DURATION) {
                return cacheData.data;
            }
            
            // Cache expired, remove it
            localStorage.removeItem(CACHE_KEY);
            return null;
        } catch (error) {
            console.error('Error reading cache:', error);
            return null;
        }
    };

    // Save data to cache
    const setCachedData = (data: AcademicEvent[]) => {
        try {
            // Check if we're in the browser environment
            if (typeof window === 'undefined') return;
            
            const cacheData: CacheData = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    };

    const fetchAcademicCalendar = useCallback(async (forceRefresh = false) => {
        // Check cache first unless force refresh
        if (!forceRefresh && !initialized) {
            const cachedData = getCachedData();
            if (cachedData && cachedData.length > 0) {
                setEvents(cachedData);
                setLoading(false);
                setInitialized(true);
                setUsingFallbackData(false);
                return;
            }
        }

        const setLoadingState = forceRefresh ? setRefreshing : setLoading;
        setLoadingState(true);
        
        try {
            // Simple retry mechanism
            const maxRetries = 2;
            
            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`Fetching academic calendar data... (attempt ${attempt + 1}/${maxRetries + 1})`);
                    
                    // Add a small delay between retries
                    if (attempt > 0) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    }
                    
                    // Try different fetch configurations based on attempt
                    let response;
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
                    
                    try {
                        if (attempt === 0) {
                            // First attempt: Standard fetch
                            response = await fetch(ACADEMIC_CALENDAR_API_URL, {
                                method: 'GET',
                                headers: {
                                    'Accept': 'application/json',
                                },
                                signal: controller.signal,
                            });
                        } else {
                            // Retry attempts: More basic fetch
                            response = await fetch(ACADEMIC_CALENDAR_API_URL, {
                                signal: controller.signal,
                            });
                        }
                    } finally {
                        clearTimeout(timeoutId);
                    }
                    
                    console.log('Response status:', response.status);
                    console.log('Response ok:', response.ok);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    console.log('Received data:', data);
                    console.log('Data length:', data?.length);
                    
                    if (data && Array.isArray(data) && data.length > 0) {
                        setEvents(data);
                        setCachedData(data);
                        setInitialized(true);
                        setHasError(false);
                        setUsingFallbackData(false);
                        console.log('Successfully loaded academic calendar data');
                        
                        // Show success toast only for manual refresh
                        if (forceRefresh) {
                            toast.success('Calendar Updated', {
                                description: 'Academic calendar data has been refreshed successfully.',
                            });
                        }
                        
                        // Success - exit and reset loading state
                        setLoadingState(false);
                        return;
                    } else {
                        throw new Error('Invalid or empty data received');
                    }
                } catch (error) {
                    console.error(`Attempt ${attempt + 1} failed:`, error);
                    
                    // Check if it's a network error
                    if (error instanceof TypeError && error.message === 'Failed to fetch') {
                        console.error('Network error detected - likely CORS or connectivity issue');
                    }
                    
                    // If this was the last attempt, break out of the loop
                    if (attempt === maxRetries) {
                        break;
                    }
                }
            }
            
            // All attempts failed, use fallback data
            console.error('All fetch attempts failed, using fallback data');
            
            // Show error toast only for manual refresh
            if (forceRefresh) {
                toast.error('Refresh Failed', {
                    description: 'Unable to fetch latest data. Using cached or sample data.',
                });
            }
            
            // Try to use cached data as fallback
            const cachedData = getCachedData();
            if (cachedData && cachedData.length > 0) {
                console.log('Using cached data as fallback');
                setEvents(cachedData);
                setInitialized(true);
                setHasError(false);
                setUsingFallbackData(false);
            } else {
                // If no cache available, use fallback data
                console.log('Using fallback data due to fetch failure');
                setEvents(FALLBACK_DATA);
                setInitialized(true);
                setHasError(false);
                setUsingFallbackData(true);
            }
        } catch (error) {
            console.error('Unexpected error in fetchAcademicCalendar:', error);
            
            // Fallback for any unexpected errors
            if (forceRefresh) {
                toast.error('Refresh Failed', {
                    description: 'An unexpected error occurred. Please try again.',
                });
            }
        } finally {
            // Always reset loading state
            setLoadingState(false);
        }
    }, [initialized]);

    const handleRefresh = () => {
        console.log('Refresh button clicked. Current state:', { refreshing, loading });
        
        if (refreshing || loading) {
            console.log('Refresh blocked - already in progress');
            return; // Prevent multiple concurrent refreshes
        }
        
        console.log('Starting refresh...');
        toast.info('Refreshing...', {
            description: 'Fetching latest academic calendar data.',
        });
        
        // Safety timeout to reset refreshing state if something goes wrong
        const safetyTimeout = setTimeout(() => {
            console.warn('Safety timeout triggered - forcing refresh state reset');
            setRefreshing(false);
            toast.error('Refresh Timeout', {
                description: 'The refresh operation took too long and was cancelled.',
            });
        }, 30000); // 30 seconds safety timeout
        
        // Clear safety timeout when refresh completes
        fetchAcademicCalendar(true).finally(() => {
            clearTimeout(safetyTimeout);
        });
    };

    useEffect(() => {
        // Only fetch if not initialized
        if (!initialized) {
            fetchAcademicCalendar();
        }
    }, [fetchAcademicCalendar, initialized]);

    // Add keyboard shortcut for refresh (Ctrl+R or Cmd+R)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
                event.preventDefault();
                if (!refreshing && !loading) {
                    toast.info('Refreshing...', {
                        description: 'Fetching latest academic calendar data.',
                    });
                    fetchAcademicCalendar(true);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [refreshing, loading, fetchAcademicCalendar]);

    const getSemesters = () => {
        const semesters = [...new Set(events.map(event => event.Semester))];
        return semesters;
    };

    const filteredEvents = selectedSemester === 'All' 
        ? events 
        : events.filter(event => event.Semester === selectedSemester);



    const parseEventDate = (dateStr: string): Date | null => {
        try {
            // Clean the date string
            const cleanDateStr = dateStr.trim();
            
            // Handle date ranges - take the first date
            const singleDateStr = cleanDateStr.split(' - ')[0].trim();
            
            // Handle different date formats
            const patterns = [
                // Format: "Jan 06", "Feb 03", "March 07", etc.
                { regex: /^(\w{3,9})\s+(\d{1,2})$/, format: 'month day' },
                // Format: "Feb-03", "Mar-20", etc.
                { regex: /^(\w{3,9})-(\d{1,2})$/, format: 'month day' },
                // Format: "January 25, 2026", "Jan 25, 2026"
                { regex: /^(\w{3,9})\s+(\d{1,2}),?\s+(\d{4})$/, format: 'month day year' },
                // Format: "July 21-23" (take first date)
                { regex: /^(\w{3,9})\s+(\d{1,2})-\d{1,2}$/, format: 'month day' },
                // Format: "After 2nd installment payment" (skip these)
                { regex: /^After/, format: 'skip' }
            ];

            for (const pattern of patterns) {
                const match = singleDateStr.match(pattern.regex);
                if (match) {
                    if (pattern.format === 'skip') {
                        return null;
                    }
                    
                    const monthStr = match[1];
                    const day = parseInt(match[2]);
                    let year = 2025; // Default year
                    
                    if (pattern.format === 'month day year') {
                        year = parseInt(match[3]);
                    }
                    
                    // Convert month name to month index
                    const monthMap: { [key: string]: number } = {
                        'jan': 0, 'january': 0,
                        'feb': 1, 'february': 1,
                        'mar': 2, 'march': 2,
                        'apr': 3, 'april': 3,
                        'may': 4,
                        'jun': 5, 'june': 5,
                        'jul': 6, 'july': 6,
                        'aug': 7, 'august': 7,
                        'sep': 8, 'sept': 8, 'september': 8,
                        'oct': 9, 'october': 9,
                        'nov': 10, 'november': 10,
                        'dec': 11, 'december': 11
                    };
                    
                    const monthIndex = monthMap[monthStr.toLowerCase()];
                    if (monthIndex !== undefined && day >= 1 && day <= 31) {
                        return new Date(year, monthIndex, day);
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error parsing date:', dateStr, error);
            return null;
        }
    };

    const parseDateRange = (dateStr: string): { start: Date | null; end: Date | null } => {
        try {
            const cleanDateStr = dateStr.trim();

            // Case 1: Same-month compact range like "July 21-23" or with optional year at end
            const sameMonthCompact = cleanDateStr.match(/^(\w{3,9})\s+(\d{1,2})-(\d{1,2})(?:,\s*(\d{4}))?$/);
            if (sameMonthCompact) {
                const monthStr = sameMonthCompact[1];
                const startDay = parseInt(sameMonthCompact[2]);
                const endDay = parseInt(sameMonthCompact[3]);
                const year = sameMonthCompact[4] ? parseInt(sameMonthCompact[4]) : 2025;
                const start = parseEventDate(`${monthStr} ${startDay}, ${year}`);
                const end = parseEventDate(`${monthStr} ${endDay}, ${year}`);
                return { start, end };
            }

            // Case 2: Range separated with spaces around dash: "March 27 - April 06" or "Jan 11 - 15, 2026"
            if (cleanDateStr.includes(' - ')) {
                const [rawStart, rawEnd] = cleanDateStr.split(' - ');
                let startStr = rawStart.trim();
                let endStr = rawEnd.trim();

                // Try to detect month and year from start
                const startWithYear = startStr.match(/^(\w{3,9})\s+(\d{1,2}),\s*(\d{4})$/);
                const startWithMonthOnly = startStr.match(/^(\w{3,9})\s+(\d{1,2})$/);
                let startYear = 2025;
                let startMonth: string | null = null;
                let startDay: number | null = null;
                if (startWithYear) {
                    startMonth = startWithYear[1];
                    startDay = parseInt(startWithYear[2]);
                    startYear = parseInt(startWithYear[3]);
                } else if (startWithMonthOnly) {
                    startMonth = startWithMonthOnly[1];
                    startDay = parseInt(startWithMonthOnly[2]);
                }

                // End part may be just day, or day with year, or full month day[, year]
                let endYearUsed: number | null = null;
                const endHasMonth = /[A-Za-z]/.test(endStr);
                if (!endHasMonth && startMonth) {
                    // Extract possible day and optional year like "15, 2026" or just "15"
                    const m = endStr.match(/^(\d{1,2})(?:,\s*(\d{4}))?$/);
                    if (m) {
                        const endDay = parseInt(m[1]);
                        endYearUsed = m[2] ? parseInt(m[2]) : startYear;
                        endStr = `${startMonth} ${endDay}, ${endYearUsed}`;
                    }
                } else {
                    // Try to read year explicitly from endStr if present
                    const endWithYear = endStr.match(/^(\w{3,9})\s+(\d{1,2}),\s*(\d{4})$/);
                    if (endWithYear) {
                        endYearUsed = parseInt(endWithYear[3]);
                    }
                }

                // If end contains an explicit year and start lacks one, align start year to end year
                if (!startWithYear && startMonth && startDay !== null && endYearUsed) {
                    startStr = `${startMonth} ${startDay}, ${endYearUsed}`;
                }

                const start = parseEventDate(startStr);
                const end = parseEventDate(endStr);
                return { start, end };
            }

            // Case 3: Single date
            const singleDate = parseEventDate(cleanDateStr);
            return { start: singleDate, end: singleDate };
        } catch (error) {
            console.error('Error parsing date range:', dateStr, error);
            return { start: null, end: null };
        }
    };

    const isImportantEvent = (eventDetails: string) => {
        const details = eventDetails.toLowerCase();
        return details.includes('payment') || 
               details.includes('exam') || 
               details.includes('fee') || 
               details.includes('tuition') || 
               details.includes('installment') ||
               details.includes('final') ||
               details.includes('midterm') ||
               details.includes('test');
    };

    const getEventsForDate = (date: Date | null) => {
        if (!date) return [];
        // Calendar view shows ALL events regardless of semester filter
        const source = events;
        return source.filter(event => {
            const { start, end } = parseDateRange(event.Date);
            if (start && end) {
                // Normalize time component to avoid TZ edge cases
                const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                return d >= s && d <= e;
            }
            return false;
        });
    };

    const isToday = (date: Date | null) => {
        if (!date) return false;
        const today = new Date();
        return date.getDate() === today.getDate() && 
               date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear();
    };



    const formatFullDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date ?? null);
        if (date && getEventsForDate(date).length > 0) {
            setShowEventPopup(true);
        }
    };

    const closeEventPopup = () => {
        setShowEventPopup(false);
        setSelectedDate(null);
    };

        if (loading) {
        return (
            <div className="pt-12" aria-busy="true" aria-live="polite">
                <Container className="py-16">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" aria-hidden />
                            <p className="mt-4 text-muted-foreground">Loading academic calendar...</p>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    // Show error state if no data and error occurred
    if (hasError && events.length === 0) {
        return (
            <div className="pt-12">
                <Container className="py-16">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">Unable to Load Academic Calendar</h2>
                            <p className="text-muted-foreground mb-6">There was an issue connecting to the server. Please try refreshing the page.</p>
                            <Button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="mx-auto"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                <span>{refreshing ? 'Retrying...' : 'Retry'}</span>
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <>
        <div className="pt-12 sm:pt-16 bg-gradient-to-br from-muted via-background to-violet-50/30 dark:from-muted/50 dark:via-background dark:to-violet-950/20 min-h-screen">
                <Container className="py-6 sm:py-8 lg:py-12">
                    <div className="max-w-7xl mx-auto">
                        {/* Hero Section with Refresh Button */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 lg:mb-6 gap-4">
                            <div className="text-center sm:text-left">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-foreground via-primary to-primary bg-clip-text text-transparent leading-tight">
                                    Academic Calendar
                                </h1>
                                <p className="text-sm sm:text-base lg:text-base xl:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                                    Stay updated with semester dates, holidays, and important academic events.
                                </p>
                            </div>
                            
                            {/* Refresh Button - Top right on desktop, below title on mobile */}
                            <div className="flex justify-center sm:justify-end sm:flex-shrink-0">
                                <Button
                                    variant="outline"
                                    onClick={handleRefresh}
                                    disabled={refreshing || loading}
                                    title="Refresh calendar data (Ctrl+R)"
                                    aria-label={refreshing ? 'Refreshing calendar' : 'Refresh calendar data'}
                                >
                                    <RefreshCw className={`w-4 h-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
                                    <span className="sr-only sm:not-sr-only sm:inline">
                                        {refreshing ? 'Refreshing...' : loading ? 'Loading...' : 'Refresh'}
                                    </span>
                                </Button>
                            </div>
                        </div>

                        {/* Fallback Data Notice */}
                        {usingFallbackData && (
                            <Alert variant="warning" className="mb-4">
                                <AlertTitle>Connection Issue Detected</AlertTitle>
                                <AlertDescription>
                                    Unable to load the latest academic calendar data. Showing sample events for reference.
                                    Please check your internet connection and click refresh to try again.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
                            {/* Calendar Card - Full width on mobile, 2/3 on desktop; large cell size for visibility */}
                            <Card className="lg:col-span-2 hover:border-primary/30 transition-colors duration-200 shadow-sm [--cell-size:3rem] min-[640px]:[--cell-size:3.25rem] lg:[--cell-size:3.5rem]">
                                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                                        <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                                            <CalendarIcon className="w-4 h-4 text-primary" />
                                        </div>
                                        Calendar
                                    </CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentDate(new Date())}
                                        aria-label="Go to today"
                                    >
                                        Today
                                    </Button>
                                </CardHeader>
                                <CardContent className="flex justify-center py-4 sm:py-6">
                                    <Calendar
                                        mode="single"
                                        month={currentDate}
                                        onMonthChange={setCurrentDate}
                                        selected={selectedDate ?? undefined}
                                        onSelect={handleDateSelect}
                                        modifiers={{
                                            hasEvents: (d) => getEventsForDate(d).length > 0,
                                        }}
                                        modifiersClassNames={{
                                            hasEvents: 'bg-primary/10 dark:bg-primary/20 border-primary/30 relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:size-1 after:rounded-full after:bg-primary',
                                        }}
                                        className="rounded-lg border-0"
                                    />
                                </CardContent>
                            </Card>

                            {/* Events Card */}
                            <Card className="lg:col-span-1 hover:border-primary/30 transition-colors duration-200 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <div className="w-6 h-6 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                                            <BookOpen className="w-3 h-3 text-primary" />
                                        </div>
                                        Events
                                    </CardTitle>
                                    <Select
                                        value={selectedSemester}
                                        onValueChange={setSelectedSemester}
                                    >
                                        <SelectTrigger className="w-[140px] h-8" aria-label="Filter events by semester">
                                            <SelectValue placeholder="Semester" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All</SelectItem>
                                            {getSemesters().map((semester) => (
                                                <SelectItem key={semester} value={semester}>
                                                    {semester}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardHeader>
                                <CardContent>
                                <div className="space-y-2 max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-1">
                                    {filteredEvents.map((event, index) => {
                                        const isImportant = isImportantEvent(event.Details);
                                        return (
                                            <div 
                                                key={index} 
                                                className={`border-l-3 pl-3 py-2 rounded-r-lg hover:bg-opacity-80 transition-all duration-200 ${
                                                    isImportant 
                                                        ? 'border-red-400 dark:border-red-600 bg-gradient-to-r from-red-50/70 to-transparent dark:from-red-950/40 hover:from-red-100/70 dark:hover:from-red-900/40' 
                                                        : 'border-primary/50 bg-gradient-to-r from-primary/10 to-transparent dark:from-primary/20 hover:from-primary/20 dark:hover:from-primary/30'
                                                }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`font-semibold mb-2 text-xs lg:text-sm leading-tight ${
                                                        isImportant ? 'text-red-900 dark:text-red-200' : 'text-foreground'
                                                    }`}>
                                                        {event.Details}
                                                    </h3>
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-1.5 bg-card border border-border px-2 py-1 rounded-full w-fit">
                                                            <Clock className={`w-3 h-3 ${isImportant ? 'text-red-600 dark:text-red-400' : 'text-primary'}`} />
                                                            <span className="font-medium text-[10px] lg:text-xs">{event.Date}</span>
                                                        </div>
                                                        <Badge 
                                                            variant="outline" 
                                                            className={`text-[10px] lg:text-xs font-medium w-fit ${
                                                                isImportant 
                                                                    ? 'border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' 
                                                                    : 'border-primary/50 text-primary'
                                                            }`}
                                                        >
                                                            {event.Semester}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {filteredEvents.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <CalendarIcon className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium">No events found for the selected semester.</p>
                                    </div>
                                )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-6 lg:mt-8 text-center">
                            <div className="bg-gradient-to-r from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/20 border border-border rounded-xl p-4 lg:p-6 shadow-sm">
                                <h3 className="text-base lg:text-lg font-bold text-foreground mb-2 lg:mb-3">
                                    Stay Organized with CampusMate
                                </h3>
                                <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-xs lg:text-sm">
                                    Never miss important academic deadlines, holidays, or events. 
                                    Our comprehensive calendar helps you plan your semester effectively.
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
        </div>

        {/* Event detail Dialog */}
            <Dialog open={showEventPopup} onOpenChange={(open) => { if (!open) closeEventPopup(); }}>
                <DialogContent
                    className="max-w-md w-[calc(100%-2rem)] sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col rounded-t-2xl sm:rounded-2xl data-[state=open]:slide-in-from-bottom-[20%] sm:data-[state=open]:slide-in-from-bottom-0"
                    aria-describedby={undefined}
                >
                    <DialogHeader>
                        <DialogTitle>Events</DialogTitle>
                        {selectedDate && (
                            <p className="text-sm text-muted-foreground font-medium">
                                {formatFullDate(selectedDate)}
                            </p>
                        )}
                    </DialogHeader>
                    <div className="overflow-y-auto -mx-4 px-4 max-h-[60vh]">
                        {selectedDate &&
                            getEventsForDate(selectedDate).map((event, index) => {
                                const isImportant = isImportantEvent(event.Details);
                                return (
                                    <div key={index} className="mb-3 last:mb-0">
                                        <div
                                            className={`border-l-4 pl-3 py-2 rounded-r-lg ${
                                                isImportant
                                                    ? 'border-red-400 dark:border-red-600 bg-gradient-to-r from-red-50 to-transparent dark:from-red-950/40'
                                                    : 'border-primary/50 bg-gradient-to-r from-primary/10 to-transparent dark:from-primary/20'
                                            }`}
                                        >
                                            <h4
                                                className={`font-semibold mb-2 leading-relaxed text-sm ${
                                                    isImportant ? 'text-red-900 dark:text-red-200' : 'text-foreground'
                                                }`}
                                            >
                                                {event.Details}
                                            </h4>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                                <div className="flex items-center gap-1 bg-background border border-border px-2 py-1 rounded-full">
                                                    <Clock className={`w-3 h-3 ${isImportant ? 'text-red-600 dark:text-red-400' : 'text-primary'}`} />
                                                    <span className="font-medium text-xs">{event.Date}</span>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs font-medium ${
                                                        isImportant
                                                            ? 'border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                                                            : 'border-primary/50 text-primary'
                                                    }`}
                                                >
                                                    {event.Semester}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}