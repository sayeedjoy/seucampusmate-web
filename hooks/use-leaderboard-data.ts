import { useState, useEffect, useCallback, useMemo } from 'react';
import { CFUser } from '@/lib/cp/types';
import { getCachedData, setCachedData, clearCachedData } from '@/lib/cp/cache';

interface ApiResponse {
  users: CFUser[];
  cached: boolean;
  stale?: boolean;
  error?: string;
  cacheAge: number;
  nextRefreshIn: number;
  isFallback?: boolean;
  source?: string;
}

// Constants
export const STALE_CACHE_THRESHOLD_MINUTES = 5;
export const BACKGROUND_REFRESH_CHECK_MINUTES = 10;
export const BACKGROUND_REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

interface UseLeaderboardDataOptions {
  showActiveOnly: boolean;
  searchQuery: string;
}

export function useLeaderboardData({ showActiveOnly, searchQuery }: UseLeaderboardDataOptions) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [initialized, setInitialized] = useState(false);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setRefreshing(forceRefresh);

      const params = new URLSearchParams();
      params.set('submissions', 'true');
      if (forceRefresh) {
        params.set('refresh', 'true');
      }

      const response = await fetch(`/api/cp/users?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const apiData: ApiResponse = await response.json();
      setData(apiData);
      setError('');

      setCachedData({
        users: apiData.users,
        timestamp: Date.now(),
        cached: apiData.cached,
        cacheAge: apiData.cacheAge
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const cachedData = getCachedData();
      if (cachedData) {
        setData({
          users: cachedData.users,
          cached: true,
          cacheAge: Math.floor((Date.now() - cachedData.timestamp) / 1000),
          nextRefreshIn: 0
        });
        setLoading(false);
        setInitialized(true);

        const cacheAgeMinutes = Math.floor((Date.now() - cachedData.timestamp) / (1000 * 60));
        if (cacheAgeMinutes > STALE_CACHE_THRESHOLD_MINUTES) {
          fetch('/api/cp/users?refresh=true&submissions=true').catch(console.error);
        }
        return;
      }

      await fetchData();
      setInitialized(true);
    };

    loadData();

    const backgroundRefresh = async () => {
      try {
        await fetch('/api/cp/users?refresh=true&submissions=true');
      } catch (error) {
        console.error('Background refresh failed:', error);
      }
    };

    const interval = setInterval(backgroundRefresh, BACKGROUND_REFRESH_INTERVAL_MS);

    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        const cachedData = getCachedData();
        if (cachedData) {
          const cacheAgeMinutes = Math.floor((Date.now() - cachedData.timestamp) / (1000 * 60));
          if (cacheAgeMinutes > BACKGROUND_REFRESH_CHECK_MINUTES) {
            await backgroundRefresh();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');

      await fetch('/api/cp/refresh', { method: 'POST' });
      clearCachedData();
      await fetchData(true);

    } catch (error) {
      console.error('Error during refresh:', error);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const isUserRecentlyActive = useCallback((user: CFUser): boolean => {
    return (user.recentSolvedCount && user.recentSolvedCount > 0) || false;
  }, []);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];

    let users = showActiveOnly
      ? data.users.filter(isUserRecentlyActive)
      : data.users;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      users = users.filter(user =>
        user.handle.toLowerCase().includes(query)
      );
    }

    return users;
  }, [data?.users, showActiveOnly, searchQuery, isUserRecentlyActive]);

  // Get top 3 for podium (only when not searching)
  const topThree = useMemo(() => {
    if (searchQuery.trim()) return [];
    return filteredUsers.slice(0, 3);
  }, [filteredUsers, searchQuery]);

  // Rest of users for table/cards
  const restOfUsers = useMemo(() => {
    if (searchQuery.trim()) return filteredUsers;
    return filteredUsers.slice(3);
  }, [filteredUsers, searchQuery]);

  return {
    data,
    loading,
    refreshing,
    error,
    initialized,
    filteredUsers,
    topThree,
    restOfUsers,
    handleRefresh,
    fetchData,
  };
}
