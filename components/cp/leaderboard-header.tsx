'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, RefreshCw, X } from 'lucide-react';

interface LeaderboardHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showActiveOnly: boolean;
  onFilterChange: (showActive: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function LeaderboardHeader({
  searchQuery,
  onSearchChange,
  showActiveOnly,
  onFilterChange,
  onRefresh,
  isRefreshing,
}: LeaderboardHeaderProps) {
  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search user..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search for users by handle"
            className="w-full pl-9 pr-9 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all text-sm"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Tabs: All / Active */}
          <Tabs
            value={showActiveOnly ? 'active' : 'all'}
            onValueChange={(value) => onFilterChange(value === 'active')}
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
            onClick={onRefresh}
            disabled={isRefreshing}
            variant="default"
            size="sm"
            className="flex items-center gap-2 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only sm:not-sr-only sm:inline-block">{isRefreshing ? 'Refreshing' : 'Refresh'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
