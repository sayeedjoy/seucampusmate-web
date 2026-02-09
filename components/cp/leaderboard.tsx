'use client';

import { useState } from 'react';
import { useLeaderboardData } from '@/hooks/use-leaderboard-data';
import { LeaderboardHeader } from './leaderboard-header';
import { LeaderboardStats } from './leaderboard-stats';
import { PodiumSection } from './podium-section';
import { UserCard } from './user-card';
import { LeaderboardTableDesktop } from './leaderboard-table-desktop';
import { Button } from '@/components/ui/button';
import { Search, Users } from 'lucide-react';

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="space-y-8">
        {/* Skeleton header */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-10 w-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-9 w-64 bg-muted rounded animate-pulse" />
        </div>

        {/* Skeleton podium */}
        <div className="bg-card/50 rounded-2xl border border-border p-8">
          <div className="flex justify-center items-end gap-4">
            {[2, 1, 3].map((pos) => (
              <div key={pos} className="flex flex-col items-center animate-pulse">
                <div className={`${pos === 1 ? 'w-20 h-20' : 'w-16 h-16'} rounded-full bg-muted`} />
                <div className="mt-3 h-4 w-16 bg-muted rounded" />
                <div className={`mt-3 w-28 ${pos === 1 ? 'h-32' : pos === 2 ? 'h-24' : 'h-20'} rounded-t-xl bg-muted`} />
              </div>
            ))}
          </div>
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

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
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
        <Button onClick={onRetry} variant="default">
          Try Again
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
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

function EmptySearchState() {
  return (
    <div className="bg-card rounded-2xl border border-border p-12 text-center">
      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="font-semibold text-foreground mb-1">No users found</h3>
      <p className="text-muted-foreground text-sm">Try a different search term</p>
    </div>
  );
}

export function Leaderboard() {
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const {
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
  } = useLeaderboardData({ showActiveOnly, searchQuery });

  // Loading state
  if (loading && !initialized) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error && !data) {
    return <ErrorState error={error} onRetry={() => fetchData()} />;
  }

  // Empty state
  if (!data || data.users.length === 0) {
    return <EmptyState />;
  }

  const showPodium = topThree.length >= 3 && !searchQuery;

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-inter">
      {/* Header & Controls Section */}
      <LeaderboardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showActiveOnly={showActiveOnly}
        onFilterChange={setShowActiveOnly}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      {/* Stats Bar */}
      <LeaderboardStats
        userCount={filteredUsers.length}
        showActiveOnly={showActiveOnly}
        cacheAge={data.cacheAge}
        isFallback={data.isFallback}
        stale={data.stale}
      />

      {/* Inline refreshing indicator */}
      {refreshing && (
        <div className="bg-card/80 dark:bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm text-foreground">Fetching live data</p>
            <p className="text-xs text-muted-foreground">This will take a moment...</p>
          </div>
        </div>
      )}

      {/* Podium Section */}
      <PodiumSection topThree={topThree} showPodium={showPodium} />

      {/* Mobile Cards View */}
      <div className="sm:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <EmptySearchState />
        ) : (
          filteredUsers.map((user, index) => (
            <UserCard key={user.handle} user={user} rank={index + 1} index={index} />
          ))
        )}
      </div>

      {/* Desktop Table View */}
      {filteredUsers.length === 0 ? (
        <div className="hidden sm:block">
          <EmptySearchState />
        </div>
      ) : (
        <LeaderboardTableDesktop
          users={searchQuery ? filteredUsers : restOfUsers}
          startRank={searchQuery ? 1 : 4}
        />
      )}
    </div>
  );
}
