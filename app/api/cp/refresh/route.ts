import { NextResponse } from 'next/server';
import { refreshUsersFromSheet, getCacheStatus } from '@/data/cp/overrides';

export async function POST() {
  try {
    console.log('Refresh endpoint called - refreshing from API');
    
    // Get current API status
    const beforeStatus = await getCacheStatus();
    
    // Refresh the data (fetches from API)
    const users = await refreshUsersFromSheet();
    
    // Get updated status
    const afterStatus = await getCacheStatus();
    
    return NextResponse.json({
      success: true,
      message: 'Users refreshed successfully from API',
      userCount: users.length,
      users: users,
      localFileStatus: {
        before: beforeStatus,
        after: afterStatus
      },
      refreshedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error refreshing users from API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh users from API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return current API status
    const status = await getCacheStatus();
    
    return NextResponse.json({
      apiStatus: status,
      checkedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting cache status:', error);
    
    return NextResponse.json({
      error: 'Failed to get cache status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
