import { NextResponse } from 'next/server';
import { getManualInclude } from '@/data/cp/overrides';

export async function GET() {
  try {
    // Fetch usernames from API
    const usernames = await getManualInclude();
    
    return NextResponse.json({
      success: true,
      usernames,
      count: usernames.length,
      lastUpdated: new Date().toISOString(),
      source: 'api'
    });
    
  } catch (error) {
    console.error('Error fetching usernames for mobile app:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch usernames',
      usernames: [],
      count: 0
    }, { status: 500 });
  }
}
