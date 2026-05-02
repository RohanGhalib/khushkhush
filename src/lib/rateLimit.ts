/**
 * Simple In-Memory Rate Limiter
 * 
 * NOTE: This works fine for single-instance Node.js deployments.
 * If deploying to serverless environments (Vercel, Netlify), this will reset
 * when the function cold-starts. For production serverless, consider using
 * @upstash/ratelimit with Redis.
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export async function rateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  
  if (!store[identifier]) {
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return { success: true, remaining: limit - 1 };
  }

  const record = store[identifier];

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count };
}
