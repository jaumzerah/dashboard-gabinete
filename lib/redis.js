import Redis from 'ioredis';

let _redis = null;

function getRedis() {
  if (_redis) return _redis;
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is not defined');
  }
  _redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    connectTimeout: 3000,
    lazyConnect: true,
  });
  _redis.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
  });
  return _redis;
}

export default {
  ping: () => getRedis().ping(),
  incr: (key) => getRedis().incr(key),
  expire: (key, seconds) => getRedis().expire(key, seconds),
  ttl: (key) => getRedis().ttl(key),
};
