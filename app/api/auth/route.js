import { NextResponse } from 'next/server';
import { createToken, validateCredentials, COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

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

    if (!validateCredentials(username, password)) {
      return NextResponse.json(
        { success: false, message: 'Usuário ou senha incorretos.' },
        {
          status: 401,
          headers: { 'X-RateLimit-Remaining': String(remaining) },
        }
      );
    }

    const token = await createToken(username);

    const response = NextResponse.json({ success: true, username });

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
