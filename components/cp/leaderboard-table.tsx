'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CFUser } from '@/lib/cp/types';
import { ratingColor, ratingColorBg, ratingColorBorder } from '@/lib/cp/colors';
import { getMaxRankTitle } from '@/lib/cp/ranks';
import { getCachedData, setCachedData, clearCachedData } from '@/lib/cp/cache';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Search, RefreshCw, Trophy, Medal, Award, Users, Zap, Clock, ExternalLink } from 'lucide-react';
import { Pill, PillIcon, PillIndicator } from "@/components/kibo-ui/pill";
import { cn } from "@/lib/utils";

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

// Podium component for top 3 users
function PodiumCard({ user, position, delay }: { user: CFUser; position: 1 | 2 | 3; delay: number }) {
  const positionStyles = {
    1: {
      gradient: 'from-amber-400 via-yellow-300 to-amber-500',
      border: 'border-amber-300',
      shadow: 'shadow-amber-200/50',
      icon: <Trophy className="w-6 h-6 text-amber-600" />,
      label: '1st',
      height: 'h-32',
      avatarSize: 'w-20 h-20',
      order: 'order-2',
    },
    2: {
      gradient: 'from-slate-300 via-gray-200 to-slate-400',
      border: 'border-slate-300',
      shadow: 'shadow-slate-200/50',
      icon: <Medal className="w-5 h-5 text-slate-500" />,
      label: '2nd',
      height: 'h-24',
      avatarSize: 'w-16 h-16',
      order: 'order-1',
    },
    3: {
      gradient: 'from-amber-600 via-orange-400 to-amber-700',
      border: 'border-amber-500',
      shadow: 'shadow-amber-300/50',
      icon: <Award className="w-5 h-5 text-amber-700" />,
      label: '3rd',
      height: 'h-20',
      avatarSize: 'w-14 h-14',
      order: 'order-3',
    },
  };

  const style = positionStyles[position];

  return (
    <div
      className={`${style.order} flex flex-col items-center animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Avatar with gradient ring */}
      <div className={`relative mb-3`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} rounded-full blur-sm opacity-60`} />
        <div className={`relative ${style.avatarSize} rounded-full bg-gradient-to-br ${style.gradient} p-0.5`}>
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.handle}
              width={80}
              height={80}
              className="w-full h-full rounded-full object-cover border-2 border-background"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <span className={`${ratingColor(user.maxRating)} font-bold text-lg`}>
                {user.handle.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        {/* Position badge */}
        <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-lg ${style.shadow}`}>
          <span className="text-xs font-bold text-white drop-shadow">{position}</span>
        </div>
      </div>

      {/* User info */}
      <a
        href={user.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`font-bold text-sm md:text-base ${ratingColor(user.maxRating)} hover:underline transition-all truncate max-w-[120px]`}
      >
        {user.handle}
      </a>

      {/* Rating badge */}
      <div className={`mt-1.5 px-3 py-1 rounded-full ${ratingColorBg(user.maxRating)} ${ratingColorBorder(user.maxRating)} border`}>
        <span className={`font-mono font-bold text-sm ${ratingColor(user.maxRating)}`}>
          {user.maxRating}
        </span>
      </div>

      {/* Rank title */}
      <span className={`mt-1 text-xs ${ratingColor(user.maxRating)} font-medium`}>
        {getMaxRankTitle(user.maxRating)}
      </span>

      {/* Podium base */}
      <div className={`mt-3 w-28 md:w-32 ${style.height} rounded-t-xl bg-gradient-to-b ${style.gradient} flex items-start justify-center pt-3 shadow-lg ${style.shadow}`}>
        {style.icon}
      </div>
    </div>
  );
}

// Mobile card component for each user
function UserCard({ user, rank }: { user: CFUser; rank: number }) {
  return (
    <a
      href={user.profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-4 rounded-xl border ${ratingColorBorder(user.maxRating)} ${ratingColorBg(user.maxRating)} hover:shadow-md transition-all duration-200 hover:scale-[1.01]`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-foreground shadow-sm">
          {rank}
        </div>

        {/* Avatar */}
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.handle}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full border-2 border-background shadow-sm flex-shrink-0"
          />
        ) : (
          <div className={`w-12 h-12 rounded-full ${ratingColorBg(user.maxRating)} flex items-center justify-center flex-shrink-0 border-2 border-background shadow-sm`}>
            <span className={`${ratingColor(user.maxRating)} font-bold text-lg`}>
              {user.handle.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* User info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-bold ${ratingColor(user.currentRating)} truncate`}>
              {user.handle}
            </span>
            <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ratingColorBg(user.maxRating)} ${ratingColor(user.maxRating)}`}>
              {getMaxRankTitle(user.maxRating)}
            </span>
          </div>
        </div>

        {/* Ratings */}
        <div className="flex-shrink-0 text-right">
          <div className="font-mono font-bold text-lg text-foreground">{user.maxRating}</div>
          <div className="text-xs text-muted-foreground">max rating</div>
        </div>
      </div>

      {/* Activity bar */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Zap className={`w-3.5 h-3.5 ${(user.recentSolvedCount || 0) > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
          <span>{user.recentSolvedCount || 0} problems (3 months)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{user.registeredHuman}</span>
        </div>
      </div>
    </a>
  );
}

export function LeaderboardTable() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
        if (cacheAgeMinutes > 5) {
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

    const interval = setInterval(backgroundRefresh, 30 * 60 * 1000);

    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        const cachedData = getCachedData();
        if (cachedData) {
          const cacheAgeMinutes = Math.floor((Date.now() - cachedData.timestamp) / (1000 * 60));
          if (cacheAgeMinutes > 10) {
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

  const isUserRecentlyActive = (user: CFUser): boolean => {
    return (user.recentSolvedCount && user.recentSolvedCount > 0) || false;
  };

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
  }, [data?.users, showActiveOnly, searchQuery]);

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

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Loading state
  if (loading && !initialized) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="space-y-8">
          {/* Skeleton podium */}
          <div className="flex justify-center items-end gap-4 pt-8">
            {[2, 1, 3].map((pos) => (
              <div key={pos} className="flex flex-col items-center animate-pulse">
                <div className={`${pos === 1 ? 'w-20 h-20' : 'w-16 h-16'} rounded-full bg-muted`} />
                <div className="mt-3 h-4 w-16 bg-muted rounded" />
                <div className={`mt-3 w-28 ${pos === 1 ? 'h-32' : pos === 2 ? 'h-24' : 'h-20'} rounded-t-xl bg-muted`} />
              </div>
            ))}
          </div>

          {/* Skeleton table */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-muted" />
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 h-4 bg-muted rounded" />
                  <div className="w-16 h-6 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-card rounded-2xl border border-destructive/30 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Error loading data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchData()} variant="default">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.users.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No users found</h3>
          <p className="text-muted-foreground">Please add Codeforces usernames to see the leaderboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-inter">
      {/* Header & Controls Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        {/* Left: Title & Badge */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="code-forces" className="w-4 h-4">
              <path fill="#F44336" d="M24 19.5V12a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 18 12v7.5a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5z"></path>
              <path fill="#2196F3" d="M13.5 21a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 13.5 3h-3C9.673 3 9 3.672 9 4.5v15c0 .828.673 1.5 1.5 1.5h3z"></path>
              <path fill="#FFC107" d="M0 19.5c0 .828.673 1.5 1.5 1.5h3A1.5 1.5 0 0 0 6 19.5V9a1.5 1.5 0 0 0-1.5-1.5h-3C.673 7.5 0 8.172 0 9v10.5z"></path>
            </svg>
            <span className="text-xs font-medium text-muted-foreground">Powered by Codeforces</span>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              CP Leaderboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Top competitive programmers from <span className="font-semibold text-foreground">Southeast University</span>
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs: All / Active */}
            <Tabs
              value={showActiveOnly ? 'active' : 'all'}
              onValueChange={(value) => setShowActiveOnly(value === 'active')}
            >
              <TabsList className="h-9 p-1">
                <TabsTrigger value="all" className="px-3 py-1.5 text-xs font-medium">
                  All
                </TabsTrigger>
                <TabsTrigger value="active" className="px-3 py-1.5 text-xs font-medium">
                  Active
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Refresh Button */}
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="default"
              size="sm"
              className="flex items-center gap-2 h-9"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="sr-only sm:not-sr-only sm:inline-block">{refreshing ? 'Refreshing' : 'Refresh'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Pill className="px-2 py-1 border-border text-muted-foreground bg-muted/50 pointer-events-none" variant="secondary">
          <PillIcon icon={Users} className="size-3" />
          <span className="text-[10px] sm:text-xs font-medium">
            <strong className="text-foreground">{filteredUsers.length}</strong> Users
          </span>
        </Pill>

        <Pill
          className={cn(
            "px-2 py-1 border-border pointer-events-none",
            showActiveOnly ? "text-green-600 dark:text-green-400 bg-green-500/10 dark:bg-green-500/20 border-green-500/30" : "text-muted-foreground bg-muted/50"
          )}
          variant="secondary"
        >
          <PillIcon icon={Zap} className={cn("size-3", showActiveOnly ? "text-green-500" : "text-muted-foreground")} />
          <span className="text-[10px] sm:text-xs font-medium">
            {showActiveOnly ? 'Active' : 'All'}
          </span>
        </Pill>

        <Pill className="px-2 py-1 border-border text-muted-foreground bg-muted/50 pointer-events-none" variant="secondary">
          <PillIndicator
            variant={data.isFallback ? "info" : data.stale ? "warning" : "success"}
            pulse={!!data.isFallback}
          />
          <span className="text-[10px] sm:text-xs font-medium">
            {data.isFallback ? 'Fallback' : formatTime(data.cacheAge)}
          </span>
        </Pill>
      </div>

      {/* Podium Section - Desktop/Tablet */}
      {topThree.length >= 3 && !searchQuery && (
        <div className="hidden sm:flex justify-center items-end gap-4 pt-6 pb-4">
          <PodiumCard user={topThree[1]} position={2} delay={100} />
          <PodiumCard user={topThree[0]} position={1} delay={0} />
          <PodiumCard user={topThree[2]} position={3} delay={200} />
        </div>
      )}

      {/* Loading overlay */}
      {refreshing && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-2xl shadow-xl border border-border">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Fetching live data</p>
              <p className="text-sm text-muted-foreground">Please wait a moment...</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Cards View */}
      <div className="sm:hidden space-y-3">
        {filteredUsers.map((user, index) => (
          <UserCard key={user.handle} user={user} rank={index + 1} />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Rating</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Activity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(searchQuery ? filteredUsers : restOfUsers).map((user, index) => {
                const rank = searchQuery ? index + 1 : index + 4;
                return (
                  <tr
                    key={user.handle}
                    className="hover:bg-muted/50 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-foreground group-hover:bg-muted/80 transition-colors">
                        {rank}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={user.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 group/link"
                      >
                        {user.avatarUrl ? (
                          <Image
                            src={user.avatarUrl}
                            alt={user.handle}
                            width={40}
                            height={40}
                            className="rounded-full border border-border group-hover/link:border-primary/50 transition-colors"
                          />
                        ) : (
                          <div className={`w-10 h-10 ${ratingColorBg(user.currentRating)} rounded-full flex items-center justify-center`}>
                            <span className={`font-bold ${ratingColor(user.currentRating)}`}>
                              {user.handle.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${ratingColor(user.currentRating)} group-hover/link:underline`}>
                            {user.handle}
                          </span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </div>
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-lg text-foreground">{user.maxRating}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${ratingColorBg(user.maxRating)} ${ratingColor(user.maxRating)} ${ratingColorBorder(user.maxRating)} border`}>
                        {getMaxRankTitle(user.maxRating)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-foreground">{user.currentRating}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Zap className={`w-4 h-4 ${(user.recentSolvedCount || 0) > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
                        <span className={`font-medium ${(user.recentSolvedCount || 0) > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                          {user.recentSolvedCount || 0} solved
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{user.registeredHuman}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty search results */}
        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-1">No users found</h3>
            <p className="text-muted-foreground text-sm">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Mobile empty state */}
      {filteredUsers.length === 0 && (
        <div className="sm:hidden p-8 text-center bg-card rounded-2xl border border-border">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-1">No users found</h3>
          <p className="text-muted-foreground text-sm">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
