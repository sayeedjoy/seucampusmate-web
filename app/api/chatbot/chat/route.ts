import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { NextRequest } from 'next/server';
import { checkChatbotRateLimit } from '@/lib/chatbot-rate-limit';
import { getClientIp, rateLimitHeaders } from '@/lib/rate-limit';
import { saveChatMessage } from '@/lib/db/chat-history';

type IncomingMessage = {
  role: string;
  parts?: Array<{ type: string; text?: string }>;
  content?: string;
};

type RagHistoryItem = {
  role: 'user' | 'assistant';
  content: string;
};

const FALLBACK_MESSAGE =
  'I am having trouble connecting right now. Please try again in a moment.';
const RATE_LIMIT_MESSAGE =
  'You have reached the chat limit for now. Please wait and try again later.';
const RAG_TIMEOUT_MS = 15000;
const SESSION_COOKIE_NAME = 'chat_session_id';
const SESSION_COOKIE_VALUE = 'Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000';

function setSessionCookie(headers: Headers, sessionId: string) {
  headers.set('Set-Cookie', `${SESSION_COOKIE_NAME}=${sessionId}; ${SESSION_COOKIE_VALUE}`);
}

function getOrCreateSessionId(request: NextRequest): string {
  const cookies = request.cookies;
  let sessionId = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

function writeAssistantText(
  writer: Parameters<Parameters<typeof createUIMessageStream>[0]['execute']>[0]['writer'],
  text: string
) {
  const idSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const textId = `text-${idSuffix}`;

  writer.write({ type: 'start' });
  writer.write({ type: 'text-start', id: textId });
  writer.write({ type: 'text-delta', id: textId, delta: text });
  writer.write({ type: 'text-end', id: textId });
  writer.write({ type: 'finish' });
}

function getMessageText(message: IncomingMessage): string {
  const partText = message.parts?.find((part) => part.type === 'text')?.text;
  if (typeof partText === 'string') return partText.trim();
  if (typeof message.content === 'string') return message.content.trim();
  return '';
}

async function fetchRagAnswer(question: string, history: RagHistoryItem[]): Promise<string> {
  const ragBase = process.env.RAG_API?.trim();
  if (!ragBase) return FALLBACK_MESSAGE;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);

  try {
    const response = await fetch(`${ragBase.replace(/\/+$/, '')}/chat`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ question, history }),
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) return FALLBACK_MESSAGE;

    const data = (await response.json()) as { answer?: unknown };
    const answer = typeof data.answer === 'string' ? data.answer.trim() : '';
    return answer || FALLBACK_MESSAGE;
  } catch {
    return FALLBACK_MESSAGE;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get('user-agent');
  const sessionId = getOrCreateSessionId(req);
  const { config, result: rateLimit } = await checkChatbotRateLimit(ip);

  if (!rateLimit.allowed) {
    const headers = rateLimitHeaders(rateLimit);
    setSessionCookie(headers, sessionId);
    return createUIMessageStreamResponse({
      headers,
      stream: createUIMessageStream({
        execute: ({ writer }) => {
          writeAssistantText(
            writer,
            `${RATE_LIMIT_MESSAGE} Limit: ${config.limit} message(s) per ${Math.max(
              1,
              Math.round(config.windowSeconds / 60)
            )} minute(s).`
          );
        },
      }),
    });
  }

  const body = await req.json();

  const messages: IncomingMessage[] = Array.isArray(body.messages) ? body.messages : [];

  const normalized = messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      role: message.role as 'user' | 'assistant',
      content: getMessageText(message),
    }))
    .filter((message) => message.content.length > 0);

  const lastUser = [...normalized].reverse().find((message) => message.role === 'user');
  if (!lastUser) {
    const headers = rateLimitHeaders(rateLimit);
    setSessionCookie(headers, sessionId);
    return createUIMessageStreamResponse({
      headers,
      stream: createUIMessageStream({
        execute: ({ writer }) => {
          writeAssistantText(writer, FALLBACK_MESSAGE);
        },
      }),
    });
  }

  const question = lastUser.content;
  const history: RagHistoryItem[] = [];
  let hasUsedQuestion = false;

  for (let i = normalized.length - 1; i >= 0; i -= 1) {
    const message = normalized[i];
    if (!message) continue;

    if (!hasUsedQuestion && message.role === 'user' && message.content === question) {
      hasUsedQuestion = true;
      continue;
    }

    history.unshift(message);
  }

  const answer = await fetchRagAnswer(question, history);

  await saveChatMessage({
    sessionId,
    role: 'user',
    content: question,
    userAgent,
    ipAddress: ip,
  });

  await saveChatMessage({
    sessionId,
    role: 'assistant',
    content: answer,
    userAgent,
    ipAddress: ip,
  });

  const headers = rateLimitHeaders(rateLimit);
  setSessionCookie(headers, sessionId);

  return createUIMessageStreamResponse({
    headers,
    stream: createUIMessageStream({
      execute: ({ writer }) => {
        writeAssistantText(writer, answer);
      },
    }),
  });
}
