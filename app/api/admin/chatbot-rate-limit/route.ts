import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getChatbotRateLimitConfig,
  updateChatbotRateLimitConfig,
} from '@/lib/chatbot-rate-limit';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = await getChatbotRateLimitConfig();
  return NextResponse.json(config);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { enabled?: unknown; limit?: unknown; windowSeconds?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const next = await updateChatbotRateLimitConfig({
    enabled: typeof body.enabled === 'boolean' ? body.enabled : undefined,
    limit: typeof body.limit === 'number' ? body.limit : undefined,
    windowSeconds: typeof body.windowSeconds === 'number' ? body.windowSeconds : undefined,
  });

  return NextResponse.json(next);
}
