// Client-side cache utilities for CP leaderboard
import { CFUser } from './types';

interface CacheData {
  users: CFUser[];
  timestamp: number;
  cached: boolean;
  cacheAge: number;
}

const CACHE_KEY = 'cp-leaderboard-data';
const CLIENT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function getCachedData(): CacheData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - data.timestamp > CLIENT_CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error reading cached data:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

export function setCachedData(data: CacheData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error caching data:', error);
  }
}

export function clearCachedData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing cached data:', error);
  }
}

export function isCacheValid(): boolean {
  const cached = getCachedData();
  return cached !== null;
}
