import { NextResponse } from 'next/server';

/**
 * Refresh exam data from Google Sheets
 * 
 * Required Environment Variables:
 * - EXAMS_CSV_URL: Google Sheets CSV export URL
 *   Example: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0
 */
export async function POST() {
    try {
        // Get Google Sheets URL from environment variable (same as main exams API)
        const googleSheetsUrl = process.env.EXAMS_CSV_URL;
        
        if (!googleSheetsUrl) {
            return NextResponse.json(
                { error: 'Google Sheets URL not configured. Please set EXAMS_CSV_URL environment variable.' },
                { status: 500 }
            );
        }

        console.log('Refreshing exam data from:', googleSheetsUrl);

        // Fetch data from Google Sheets with cache-busting headers
        const response = await fetch(googleSheetsUrl, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
            // Disable Next.js caching for this request to get fresh data
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorMessage = `Failed to fetch from Google Sheets. Status: ${response.status} ${response.statusText}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        const data = await response.text();
        
        // Basic validation of CSV data
        if (!data || data.trim().length === 0) {
            throw new Error('Received empty data from Google Sheets');
        }

        // Check if data looks like CSV (should have some commas and newlines)
        if (!data.includes(',') || !data.includes('\n')) {
            console.warn('Data might not be valid CSV format');
        }

        console.log(`Successfully fetched exam data from Google Sheets. Data length: ${data.length} characters`);
        
        // Count approximate number of rows (excluding header)
        const lines = data.trim().split('\n');
        const dataRows = Math.max(0, lines.length - 1);
        
        return NextResponse.json({
            success: true,
            message: 'Exam data refreshed successfully from Google Sheets',
            timestamp: new Date().toISOString(),
            dataLength: data.length,
            rows: dataRows,
            status: 'Data fetched and cache invalidated'
        });

    } catch (error) {
        console.error('Error refreshing exam data:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return NextResponse.json(
            { 
                error: 'Failed to refresh exam data from Google Sheets',
                details: errorMessage,
                suggestion: 'Please check if the Google Sheets URL is accessible and properly configured.'
            },
            { status: 500 }
        );
    }
}

// Handle other HTTP methods
export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed. Use POST to refresh data.' },
        { status: 405 }
    );
}
