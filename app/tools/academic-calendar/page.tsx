'use client';

import { useState, useEffect, useCallback } from 'react';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer/footer';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Calendar, BookOpen, Clock, RefreshCw } from 'lucide-react';

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
                            response = await fetch('https://proxy.rsbmr.com/data.json', {
                                method: 'GET',
                                headers: {
                                    'Accept': 'application/json',
                                },
                                signal: controller.signal,
                            });
                        } else {
                            // Retry attempts: More basic fetch
                            response = await fetch('https://proxy.rsbmr.com/data.json', {
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

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
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

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handleDateClick = (date: Date) => {
        const eventsForDate = getEventsForDate(date);
        if (eventsForDate.length > 0) {
            setSelectedDate(date);
            setShowEventPopup(true);
        }
    };

    const closeEventPopup = () => {
        setShowEventPopup(false);
        setSelectedDate(null);
    };

        if (loading) {
        return (
            <>
                <Navbar />
                <main className="pt-12">
                    <Container className="py-16">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading academic calendar...</p>
                            </div>
                        </div>
                    </Container>
                </main>
                <Footer />
            </>
        );
    }

    // Show error state if no data and error occurred
    if (hasError && events.length === 0) {
        return (
            <>
                <Navbar />
                <main className="pt-12">
                    <Container className="py-16">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Academic Calendar</h2>
                                <p className="text-gray-600 mb-6">There was an issue connecting to the server. Please try refreshing the page.</p>
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                                >
                                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    <span>{refreshing ? 'Retrying...' : 'Retry'}</span>
                                </button>
                            </div>
                        </div>
                    </Container>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="pt-12 sm:pt-16 bg-gradient-to-br from-gray-50 via-white to-violet-50/30 min-h-screen">
                <Container className="py-6 sm:py-8 lg:py-12">
                    <div className="max-w-7xl mx-auto">
                        {/* Hero Section with Refresh Button */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 lg:mb-6 gap-4">
                            <div className="text-center sm:text-left">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-gray-900 via-violet-700 to-purple-700 bg-clip-text text-transparent leading-tight">
                                    Academic Calendar
                                </h1>
                                <p className="text-sm sm:text-base lg:text-base xl:text-lg text-gray-600 max-w-2xl leading-relaxed">
                                    Stay updated with semester dates, holidays, and important academic events.
                                </p>
                            </div>
                            
                            {/* Refresh Button - Top right on desktop, below title on mobile */}
                            <div className="flex justify-center sm:justify-end sm:flex-shrink-0">
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing || loading}
                                    title="Refresh calendar data (Ctrl+R)"
                                    className={`
                                        flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all duration-200 shadow-sm
                                        ${refreshing || loading 
                                            ? 'bg-violet-100 border border-violet-200 cursor-not-allowed' 
                                            : 'bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 hover:shadow-md active:scale-95'
                                        }
                                    `}
                                >
                                    <RefreshCw className={`w-4 h-4 ${refreshing || loading ? 'animate-spin text-violet-700' : 'text-violet-600'}`} />
                                    <span className={`text-xs sm:text-sm font-medium ${refreshing || loading ? 'text-violet-700' : 'text-gray-700'}`}>
                                        {refreshing ? 'Refreshing...' : loading ? 'Loading...' : 'Refresh'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Fallback Data Notice */}
                        {usingFallbackData && (
                            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-amber-800 font-medium mb-1">
                                            Connection Issue Detected
                                        </p>
                                        <p className="text-xs text-amber-700">
                                            Unable to load the latest academic calendar data. Showing sample events for reference. 
                                            Please check your internet connection and click refresh to try again.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Semester Filter - Only affects Events sidebar */}
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-sm lg:text-base font-semibold text-gray-700">Filter Events by Semester:</h3>
                            </div>
                            <div className="flex flex-wrap gap-1.5 justify-center lg:justify-start">
                                <Badge 
                                    variant={selectedSemester === 'All' ? 'default' : 'secondary'}
                                    className="cursor-pointer px-3 py-1 text-xs font-medium hover:scale-105 transition-all duration-200 rounded-full"
                                    onClick={() => setSelectedSemester('All')}
                                >
                                    All
                                </Badge>
                                {getSemesters().map(semester => (
                                    <Badge 
                                        key={semester}
                                        variant={selectedSemester === semester ? 'default' : 'secondary'}
                                        className="cursor-pointer px-3 py-1 text-xs font-medium hover:scale-105 transition-all duration-200 rounded-full"
                                        onClick={() => setSelectedSemester(semester)}
                                    >
                                        {semester}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
                            {/* Calendar View - Full width on mobile, 2/3 on desktop */}
                            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 lg:p-5 hover:border-violet-200 transition-colors duration-200 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 lg:mb-4 gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-violet-600" />
                                        </div>
                                        <h2 className="text-lg lg:text-xl font-bold text-gray-900">Calendar</h2>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                                            className="p-2 hover:bg-violet-50 rounded-lg transition-colors duration-200 border border-slate-200"
                                        >
                                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <span className="font-semibold text-gray-900 min-w-[120px] lg:min-w-[140px] text-center text-sm lg:text-base px-3">
                                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                        </span>
                                        <button
                                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                                            className="p-2 hover:bg-violet-50 rounded-lg transition-colors duration-200 border border-slate-200"
                                        >
                                            <ChevronRight className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-2 lg:mb-3">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                        <div key={index} className="text-center text-xs lg:text-sm font-semibold text-gray-500 py-1.5">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1 lg:gap-2">
                                    {getDaysInMonth(currentDate).map((date, index) => (
                                        <div
                                            key={index}
                                            className={`
                                                min-h-[50px] lg:min-h-[65px] p-1.5 lg:p-2 border border-slate-100 relative rounded-lg cursor-pointer transition-all duration-200
                                                ${date ? 'hover:bg-violet-50 hover:border-violet-200' : 'bg-slate-50/50 cursor-default'}
                                                ${isToday(date!) ? 'bg-violet-100 border-violet-300' : ''}
                                                ${date && getEventsForDate(date).length > 0 ? 'border-violet-200 bg-violet-50/50' : ''}
                                            `}
                                            onClick={() => date && handleDateClick(date)}
                                        >
                                            {date && (
                                                <>
                                                    <div className={`text-xs lg:text-sm font-semibold mb-1 ${
                                                        isToday(date) ? 'text-violet-700' : 'text-gray-900'
                                                    }`}>
                                                        {date.getDate()}
                                                    </div>
                                                    {getEventsForDate(date).slice(0, 2).map((event, eventIndex) => {
                                                        const isImportant = isImportantEvent(event.Details);
                                                        return (
                                                            <div
                                                                key={eventIndex}
                                                                className={`text-[10px] lg:text-xs px-1 py-0.5 rounded mb-0.5 truncate font-medium ${
                                                                    isImportant 
                                                                        ? 'bg-red-100 text-red-700 border border-red-200' 
                                                                        : 'bg-violet-100 text-violet-700'
                                                                }`}
                                                                title={event.Details}
                                                            >
                                                                {event.Details.length > 6
                                                                    ? event.Details.substring(0, 6) + '..' 
                                                                    : event.Details
                                                                }
                                                            </div>
                                                        );
                                                    })}
                                                    {getEventsForDate(date).length > 2 && (
                                                        <div className="text-[10px] lg:text-xs bg-violet-200 text-violet-800 px-1 py-0.5 rounded font-medium">
                                                            +{getEventsForDate(date).length - 2}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Events Sidebar */}
                            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4 hover:border-violet-200 transition-colors duration-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <BookOpen className="w-3 h-3 text-blue-600" />
                                    </div>
                                    <h2 className="text-sm lg:text-base font-bold text-gray-900">
                                        Events {selectedSemester !== 'All' && `(${selectedSemester})`}
                                    </h2>
                                </div>

                                <div className="space-y-2 max-h-[400px] lg:max-h-[500px] overflow-y-auto">
                                    {filteredEvents.map((event, index) => {
                                        const isImportant = isImportantEvent(event.Details);
                                        return (
                                            <div 
                                                key={index} 
                                                className={`border-l-3 pl-3 py-2 rounded-r-lg hover:bg-opacity-80 transition-all duration-200 ${
                                                    isImportant 
                                                        ? 'border-red-400 bg-gradient-to-r from-red-50/70 to-transparent hover:from-red-100/70' 
                                                        : 'border-violet-400 bg-gradient-to-r from-violet-50/70 to-transparent hover:from-violet-100/70'
                                                }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`font-semibold mb-2 text-xs lg:text-sm leading-tight ${
                                                        isImportant ? 'text-red-900' : 'text-gray-900'
                                                    }`}>
                                                        {event.Details}
                                                    </h3>
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-full w-fit">
                                                            <Clock className={`w-3 h-3 ${isImportant ? 'text-red-600' : 'text-violet-600'}`} />
                                                            <span className="font-medium text-[10px] lg:text-xs">{event.Date}</span>
                                                        </div>
                                                        <Badge 
                                                            variant="outline" 
                                                            className={`text-[10px] lg:text-xs font-medium w-fit ${
                                                                isImportant 
                                                                    ? 'border-red-200 text-red-700' 
                                                                    : 'border-violet-200 text-violet-700'
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
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <Calendar className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-sm font-medium">No events found for the selected semester.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-6 lg:mt-8 text-center">
                            <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-xl p-4 lg:p-6 shadow-sm">
                                <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-2 lg:mb-3">
                                    Stay Organized with CampusMate
                                </h3>
                                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-xs lg:text-sm">
                                    Never miss important academic deadlines, holidays, or events. 
                                    Our comprehensive calendar helps you plan your semester effectively.
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />

            {/* Event Popup */}
            {showEventPopup && selectedDate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold">Events</h3>
                                <button
                                    onClick={closeEventPopup}
                                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-violet-100 font-medium text-sm">{formatFullDate(selectedDate)}</p>
                        </div>
                        
                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                            {getEventsForDate(selectedDate).map((event, index) => {
                                const isImportant = isImportantEvent(event.Details);
                                return (
                                    <div key={index} className="mb-3 last:mb-0">
                                        <div className={`border-l-3 pl-3 py-2 rounded-r-lg ${
                                            isImportant 
                                                ? 'border-red-400 bg-gradient-to-r from-red-50 to-transparent' 
                                                : 'border-violet-400 bg-gradient-to-r from-violet-50 to-transparent'
                                        }`}>
                                            <h4 className={`font-semibold mb-2 leading-relaxed text-sm ${
                                                isImportant ? 'text-red-900' : 'text-gray-900'
                                            }`}>
                                                {event.Details}
                                            </h4>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-full">
                                                    <Clock className={`w-3 h-3 ${isImportant ? 'text-red-600' : 'text-violet-600'}`} />
                                                    <span className="font-medium text-xs">{event.Date}</span>
                                                </div>
                                                <Badge 
                                                    variant="outline" 
                                                    className={`text-xs font-medium ${
                                                        isImportant 
                                                            ? 'border-red-200 text-red-700' 
                                                            : 'border-violet-200 text-violet-700'
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
                    </div>
                </div>
            )}
        </>
    );
}