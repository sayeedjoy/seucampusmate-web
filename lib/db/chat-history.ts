import { eq, desc, lt, count } from 'drizzle-orm';
import { db } from './index';
import { chatHistory, type ChatHistory } from './schema';

export interface SaveChatMessageParams {
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export async function saveChatMessage(params: SaveChatMessageParams): Promise<ChatHistory> {
  const [record] = await db
    .insert(chatHistory)
    .values(params)
    .returning();
  return record;
}

export async function saveChatMessages(
  messages: SaveChatMessageParams[]
): Promise<ChatHistory[]> {
  if (messages.length === 0) return [];
  const records = await db
    .insert(chatHistory)
    .values(messages)
    .returning();
  return records;
}

export async function getChatHistoryBySession(
  sessionId: string,
  limit = 50
): Promise<ChatHistory[]> {
  return db
    .select()
    .from(chatHistory)
    .where(eq(chatHistory.sessionId, sessionId))
    .orderBy(desc(chatHistory.createdAt))
    .limit(limit);
}

export async function getRecentChatSessions(limit = 100): Promise<string[]> {
  const sessions = await db
    .selectDistinct({ sessionId: chatHistory.sessionId })
    .from(chatHistory)
    .orderBy(desc(chatHistory.createdAt))
    .limit(limit);
  return sessions.map((s) => s.sessionId);
}

const CHAT_HISTORY_RETENTION_DAYS = 15;

export async function cleanupOldChatHistory(): Promise<{ deleted: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - CHAT_HISTORY_RETENTION_DAYS);

  const result = await db
    .delete(chatHistory)
    .where(lt(chatHistory.createdAt, cutoffDate))
    .returning({ id: chatHistory.id });

  return { deleted: result.length };
}

export interface ChatHistoryWithCount {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  totalSessions: number;
  totalRecords: number;
}

export interface ChatHistoryPageResult {
  records: ChatHistoryWithCount[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export async function getChatHistoryPage({
  page = 1,
  pageSize = 50,
  sessionId,
}: {
  page?: number;
  pageSize?: number;
  sessionId?: string | null;
}): Promise<ChatHistoryPageResult> {
  const whereClause = sessionId ? eq(chatHistory.sessionId, sessionId) : undefined;

  const [{ total }, { sessionCount }] = await Promise.all([
    db
      .select({ total: count() })
      .from(chatHistory)
      .where(whereClause)
      .then((rows) => rows[0] ?? { total: 0 }),
    db
      .select({ sessionCount: count(chatHistory.sessionId) })
      .from(chatHistory)
      .where(whereClause)
      .then((rows) => rows[0] ?? { sessionCount: 0 }),
  ]);

  const totalRecords = total;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const normalizedPage = Math.min(Math.max(1, page), totalPages);
  const offset = (normalizedPage - 1) * pageSize;

  const records = await db
    .select()
    .from(chatHistory)
    .where(whereClause)
    .orderBy(desc(chatHistory.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    records: records.map((r) => ({
    ...r,
    totalSessions: sessionCount,
    totalRecords,
    })),
    page: normalizedPage,
    pageSize,
    totalRecords,
    totalPages,
  };
}

export async function deleteChatHistoryBySession(sessionId: string): Promise<{ deleted: number }> {
  const result = await db
    .delete(chatHistory)
    .where(eq(chatHistory.sessionId, sessionId))
    .returning({ id: chatHistory.id });
  return { deleted: result.length };
}

export async function deleteChatHistoryById(id: string): Promise<boolean> {
  const result = await db
    .delete(chatHistory)
    .where(eq(chatHistory.id, id))
    .returning({ id: chatHistory.id });
  return result.length > 0;
}

export async function deleteAllChatHistory(): Promise<{ deleted: number }> {
  const result = await db
    .delete(chatHistory)
    .returning({ id: chatHistory.id });
  return { deleted: result.length };
}
