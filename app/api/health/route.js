import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import redis from '@/lib/redis';

export async function GET() {
  try {
    await Promise.all([
      pool.query('SELECT 1'),
      redis.ping(),
    ]);
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('[Health] Check failed:', err.message);
    return NextResponse.json({ status: 'error', message: err.message }, { status: 503 });
  }
}
