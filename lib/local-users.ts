import fs from 'fs/promises';
import path from 'path';

export interface LocalUserEntry {
  username: string;
  exclude: boolean;
  addedAt: string;
}

export interface LocalUsersData {
  users: LocalUserEntry[];
  lastUpdated: string | null;
  source: 'api' | 'fallback';
}

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'usernames.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE_PATH);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Fetch usernames from API and save to local file as fallback
export async function fetchAndSaveUsernamesFromAPI(): Promise<LocalUsersData> {
  try {
    console.log('Fetching usernames from API and saving to local file...');
    
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
    
    let usernames: string[] = [];
    
    // Handle the actual API response structure
    if (data.success && data.data && data.data.usernames && Array.isArray(data.data.usernames)) {
      usernames = data.data.usernames;
    } else if (data.success && data.data && Array.isArray(data.data)) {
      usernames = data.data;
    } else {
      throw new Error('Invalid API response format');
    }

    // Convert to local format (all users are included, none excluded)
    const localData: LocalUsersData = {
      users: usernames.map(username => ({
        username,
        exclude: false,
        addedAt: new Date().toISOString()
      })),
      lastUpdated: new Date().toISOString(),
      source: 'api'
    };

    // Save to local file
    await writeLocalUsernames(localData);
    console.log(`Successfully saved ${usernames.length} usernames from API to local file`);
    
    return localData;
  } catch (error) {
    console.error('Error fetching usernames from API:', error);
    throw error;
  }
}

// Read usernames from local file (fallback only)
export async function readLocalUsernames(): Promise<LocalUsersData> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    console.warn('Local usernames file not found or invalid, returning empty data');
    return {
      users: [],
      lastUpdated: null,
      source: 'fallback'
    };
  }
}

// Write usernames to local file
export async function writeLocalUsernames(data: LocalUsersData): Promise<void> {
  try {
    await ensureDataDirectory();
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Successfully updated local usernames file with ${data.users.length} users`);
  } catch (error) {
    console.error('Error writing local usernames file:', error);
    throw error;
  }
}

// Get file stats for debugging
export async function getLocalFileStats(): Promise<{
  exists: boolean;
  userCount: number;
  lastUpdated: string | null;
  fileSize?: number;
  source: string;
}> {
  try {
    const data = await readLocalUsernames();
    const stats = await fs.stat(DATA_FILE_PATH);
    
    return {
      exists: true,
      userCount: data.users.length,
      lastUpdated: data.lastUpdated,
      fileSize: stats.size,
      source: data.source
    };
  } catch {
    return {
      exists: false,
      userCount: 0,
      lastUpdated: null,
      source: 'fallback'
    };
  }
}
