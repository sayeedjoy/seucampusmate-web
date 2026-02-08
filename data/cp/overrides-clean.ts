import { fetchAndSaveUsernamesFromAPI, readLocalUsernames, getLocalFileStats } from '@/lib/local-users';

interface UserEntry {
  username: string;
  exclude: boolean;
}

// Function to fetch users from API
async function getUsersFromAPI(): Promise<UserEntry[]> {
  try {
    const response = await fetch('https://cp.campusmate.app/api.php?endpoint=usernames', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch usernames: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle the actual API response structure
    if (data.success && data.data && data.data.usernames && Array.isArray(data.data.usernames)) {
      const usernames = data.data.usernames.map((username: string) => ({
        username: username,
        exclude: false
      }));
      
      // Update local fallback file in the background (don't wait for it)
      fetchAndSaveUsernamesFromAPI().catch(error => 
        console.warn('Background local file update failed:', error.message)
      );
      
      return usernames;
    } else if (data.success && data.data && Array.isArray(data.data)) {
      const usernames = data.data.map((username: string) => ({
        username: username,
        exclude: false
      }));
      
      // Update local fallback file in the background (don't wait for it)
      fetchAndSaveUsernamesFromAPI().catch(error => 
        console.warn('Background local file update failed:', error.message)
      );
      
      return usernames;
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.error('Error fetching usernames from API:', error);
    return getUsersFromLocal();
  }
}

// Function to read from local file (fallback source)
async function getUsersFromLocal(): Promise<UserEntry[]> {
  try {
    const localData = await readLocalUsernames();
    console.log(`Loaded ${localData.users.length} users from local fallback file (last updated: ${localData.lastUpdated})`);
    
    return localData.users.map(user => ({
      username: user.username,
      exclude: user.exclude
    }));
  } catch (error) {
    console.error('Error reading from local fallback file:', error);
    return [];
  }
}

// Get usernames to include (not excluded)
export async function getManualInclude(): Promise<string[]> {
  const users = await getUsersFromAPI();
  return users
    .filter(user => !user.exclude)
    .map(user => user.username);
}

// Get usernames to exclude
export async function getExcludeList(): Promise<string[]> {
  const users = await getUsersFromAPI();
  return users
    .filter(user => user.exclude)
    .map(user => user.username);
}

// Refresh function (fetches from API and updates local fallback)
export async function refreshUsersFromSheet(): Promise<string[]> {
  console.log('Refreshing users from API and updating local fallback...');
  try {
    // Fetch from API and save to local file
    const localData = await fetchAndSaveUsernamesFromAPI();
    return localData.users.map(user => user.username);
  } catch (error) {
    console.error('Failed to refresh from API, using existing local data:', error);
    // If API fails, try to use existing local data
    const localData = await readLocalUsernames();
    return localData.users.map(user => user.username);
  }
}

// Get status of API and local fallback system
export async function getCacheStatus(): Promise<{ 
  hasCachedData: boolean; 
  lastFetch: number | null; 
  userCount: number;
  isStale: boolean;
  cacheAge: number;
  localFile: {
    exists: boolean;
    userCount: number;
    lastUpdated: string | null;
    source: string;
  };
}> {
  try {
    // Try to fetch from API first
    const apiUsers = await getUsersFromAPI();
    const now = Date.now();
    
    // Also update local fallback file
    try {
      await fetchAndSaveUsernamesFromAPI();
    } catch (saveError) {
      console.warn('Failed to update local fallback file:', saveError);
    }
    
    return {
      hasCachedData: true,
      lastFetch: now,
      userCount: apiUsers.length,
      isStale: false, // API data is always fresh
      cacheAge: 0,
      localFile: {
        exists: true,
        userCount: apiUsers.length,
        lastUpdated: new Date().toISOString(),
        source: 'api'
      }
    };
  } catch (error) {
    console.error('API fetch failed, using local fallback file:', error);
    
    // Use local fallback file
    const localStats = await getLocalFileStats();
    const now = Date.now();
    const lastUpdateTime = localStats.lastUpdated ? new Date(localStats.lastUpdated).getTime() : 0;
    
    return {
      hasCachedData: localStats.exists,
      lastFetch: lastUpdateTime,
      userCount: localStats.userCount,
      isStale: true, // Local file is stale compared to API
      cacheAge: lastUpdateTime ? now - lastUpdateTime : 0,
      localFile: localStats
    };
  }
}

// Backward compatibility - these will be empty arrays now
export const MANUAL_INCLUDE: string[] = [];
export const EXCLUDE: string[] = [];
