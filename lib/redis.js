import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is not defined');
}

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  connectTimeout: 3000,
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

export default redis;
