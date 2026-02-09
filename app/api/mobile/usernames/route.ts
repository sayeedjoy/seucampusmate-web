import { NextResponse } from 'next/server';
import { getManualInclude } from '@/data/cp/overrides';
import { mobileCorsHeaders } from '../cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: mobileCorsHeaders });
}

export async function GET() {
  try {
    const usernames = await getManualInclude();

    return NextResponse.json(
      {
        success: true,
        usernames,
        count: usernames.length,
        lastUpdated: new Date().toISOString(),
        source: 'api',
      },
      { headers: mobileCorsHeaders }
    );
  } catch (error) {
    console.error('Error fetching usernames for mobile app:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch usernames',
        usernames: [],
        count: 0,
        lastUpdated: new Date().toISOString(),
        source: 'fallback',
      },
      { status: 200, headers: mobileCorsHeaders }
    );
  }
}
