import { Redis } from '@upstash/redis';
import { checkRateLimit, type RateLimitResult } from '@/lib/rate-limit';

export type ChatbotRateLimitConfig = {
  enabled: boolean;
  limit: number;
  windowSeconds: number;
};

const DEFAULT_CONFIG: ChatbotRateLimitConfig = {
  enabled: true,
  limit: 3,
  windowSeconds: 60 * 60,
};

const CONFIG_KEY = 'chatbot:chat:rate-limit:config:v1';
const COUNTER_PREFIX = 'chatbot:chat:rate-limit:counter:v1';

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

function clampConfig(input: Partial<ChatbotRateLimitConfig>): ChatbotRateLimitConfig {
  const enabled = typeof input.enabled === 'boolean' ? input.enabled : DEFAULT_CONFIG.enabled;
  const limit =
    typeof input.limit === 'number' && Number.isFinite(input.limit)
      ? Math.min(1000, Math.max(1, Math.trunc(input.limit)))
      : DEFAULT_CONFIG.limit;
  const windowSeconds =
    typeof input.windowSeconds === 'number' && Number.isFinite(input.windowSeconds)
      ? Math.min(24 * 60 * 60, Math.max(60, Math.trunc(input.windowSeconds)))
      : DEFAULT_CONFIG.windowSeconds;

  return { enabled, limit, windowSeconds };
}

export async function getChatbotRateLimitConfig(): Promise<ChatbotRateLimitConfig> {
  if (!redis) return DEFAULT_CONFIG;

  try {
    const raw = await redis.get<Partial<ChatbotRateLimitConfig>>(CONFIG_KEY);
    if (!raw || typeof raw !== 'object') return DEFAULT_CONFIG;
    return clampConfig(raw);
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function updateChatbotRateLimitConfig(
  input: Partial<ChatbotRateLimitConfig>
): Promise<ChatbotRateLimitConfig> {
  const next = clampConfig(input);
  if (!redis) return next;

  await redis.set(CONFIG_KEY, next);
  return next;
}

export async function checkChatbotRateLimit(ip: string): Promise<{
  config: ChatbotRateLimitConfig;
  result: RateLimitResult;
}> {
  const config = await getChatbotRateLimitConfig();

  if (!config.enabled) {
    return {
      config,
      result: {
        allowed: true,
        remaining: Number.MAX_SAFE_INTEGER,
        resetAt: Date.now() + config.windowSeconds * 1000,
        retryAfterSeconds: 0,
      },
    };
  }

  if (!redis) {
    return {
      config,
      result: checkRateLimit({
        key: `chatbot-chat:${ip}`,
        limit: config.limit,
        windowMs: config.windowSeconds * 1000,
      }),
    };
  }

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const windowStart = now - (now % windowMs);
  const counterKey = `${COUNTER_PREFIX}:${ip}:${windowStart}`;

  try {
    const count = await redis.incr(counterKey);
    if (count === 1) {
      await redis.expire(counterKey, config.windowSeconds + 60);
    }

    const resetAt = windowStart + windowMs;
    const remaining = Math.max(0, config.limit - count);

    if (count > config.limit) {
      return {
        config,
        result: {
          allowed: false,
          remaining: 0,
          resetAt,
          retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
        },
      };
    }

    return {
      config,
      result: {
        allowed: true,
        remaining,
        resetAt,
        retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
      },
    };
  } catch {
    return {
      config,
      result: checkRateLimit({
        key: `chatbot-chat:fallback:${ip}`,
        limit: config.limit,
        windowMs: windowMs,
      }),
    };
  }
}
