import redis from '@/lib/redis';

const WINDOW_SECONDS = 60;
const MAX_ATTEMPTS = 10;

/**
 * Returns { allowed: boolean, remaining: number, retryAfter: number }
 */
export async function checkRateLimit(ip) {
  const key = `rl:login:${ip}`;

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  const ttl = await redis.ttl(key);
  const remaining = Math.max(MAX_ATTEMPTS - current, 0);

  return {
    allowed: current <= MAX_ATTEMPTS,
    remaining,
    retryAfter: current > MAX_ATTEMPTS ? ttl : 0,
  };
}
