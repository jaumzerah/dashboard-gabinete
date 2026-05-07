import pg from 'pg';

let _pool = null;

function getPool() {
  if (_pool) return _pool;
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }
  _pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  _pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err.message);
  });
  return _pool;
}

export default {
  query: (...args) => getPool().query(...args),
};
