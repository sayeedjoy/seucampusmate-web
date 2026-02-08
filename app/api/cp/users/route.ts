import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getCFUsersFast } from '@/lib/cp/scrape-fast';
import { getCFUsersWithSubmissions } from '@/lib/cp/scrape-submissions';
import { CFUser } from '@/lib/cp/types';
import { 
  getBackgroundCache, 
  getCacheStatus, 
  refreshBackgroundCache,
  initializeBackgroundCache 
} from '@/lib/cp/background-cache';
import {
  getFallbackCache,
  updateFallbackCache,
  getFallbackCacheStatus
} from '@/lib/cp/fallback-cache';

// Redis client for persistent caching (optional)
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
let redis: Redis | null = null;
if (redisUrl && redisToken) {
  try {
    // Validate URL to avoid ERR_INVALID_URL
    new URL(redisUrl);
    redis = new Redis({ url: redisUrl, token: redisToken });
  } catch (e) {
    console.warn('Upstash Redis disabled due to invalid URL configuration:', e);
    redis = null;
  }
}

const REDIS_CACHE_KEY = 'cp_users_leaderboard';
const REDIS_CACHE_TTL = 259200; // 3 days

interface CachedData {
  users: CFUser[];
  timestamp: number;
}

// Server-side cache for immediate responses
let serverCache: CFUser[] | null = null;
let serverCacheTimestamp: number = 0;
const SERVER_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';
  const includeSubmissions = searchParams.get('submissions') === 'true';
  
  const now = Date.now();
  
  // Initialize background cache if not already done (server only)
  if (typeof window === 'undefined') {
    try {
      await initializeBackgroundCache();
    } catch (error) {
      console.error('Failed to initialize background cache:', error);
    }
  }
  
  // Check Redis cache first for all visitors
  if (redis) {
    try {
      const redisData: CachedData | null = await redis.get<CachedData>(REDIS_CACHE_KEY);
      
      if (redisData && !forceRefresh) {
        // Return Redis cached data immediately for all visitors
        return NextResponse.json({
          users: redisData.users,
          cached: true,
          cacheAge: Math.floor((now - redisData.timestamp) / 1000),
          nextRefreshIn: Math.ceil((SERVER_CACHE_DURATION - (now - redisData.timestamp)) / 1000),
          stale: false,
          source: 'redis'
        });
      }
    } catch (error) {
      console.error('Redis cache error:', error);
      // Continue with other caching mechanisms if Redis fails
    }
  }
  
  // Check if we have valid server cache
  const isServerCacheValid = serverCache && (now - serverCacheTimestamp) < SERVER_CACHE_DURATION;
  
  // If not forcing refresh and we have valid server cache, return it immediately
  if (!forceRefresh && isServerCacheValid) {
    const cacheStatus = typeof window === 'undefined' ? getCacheStatus() : { isStale: false };
    return NextResponse.json({
      users: serverCache,
      cached: true,
      cacheAge: Math.floor((now - serverCacheTimestamp) / 1000),
      nextRefreshIn: Math.ceil((SERVER_CACHE_DURATION - (now - serverCacheTimestamp)) / 1000),
      stale: cacheStatus.isStale,
      source: 'server'
    });
  }
  
  // Check background cache for instant response
  const backgroundData = typeof window === 'undefined' ? getBackgroundCache() : null;
  if (!forceRefresh && backgroundData) {
    const cacheStatus = getCacheStatus();
    
    // Update server cache for faster subsequent requests
    serverCache = backgroundData;
    serverCacheTimestamp = now;
    
    return NextResponse.json({
      users: backgroundData,
      cached: true,
      cacheAge: Math.floor(cacheStatus.age / 1000),
      nextRefreshIn: Math.ceil((SERVER_CACHE_DURATION - cacheStatus.age) / 1000),
      stale: cacheStatus.isStale,
      source: 'background'
    });
  }
  
  // If forcing refresh, fetch fresh data
  if (forceRefresh) {
    console.log('Force refresh requested - fetching fresh data from Codeforces API');
  } else {
    // If no cache available, try to fetch fresh data but don't block
    console.log('No cache available - attempting to fetch fresh data');
  }
  
  try {
    // Fetch fresh data using appropriate method
    const users = includeSubmissions 
      ? await getCFUsersWithSubmissions()
      : await getCFUsersFast();
    
    // Update all caches including Redis
    serverCache = users;
    serverCacheTimestamp = now;
    
    // Update Redis cache for persistent storage
    if (redis) {
      try {
        await redis.setex(REDIS_CACHE_KEY, REDIS_CACHE_TTL, {
          users,
          timestamp: now
        });
        console.log('Updated Redis cache with fresh data');
      } catch (error) {
        console.error('Failed to update Redis cache:', error);
      }
    }
    
    // Update fallback cache with real data
    updateFallbackCache(users);
    
    // Also update background cache (server only)
    if (typeof window === 'undefined') {
      try {
        await refreshBackgroundCache();
      } catch (error) {
        console.error('Failed to update background cache:', error);
      }
    }
    
    return NextResponse.json({
      users,
      cached: false,
      cacheAge: 0,
      nextRefreshIn: SERVER_CACHE_DURATION / 1000,
      source: 'fresh'
    });
  } catch (error) {
    console.error('Error fetching CF users:', error);
    
    // Try to get data from Redis as fallback
    if (redis) {
      try {
        const redisData: CachedData | null = await redis.get<CachedData>(REDIS_CACHE_KEY);
        if (redisData) {
          return NextResponse.json({
            users: redisData.users,
            cached: true,
            stale: true,
            error: 'Failed to fetch fresh data, returning Redis cached data',
            cacheAge: Math.floor((now - redisData.timestamp) / 1000),
            source: 'redis-fallback'
          });
        }
      } catch (redisError) {
        console.error('Redis fallback error:', redisError);
      }
    }
    
    // Return server cache if available, even if stale
    if (serverCache) {
      return NextResponse.json({
        users: serverCache,
        cached: true,
        stale: true,
        error: 'Failed to fetch fresh data, returning cached data',
        cacheAge: Math.floor((now - serverCacheTimestamp) / 1000),
        source: 'server-fallback'
      });
    }
    
    // Return background cache if available, even if stale
    if (backgroundData) {
      const cacheStatus = typeof window === 'undefined' ? getCacheStatus() : { age: 0 };
      return NextResponse.json({
        users: backgroundData,
        cached: true,
        stale: true,
        error: 'Failed to fetch fresh data, returning background cache',
        cacheAge: Math.floor(cacheStatus.age / 1000),
        source: 'background-fallback'
      });
    }
    
    // If no cache available and fetch failed, return fallback cache
    const fallbackData = getFallbackCache();
    if (fallbackData) {
      const fallbackStatus = getFallbackCacheStatus();
      return NextResponse.json({
        users: fallbackData,
        cached: true,
        stale: true,
        error: 'Failed to fetch fresh data, returning fallback cache',
        cacheAge: Math.floor(fallbackStatus.age / 1000),
        isFallback: true,
        source: 'fallback'
      });
    }
    
    // If even fallback cache is not available, return error
    return NextResponse.json(
      { error: 'Failed to fetch CF users and no cached data available' },
      { status: 500 }
    );
  }
}
