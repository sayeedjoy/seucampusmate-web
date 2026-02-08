// Codeforces rating-based rank system
export function getRankTitle(rating: number): string {
  if (rating >= 4000) return 'Legendary Grandmaster';
  if (rating >= 3000) return 'Legendary Grandmaster';
  if (rating >= 2600) return 'International Grandmaster';
  if (rating >= 2400) return 'Grandmaster';
  if (rating >= 2300) return 'International Master';
  if (rating >= 2100) return 'Master';
  if (rating >= 1900) return 'Candidate Master';
  if (rating >= 1600) return 'Expert';
  if (rating >= 1400) return 'Specialist';
  if (rating >= 1200) return 'Pupil';
  return 'Newbie';
}

// Get rank title from max rating
export function getMaxRankTitle(maxRating: number): string {
  return getRankTitle(maxRating);
}

// Get current rank title
export function getCurrentRankTitle(currentRating: number): string {
  return getRankTitle(currentRating);
}
