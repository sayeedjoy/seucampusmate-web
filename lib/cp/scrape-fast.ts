import axios from 'axios';
import { getManualInclude, getExcludeList } from '@/data/cp/overrides';
import { CFUser } from './types';

// Codeforces API endpoints
const API_BASE = 'https://codeforces.com/api';
const USER_INFO_API = `${API_BASE}/user.info`;
const USER_STATUS_API = `${API_BASE}/user.status`;

// Helper function to check recent submissions (last 3 months)
async function getRecentSubmissionData(handle: string): Promise<{ lastSubmissionTime: number; recentSolvedCount: number }> {
  try {
    const threeMonthsAgo = Date.now() / 1000 - (3 * 30 * 24 * 60 * 60); // 3 months in seconds
    
    const response = await axios.get(USER_STATUS_API, {
      params: {
        handle: handle,
        from: 1,
        count: 200 // Get recent submissions (max 10000, but 200 should be enough for 3 months for most users)
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      timeout: 15000
    });

    if (response.data.status !== 'OK') {
      return { lastSubmissionTime: 0, recentSolvedCount: 0 };
    }

    const submissions = response.data.result;
    let lastSubmissionTime = 0;
    let recentSolvedCount = 0;
    const solvedProblems = new Set<string>();

    for (const submission of submissions) {
      if (submission.creationTimeSeconds > threeMonthsAgo) {
        // Update last submission time
        if (submission.creationTimeSeconds > lastSubmissionTime) {
          lastSubmissionTime = submission.creationTimeSeconds;
        }
        
        // Count unique solved problems in last 3 months
        if (submission.verdict === 'OK') {
          const problemKey = `${submission.problem.contestId}-${submission.problem.index}`;
          solvedProblems.add(problemKey);
        }
      } else {
        // Submissions are ordered by time (newest first), so we can break
        break;
      }
    }

    recentSolvedCount = solvedProblems.size;
    return { lastSubmissionTime, recentSolvedCount };
  } catch (error) {
    console.error(`Error fetching submissions for ${handle}:`, error);
    return { lastSubmissionTime: 0, recentSolvedCount: 0 };
  }
}

export async function getCFUsersFast(): Promise<CFUser[]> {
  const users: CFUser[] = [];
  
  // Fetch users from API
  const includeList = await getManualInclude();
  const excludeList = await getExcludeList();
  const allHandles = includeList.filter(handle => !excludeList.includes(handle));
  
  console.log(`Fast loading ${allHandles.length} users from API`);

  if (allHandles.length === 0) {
    console.warn('No users to process - please check the API endpoint or local usernames.json file');
    return [];
  }

  // Use larger batch size for fewer API calls
  const batchSize = 100; // Maximum allowed by Codeforces API
  
  for (let i = 0; i < allHandles.length; i += batchSize) {
    const batch = allHandles.slice(i, i + batchSize);
    
    try {
      // Minimal delay between batches
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log(`Fetching batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allHandles.length/batchSize)} (${batch.length} users)`);

      // Fetch user info for batch (skip rating history for speed)
      const userInfoResponse = await axios.get(USER_INFO_API, {
        params: {
          handles: batch.join(';')
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        timeout: 30000 // Increased timeout for larger batches
      });

      if (userInfoResponse.data.status !== 'OK') {
        console.error('API returned error:', userInfoResponse.data);
        continue;
      }

      const userInfos = userInfoResponse.data.result;

      // Process each user in the batch
      for (const userInfo of userInfos) {
        if (excludeList.includes(userInfo.handle)) continue;

        // Get recent submission data
        const { lastSubmissionTime, recentSolvedCount } = await getRecentSubmissionData(userInfo.handle);
        
        // Small delay between individual user requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

        // Use available data directly (faster, no additional API calls)
        const maxRating = userInfo.maxRating || userInfo.rating || 0;
        const currentRating = userInfo.rating || 0;

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
          currentRating,
          registeredHuman,
          lastOnlineTimeSeconds: userInfo.lastOnlineTimeSeconds || 0,
          lastSubmissionTimeSeconds: lastSubmissionTime,
          recentSolvedCount: recentSolvedCount,
        });
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
          lastSubmissionTimeSeconds: 0,
          recentSolvedCount: 0,
        });
      }
    }
  }

  console.log(`Successfully processed ${users.length} users in fast mode`);

  // Sort by current rating (desc), then max rating (desc), and assign ranks
  const sorted = users
    .sort((a, b) => b.currentRating - a.currentRating || b.maxRating - a.maxRating)
    .map((user, index) => ({ ...user, rank: index + 1 }));

  return sorted;
}
