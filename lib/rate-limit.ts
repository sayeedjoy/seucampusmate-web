type Bucket = {
  count: number;
  resetAt: number;
};

type CheckRateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

const buckets = new Map<string, Bucket>();
let checkCounter = 0;
const CLEANUP_EVERY_N_CHECKS = 100;
const FORCE_CLEANUP_SIZE = 5000;

function cleanupExpiredBuckets(now: number) {
  for (const [bucketKey, bucket] of buckets.entries()) {
    if (now >= bucket.resetAt) {
      buckets.delete(bucketKey);
    }
  }
}

export function checkRateLimit({ key, limit, windowMs }: CheckRateLimitOptions): RateLimitResult {
  const now = Date.now();
  checkCounter += 1;
  if (checkCounter % CLEANUP_EVERY_N_CHECKS === 0 || buckets.size > FORCE_CLEANUP_SIZE) {
    cleanupExpiredBuckets(now);
  }

  const current = buckets.get(key);

  if (!current || now >= current.resetAt) {
    const next: Bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(key, next);
    return {
      allowed: true,
      remaining: Math.max(0, limit - next.count),
      resetAt: next.resetAt,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  buckets.set(key, current);
  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export function getClientIp(request: { headers: Headers; ip?: string | null }) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  if (request.ip) return request.ip;
  return 'unknown';
}

export function rateLimitHeaders(result: RateLimitResult): Headers {
  return new Headers({
    'Retry-After': String(result.retryAfterSeconds),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetAt),
  });
}
