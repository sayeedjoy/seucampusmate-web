import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { NextRequest } from 'next/server';

// ── RAG helpers ──────────────────────────────────────────────────────────────

const ROUTINE_KEYWORDS = [
  /exam/i, /routine/i, /schedule/i, /course\s*code/i,
  /cse\s*\d/i, /eee\s*\d/i, /bba\s*\d/i, /ete\s*\d/i,
  /when.*exam/i, /exam.*when/i, /midterm/i, /final/i,
];

function detectRoutineQuery(text: string): string | null {
  if (!ROUTINE_KEYWORDS.some((r) => r.test(text))) return null;
  const match = text.match(/[A-Z]{2,4}\s*\d{3}(?:\.\d)?/i);
  return match ? match[0] : text;
}

async function fetchRoutineContext(query: string): Promise<string> {
  const apiKey = process.env.CHATBOT_INTERNAL_API_KEY;
  if (!apiKey) return '';
  const base = process.env.AUTH_URL ?? 'http://localhost:3000';
  try {
    const res = await fetch(
      `${base}/api/chatbot/routine?search=${encodeURIComponent(query)}`,
      { headers: { 'x-api-key': apiKey }, cache: 'no-store' }
    );
    if (!res.ok) return '';
    const data = await res.json();
    return (data.summary as string) || '';
  } catch {
    return '';
  }
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();

  const messages: Array<{
    role: string;
    parts?: Array<{ type: string; text?: string }>;
    content?: string;
  }> = body.messages ?? [];

  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const userText =
    lastUser?.parts?.find((p) => p.type === 'text')?.text ??
    (typeof lastUser?.content === 'string' ? lastUser.content : '');

  const routineQuery = detectRoutineQuery(userText);
  const routineContext = routineQuery ? await fetchRoutineContext(routineQuery) : '';

  const systemPrompt = [
    'You are SEU CampusMate, a helpful AI assistant for students of Southeast University Bangladesh.',
    'You help with exam routines, CGPA calculation, attendance tracking, and general campus queries.',
    'Keep answers concise and under 300 words. If you are unsure, say so.',
    routineContext ? `\n## Retrieved Exam Routine Data:\n${routineContext}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const coreMessages = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content:
        m.parts?.find((p) => p.type === 'text')?.text ??
        (typeof m.content === 'string' ? m.content : ''),
    }));

  const or = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY ?? '',
    headers: {
      'HTTP-Referer': process.env.AUTH_URL ?? 'http://localhost:3000',
      'X-Title': 'SEU CampusMate',
    },
  });

  const modelId = process.env.OPENROUTER_MODEL ?? 'google/gemini-2.0-flash-001';

  const result = streamText({
    model: or(modelId),
    system: systemPrompt,
    messages: coreMessages,
    maxOutputTokens: 2048,
  });

  return result.toUIMessageStreamResponse();
}
