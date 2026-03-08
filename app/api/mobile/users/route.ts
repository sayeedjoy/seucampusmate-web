import { NextResponse } from 'next/server';
import { getManualInclude, getExcludeList, getCacheStatus } from '@/data/cp/overrides';
import { mobileCorsHeaders } from '../cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: mobileCorsHeaders });
}

export async function GET() {
  try {
    const includeList = await getManualInclude();
    const excludeList = await getExcludeList();
    const status = await getCacheStatus();

    return NextResponse.json(
      {
        success: true,
        data: {
          included_usernames: includeList,
          excluded_usernames: excludeList,
          total_included: includeList.length,
          total_excluded: excludeList.length,
          total_users: includeList.length + excludeList.length,
        },
        metadata: {
          last_updated: status.localFile.lastUpdated,
          source: status.localFile.source,
          file_exists: status.localFile.exists,
          fetched_at: new Date().toISOString(),
        },
      },
      { headers: mobileCorsHeaders }
    );
  } catch (error) {
    console.error('Error fetching user data for mobile app:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user data',
        data: {
          included_usernames: [],
          excluded_usernames: [],
          total_included: 0,
          total_excluded: 0,
          total_users: 0,
        },
        metadata: {
          last_updated: null,
          source: 'fallback',
          file_exists: false,
          fetched_at: new Date().toISOString(),
        },
      },
      { status: 200, headers: mobileCorsHeaders }
    );
  }
}
