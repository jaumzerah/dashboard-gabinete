import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createToken, COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { isAdmin } from '@/lib/roles';
import pool from '@/lib/db';

/**
 * POST /api/auth — Login
 * Body: { username, password }
 */
export async function POST(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const { allowed, remaining, retryAfter } = await checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { success: false, message: `Muitas tentativas. Tente novamente em ${retryAfter}s.` },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Preencha todos os campos.' },
        { status: 400 }
      );
    }

    const valid = await validateLogin(username, password);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: 'Usuário ou senha incorretos.' },
        {
          status: 401,
          headers: { 'X-RateLimit-Remaining': String(remaining) },
        }
      );
    }

    const role = isAdmin(username) ? 'admin' : 'assessor';
    const token = await createToken(username, role);

    const response = NextResponse.json({ success: true, username, role });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24h
    });

    return response;
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

async function validateLogin(username, password) {
  try {
    // Check bcrypt hash in DB first (users who changed password)
    const res = await pool.query(
      'SELECT hash FROM user_passwords WHERE username = $1',
      [username]
    );
    if (res.rows.length > 0) {
      return bcrypt.compare(password, res.rows[0].hash);
    }
  } catch {
    // Table may not exist yet; fall through to env check
  }

  // Fall back to DASH_USERS env var (JSON: {"user":"pass"})
  try {
    const users = JSON.parse(process.env.DASH_USERS || '{}');
    return users[username] === password;
  } catch {
    return false;
  }
}

/**
 * DELETE /api/auth — Logout
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
