import { NextResponse } from 'next/server';
import { getLocalFileStats } from '@/lib/local-users';

export async function GET() {
  try {
    const fileStats = await getLocalFileStats();
    
    return NextResponse.json({
      status: 'healthy',
      service: 'CampusMate Mobile API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      local_file: {
        exists: fileStats.exists,
        user_count: fileStats.userCount,
        last_updated: fileStats.lastUpdated,
        source: fileStats.source
      },
      endpoints: {
        usernames: '/api/mobile/usernames',
        users: '/api/mobile/users',
        health: '/api/mobile/health'
      }
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Service unavailable',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
