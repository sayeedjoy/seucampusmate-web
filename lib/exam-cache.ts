import { Redis } from '@upstash/redis';
import { db } from '@/lib/db';
import { examSchedules } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { ExamResult } from './exam-utils';

const CACHE_KEY = 'exam_schedules_all';

// Redis is optional for exam caching; DB remains source of truth.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export type CachedExamRow = ExamResult & { students: string };

function rowToCache(row: typeof examSchedules.$inferSelect): CachedExamRow {
  return {
    program: row.program,
    slot: row.slot,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    courseCode: row.courseCode,
    courseTitle: row.courseTitle,
    students: row.students,
    faculty: row.faculty,
  };
}

async function loadExamRowsFromDb(): Promise<CachedExamRow[]> {
  const rows = await db
    .select()
    .from(examSchedules)
    .orderBy(asc(examSchedules.id));

  return rows.map(rowToCache);
}

/** Load all rows from DB and attempt to write them into Redis. */
export async function populateExamCache(): Promise<CachedExamRow[]> {
  const data = await loadExamRowsFromDb();

  if (redis) {
    try {
      await redis.set(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Redis set failed while populating exam cache:', error);
    }
  }

  return data;
}

/** Return cached rows, falling back to DB when cache is unavailable/corrupt/missing. */
export async function getExamCache(): Promise<CachedExamRow[]> {
  if (redis) {
    try {
      const raw = await redis.get<string>(CACHE_KEY);
      if (raw) {
        try {
          return JSON.parse(raw) as CachedExamRow[];
        } catch {
          // Corrupt cache payload; fall through to DB refresh.
        }
      }
    } catch (error) {
      console.error('Redis get failed while reading exam cache:', error);
    }
  }

  return populateExamCache();
}

/** Delete cached data; ignore cache-store outages. */
export async function clearExamCache(): Promise<void> {
  if (redis) {
    try {
      await redis.del(CACHE_KEY);
    } catch (error) {
      console.error('Redis delete failed while clearing exam cache:', error);
    }
  }
}
