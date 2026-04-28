import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getChatHistoryPage,
  deleteChatHistoryById,
  deleteAllChatHistory,
  deleteChatHistoryBySession,
  deleteChatHistoryBySessions,
} from '@/lib/db/chat-history';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '50', 10) || 50));
  const sessionId = searchParams.get('sessionId');

  const result = await getChatHistoryPage({ page, pageSize, sessionId: sessionId || null });
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const deleteAll = searchParams.get('all') === 'true';
  const id = searchParams.get('id');

  if (deleteAll) {
    const { deleted } = await deleteAllChatHistory();
    return NextResponse.json({ deleted, message: `Deleted ${deleted} record(s)` });
  }

  if (id) {
    const deleted = await deleteChatHistoryById(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ deleted: 1, id });
  }

  try {
    const body = await request.json();
    const sessionIds = Array.isArray(body?.sessionIds)
      ? body.sessionIds.filter((value: unknown): value is string => typeof value === 'string' && value.trim().length > 0)
      : [];
    if (sessionIds.length > 0) {
      const uniqueSessionIds = [...new Set<string>(sessionIds)];
      const { deleted } = await deleteChatHistoryBySessions(uniqueSessionIds);
      return NextResponse.json({ deleted, sessionIds: uniqueSessionIds });
    }
  } catch {
    // Ignore missing/invalid JSON body and continue with query-param handlers.
  }

  const sessionId = searchParams.get('sessionId');
  if (sessionId) {
    const { deleted } = await deleteChatHistoryBySession(sessionId);
    return NextResponse.json({ deleted, sessionId });
  }

  return NextResponse.json({ error: 'Provide id, sessionId, or all=true' }, { status: 400 });
}
