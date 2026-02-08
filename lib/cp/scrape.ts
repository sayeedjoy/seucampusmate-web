import axios from 'axios';
import { getManualInclude, getExcludeList } from '@/data/cp/overrides';
import { CFUser } from './types';

// Codeforces API endpoints
const API_BASE = 'https://codeforces.com/api';
const USER_INFO_API = `${API_BASE}/user.info`;
const USER_RATING_API = `${API_BASE}/user.rating`;

interface RatingChange {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

export async function getCFUsers(): Promise<CFUser[]> {
  const users: CFUser[] = [];
  
  // Fetch users from API
  const includeList = await getManualInclude();
  const excludeList = await getExcludeList();
  const allHandles = includeList.filter(handle => !excludeList.includes(handle));
  
  console.log(`Processing ${allHandles.length} users from API`);

  if (allHandles.length === 0) {
    console.warn('No users to process - please check the API endpoint or local usernames.json file');
    return [];
  }

  // Use Codeforces API to get detailed user info
  const handlesArray = allHandles;
  const batchSize = 50; // Larger batch size for fewer requests

  for (let i = 0; i < handlesArray.length; i += batchSize) {
    const batch = handlesArray.slice(i, i + batchSize);
    
    try {
      // Add minimal delay before each batch
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 2000ms
      }

      // Fetch user info for batch
      const userInfoResponse = await axios.get(USER_INFO_API, {
        params: {
          handles: batch.join(';')
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        timeout: 15000
      });

      if (userInfoResponse.data.status !== 'OK') {
        console.error('API returned error:', userInfoResponse.data);
        continue;
      }

      const userInfos = userInfoResponse.data.result;

      // Process each user in the batch
      for (const userInfo of userInfos) {
        if (excludeList.includes(userInfo.handle)) continue;

        let maxRating = userInfo.maxRating || userInfo.rating || 0;

        // Try to get rating history for more accurate max rating
        try {
          // Minimal delay between requests
          await new Promise(resolve => setTimeout(resolve, 100)); // Reduced from 500ms
          
          const ratingResponse = await axios.get(USER_RATING_API, {
            params: {
              handle: userInfo.handle
            },
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json',
            },
            timeout: 10000
          });

          if (ratingResponse.data.status === 'OK' && ratingResponse.data.result.length > 0) {
            const ratings: RatingChange[] = ratingResponse.data.result;
            const maxRatingEntry = ratings.reduce((max: RatingChange, current: RatingChange) => 
              current.newRating > max.newRating ? current : max
            );
            maxRating = maxRatingEntry.newRating;
          }
        } catch {
          // Use default values if rating history fetch fails
        }

        // Format registration date
        const registrationDate = new Date(userInfo.registrationTimeSeconds * 1000);
        const registeredHuman = registrationDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        users.push({
          rank: 0, // Will be assigned after sorting
          handle: userInfo.handle,
          profileUrl: `https://codeforces.com/profile/${userInfo.handle}`,
          avatarUrl: userInfo.titlePhoto || userInfo.avatar || '',
          maxRating,
          currentRating: userInfo.rating || 0,
          registeredHuman,
          lastOnlineTimeSeconds: userInfo.lastOnlineTimeSeconds || 0,
        });
      }

      // Add minimal delay between batches
      if (i + batchSize < handlesArray.length) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced from 3000ms
      }

    } catch (error) {
      console.error(`Error fetching batch starting at index ${i}:`, error);
      
      // Fallback: create basic entries for this batch
      for (const handle of batch) {
        if (excludeList.includes(handle)) continue;
        
        users.push({
          rank: 0,
          handle,
          profileUrl: `https://codeforces.com/profile/${handle}`,
          avatarUrl: '',
          maxRating: 0,
          currentRating: 0,
          registeredHuman: 'Unknown',
          lastOnlineTimeSeconds: 0,
        });
      }
    }
  }

  console.log(`Successfully processed ${users.length} users`);

  // Sort by current rating (desc), then max rating (desc), and assign ranks
  const sorted = users
    .sort((a, b) => b.currentRating - a.currentRating || b.maxRating - a.maxRating)
    .map((user, index) => ({ ...user, rank: index + 1 }));

  return sorted;
}
