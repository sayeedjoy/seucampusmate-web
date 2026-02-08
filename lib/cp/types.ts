export type CFUser = {
  rank: number;
  handle: string;
  profileUrl: string;
  avatarUrl: string;
  maxRating: number;
  currentRating: number;
  registeredHuman: string;
  lastOnlineTimeSeconds?: number; // Unix timestamp of last activity
  lastSubmissionTimeSeconds?: number; // Unix timestamp of last submission
  recentSolvedCount?: number; // Number of problems solved in last 3 months
  isRecentlyActive?: boolean; // Helper field for filtering
};
