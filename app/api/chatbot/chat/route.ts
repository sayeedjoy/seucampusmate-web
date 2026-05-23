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

function extractDelta(payload: string): string {
  try {
    const parsed = JSON.parse(payload) as
      | string
      | { answer?: unknown; delta?: unknown; text?: unknown; content?: unknown; token?: unknown };
    if (typeof parsed === 'string') return parsed;
    const value = parsed.answer ?? parsed.delta ?? parsed.text ?? parsed.content ?? parsed.token;
    return typeof value === 'string' ? value : '';
  } catch {
    return payload;
  }
}

// Streams the RAG answer from `${RAG_API}/chat/stream` (SSE), invoking `onDelta`
// for each token as it arrives, and resolving with the full accumulated answer.
async function streamRagAnswer(
  question: string,
  history: RagHistoryItem[],
  onDelta: (delta: string) => void
): Promise<string> {
  const ragBase = process.env.RAG_API?.trim();
  if (!ragBase) {
    onDelta(FALLBACK_MESSAGE);
    return FALLBACK_MESSAGE;
  }

  const controller = new AbortController();
  // Guards time-to-first-byte; cleared once the stream is flowing so long
  // answers are not aborted mid-stream.
  const timeoutId = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);

  try {
    const response = await fetch(`${ragBase.replace(/\/+$/, '')}/chat/stream`, {
      method: 'POST',
      headers: {
        accept: 'text/event-stream',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ question, history }),
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      onDelta(FALLBACK_MESSAGE);
      return FALLBACK_MESSAGE;
    }

    clearTimeout(timeoutId);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let full = '';

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith('data:')) continue;

        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;

        const delta = extractDelta(payload);
        if (delta) {
          full += delta;
          onDelta(delta);
        }
      }
    }

    if (!full.trim()) {
      onDelta(FALLBACK_MESSAGE);
      return FALLBACK_MESSAGE;
    }

    return full.trim();
  } catch {
    onDelta(FALLBACK_MESSAGE);
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

  await saveChatMessage({
    sessionId,
    role: 'user',
    content: question,
    userAgent,
    ipAddress: ip,
  });

  const headers = rateLimitHeaders(rateLimit);
  setSessionCookie(headers, sessionId);

  return createUIMessageStreamResponse({
    headers,
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        const idSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const textId = `text-${idSuffix}`;

        writer.write({ type: 'start' });
        writer.write({ type: 'text-start', id: textId });

        const answer = await streamRagAnswer(question, history, (delta) => {
          writer.write({ type: 'text-delta', id: textId, delta });
        });

        writer.write({ type: 'text-end', id: textId });
        writer.write({ type: 'finish' });

        await saveChatMessage({
          sessionId,
          role: 'assistant',
          content: answer,
          userAgent,
          ipAddress: ip,
        });
      },
    }),
  });
}
