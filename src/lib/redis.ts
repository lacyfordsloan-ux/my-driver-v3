import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redis = new Redis(redisUrl);

export async function rateLimit(key: string, limit: number, windowInSeconds: number): Promise<{ success: boolean; remaining: number }> {
  const current = await redis.get(key);
  const count = current ? parseInt(current) : 0;

  if (count >= limit) {
    const ttl = await redis.ttl(key);
    return { success: false, remaining: 0 };
  }

  const multi = redis.multi();
  multi.incr(key);
  if (count === 0) {
    multi.expire(key, windowInSeconds);
  }
  
  await multi.exec();
  
  return { success: true, remaining: limit - count - 1 };
}
