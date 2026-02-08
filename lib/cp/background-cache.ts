import { CFUser } from './types';
import { updateFallbackCache } from './fallback-cache';
import { Redis } from '@upstash/redis';

// Redis client for persistent caching (optional)
const hasRedisEnv = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);
const redis = hasRedisEnv
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const REDIS_CACHE_KEY = 'cp_users_leaderboard';
const REDIS_CACHE_TTL = 259200; // 3 days

interface CacheEntry {
  users: CFUser[];
  timestamp: number;
  isStale: boolean;
  lastFetchAttempt: number;
}

// In-memory cache for background data
let backgroundCache: CacheEntry | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const STALE_THRESHOLD = 60 * 60 * 1000; // 1 hour
const FETCH_COOLDOWN = 5 * 60 * 1000; // 5 minutes between fetch attempts

// Load data from Redis cache
async function loadFromRedis(): Promise<CFUser[] | null> {
  if (!redis) {
    // Upstash not configured; skip redis load
    return null;
  }
  try {
    const redisData = await redis.get<{ users: CFUser[]; timestamp: number }>(REDIS_CACHE_KEY);
    if (redisData && redisData.users) {
      console.log('Loaded data from Redis cache');
      return redisData.users;
    }
  } catch (error) {
    console.error('Failed to load from Redis:', error);
  }
  return null;
}

// Save data to Redis cache
async function saveToRedis(users: CFUser[]): Promise<void> {
  if (!redis) {
    // Upstash not configured; skip redis save
    return;
  }
  try {
    await redis.setex(REDIS_CACHE_KEY, REDIS_CACHE_TTL, {
      users,
      timestamp: Date.now()
    });
    console.log('Saved data to Redis cache');
  } catch (error) {
    console.error('Failed to save to Redis:', error);
  }
}

// Background fetch function - only runs on server side
async function fetchDataInBackground(): Promise<void> {
  // Only run on server side
  if (typeof window !== 'undefined') {
    return;
  }
  
  const now = Date.now();
  
  // Don't fetch if we recently attempted
  if (backgroundCache && (now - backgroundCache.lastFetchAttempt) < FETCH_COOLDOWN) {
    return;
  }
  
  try {
    console.log('Background: Fetching fresh CP data...');
    
    // Dynamic import to avoid client-side issues
    const { getCFUsersWithSubmissions } = await import('./scrape-submissions');
    const users = await getCFUsersWithSubmissions();
    
    backgroundCache = {
      users,
      timestamp: now,
      isStale: false,
      lastFetchAttempt: now
    };
    
    // Save to Redis for persistent storage
    await saveToRedis(users);
    
    // Also update fallback cache with real data
    updateFallbackCache(users);
    
    console.log(`Background: Successfully cached ${users.length} users`);
  } catch (error) {
    console.error('Background: Failed to fetch CP data:', error);
    
    // Mark existing cache as stale if fetch failed
    if (backgroundCache) {
      backgroundCache.isStale = true;
      backgroundCache.lastFetchAttempt = now;
    }
  }
}

// Initialize background cache on module load (server only)
export async function initializeBackgroundCache(): Promise<void> {
  // Only initialize on server side
  if (typeof window !== 'undefined') {
    return;
  }
  
  if (!backgroundCache) {
    // Try to load from Redis first
    const redisUsers = await loadFromRedis();
    if (redisUsers) {
      backgroundCache = {
        users: redisUsers,
        timestamp: Date.now(),
        isStale: false,
        lastFetchAttempt: 0
      };
      console.log('Initialized background cache from Redis');
    } else {
      // If no Redis data, fetch fresh data
      await fetchDataInBackground();
    }
  }
}

// Get cached data (returns null if no cache or cache is too old)
export function getBackgroundCache(): CFUser[] | null {
  if (!backgroundCache) return null;
  
  const now = Date.now();
  const age = now - backgroundCache.timestamp;
  
  // Return null if cache is too old
  if (age > CACHE_DURATION) {
    return null;
  }
  
  return backgroundCache.users;
}

// Get cache status
export function getCacheStatus(): {
  hasData: boolean;
  isStale: boolean;
  age: number;
  userCount: number;
} {
  if (!backgroundCache) {
    return {
      hasData: false,
      isStale: false,
      age: 0,
      userCount: 0
    };
  }
  
  const now = Date.now();
  const age = now - backgroundCache.timestamp;
  
  return {
    hasData: age <= CACHE_DURATION,
    isStale: backgroundCache.isStale || age > STALE_THRESHOLD,
    age,
    userCount: backgroundCache.users.length
  };
}

// Force refresh cache (server only)
export async function refreshBackgroundCache(): Promise<CFUser[]> {
  await fetchDataInBackground();
  return backgroundCache?.users || [];
}

// Start background refresh interval (client only)
export function startBackgroundRefresh(): void {
  // Only run on client side
  if (typeof window === 'undefined') {
    return;
  }
  
  // Refresh every 15 minutes by calling the API
  setInterval(async () => {
    try {
      await fetch('/api/cp/users?refresh=true&submissions=true');
    } catch (error) {
      console.error('Background refresh failed:', error);
    }
  }, 15 * 60 * 1000);
  
  // Also refresh when page becomes visible (user returns to tab)
  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden) {
      try {
        await fetch('/api/cp/users?refresh=true&submissions=true');
      } catch (error) {
        console.error('Visibility refresh failed:', error);
      }
    }
  });
}

// Initialize cache on server startup
if (typeof window === 'undefined') {
  // Server-side initialization - start immediately
  initializeBackgroundCache().then(() => {
    console.log('Background cache initialized on server');
  }).catch((error) => {
    console.error('Failed to initialize background cache:', error);
  });
  
  // Also set up periodic refresh
  setInterval(() => {
    fetchDataInBackground().catch((error) => {
      console.error('Periodic background refresh failed:', error);
    });
  }, 15 * 60 * 1000); // Every 15 minutes
}
