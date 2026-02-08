import axios from 'axios';
import { getManualInclude, getExcludeList } from '@/data/cp/overrides';
import { CFUser } from './types';

// Codeforces API endpoints
const API_BASE = process.env.CODEFORCES_API_BASE || 'https://codeforces.com/api';
const USER_INFO_API = `${API_BASE}/user.info`;
const USER_STATUS_API = `${API_BASE}/user.status`;

// Helper function to check recent submissions (last 3 months) with caching
const submissionCache = new Map<string, { data: { lastSubmissionTime: number; recentSolvedCount: number }, timestamp: number }>();
const SUBMISSION_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache

async function getRecentSubmissionData(handle: string): Promise<{ lastSubmissionTime: number; recentSolvedCount: number }> {
  // Check cache first
  const cached = submissionCache.get(handle);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < SUBMISSION_CACHE_DURATION) {
    return cached.data;
  }

  try {
    const threeMonthsAgo = Math.floor(Date.now() / 1000) - (3 * 30 * 24 * 60 * 60); // 3 months in seconds
    
    const response = await axios.get(USER_STATUS_API, {
      params: {
        handle: handle,
        from: 1,
        count: 100 // Reduced count for faster response
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      timeout: 10000 // Reduced timeout
    });

    if (response.data.status !== 'OK') {
      const fallbackData = { lastSubmissionTime: 0, recentSolvedCount: 0 };
      submissionCache.set(handle, { data: fallbackData, timestamp: now });
      return fallbackData;
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
    const result = { lastSubmissionTime, recentSolvedCount };
    
    // Cache the result
    submissionCache.set(handle, { data: result, timestamp: now });
    
    return result;
  } catch (error) {
    console.error(`Error fetching submissions for ${handle}:`, error);
    const fallbackData = { lastSubmissionTime: 0, recentSolvedCount: 0 };
    submissionCache.set(handle, { data: fallbackData, timestamp: now });
    return fallbackData;
  }
}

export async function getCFUsersWithSubmissions(): Promise<CFUser[]> {
  const users: CFUser[] = [];
  
  // Fetch users from API
  const includeList = await getManualInclude();
  const excludeList = await getExcludeList();
  const allHandles = includeList.filter(handle => !excludeList.includes(handle));
  
  console.log(`Loading ${allHandles.length} users from API with submission data`);

  if (allHandles.length === 0) {
    console.warn('No users to process - please check the API endpoint or local usernames.json file');
    return [];
  }

  // Process in smaller batches for user info, then individual submission requests
  const batchSize = 50; // Smaller batch size for better reliability
  
  for (let i = 0; i < allHandles.length; i += batchSize) {
    const batch = allHandles.slice(i, i + batchSize);
    
    try {
      // Delay between batches
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`Fetching batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allHandles.length/batchSize)} (${batch.length} users)`);

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

      // Process each user in the batch with submission data
      for (const userInfo of userInfos) {
        if (excludeList.includes(userInfo.handle)) continue;

        console.log(`Fetching submissions for ${userInfo.handle}...`);
        
        // Get recent submission data with rate limiting
        const { lastSubmissionTime, recentSolvedCount } = await getRecentSubmissionData(userInfo.handle);
        
        // Rate limiting delay between individual requests
        await new Promise(resolve => setTimeout(resolve, 200));

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
      
      // Fallback: create basic entries for this batch without submission data
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

  console.log(`Successfully processed ${users.length} users with submission data`);

  // Sort by current rating (desc), then max rating (desc), and assign ranks
  const sorted = users
    .sort((a, b) => b.currentRating - a.currentRating || b.maxRating - a.maxRating)
    .map((user, index) => ({ ...user, rank: index + 1 }));

  return sorted;
}
