import { CFUser } from './types';

// Fallback cache that's always available
let fallbackCache: CFUser[] | null = null;
let fallbackCacheTimestamp: number = 0;

// Simple fallback data structure
const createFallbackUser = (handle: string, rank: number): CFUser => ({
  rank,
  handle,
  currentRating: 1200 + (rank * 50),
  maxRating: 1200 + (rank * 50),
  profileUrl: `https://codeforces.com/profile/${handle}`,
  avatarUrl: '',
  registeredHuman: 'Unknown',
  recentSolvedCount: 0
});

// Initialize fallback cache with basic data
export function initializeFallbackCache(): void {
  if (fallbackCache) return;
  
  // Create basic fallback data
  const fallbackUsers: CFUser[] = [
    createFallbackUser('user1', 1),
    createFallbackUser('user2', 2),
    createFallbackUser('user3', 3),
    createFallbackUser('user4', 4),
    createFallbackUser('user5', 5),
  ];
  
  fallbackCache = fallbackUsers;
  fallbackCacheTimestamp = Date.now();
  
  console.log('Fallback cache initialized with basic data');
}

// Get fallback cache
export function getFallbackCache(): CFUser[] | null {
  if (!fallbackCache) {
    initializeFallbackCache();
  }
  return fallbackCache;
}

// Update fallback cache with real data
export function updateFallbackCache(users: CFUser[]): void {
  fallbackCache = users;
  fallbackCacheTimestamp = Date.now();
  console.log('Fallback cache updated with real data');
}

// Get fallback cache status
export function getFallbackCacheStatus(): {
  hasData: boolean;
  age: number;
  userCount: number;
  isFallback: boolean;
} {
  if (!fallbackCache) {
    return {
      hasData: false,
      age: 0,
      userCount: 0,
      isFallback: false
    };
  }
  
  const now = Date.now();
  const age = now - fallbackCacheTimestamp;
  
  return {
    hasData: true,
    age,
    userCount: fallbackCache.length,
    isFallback: true
  };
}

// Initialize fallback cache on module load
initializeFallbackCache();
