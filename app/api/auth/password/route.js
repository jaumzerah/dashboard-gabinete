import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';

async function ensurePasswordsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_passwords (
      username TEXT PRIMARY KEY,
      hash TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function POST(request) {
  try {
    const token = request.cookies.get('dash_session')?.value;
    const session = token ? await verifyToken(token) : null;
    if (!session) {
      return NextResponse.json({ success: false, message: 'Não autenticado.' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: 'Preencha todos os campos.' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, message: 'A nova senha deve ter ao menos 8 caracteres.' }, { status: 400 });
    }

    await ensurePasswordsTable();

    const { username } = session;

    // Check existing hash in DB first, fall back to DASH_USERS env
    const dbResult = await pool.query(
      'SELECT hash FROM user_passwords WHERE username = $1',
      [username]
    );

    let validCurrent = false;

    if (dbResult.rows.length > 0) {
      validCurrent = await bcrypt.compare(currentPassword, dbResult.rows[0].hash);
    } else {
      // Fall back to env var (plain text for legacy users)
      try {
        const users = JSON.parse(process.env.DASH_USERS || '{}');
        validCurrent = users[username] === currentPassword;
      } catch {
        validCurrent = false;
      }
    }

    if (!validCurrent) {
      return NextResponse.json({ success: false, message: 'Senha atual incorreta.' }, { status: 403 });
    }

    const hash = await bcrypt.hash(newPassword, 12);

    await pool.query(`
      INSERT INTO user_passwords (username, hash, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (username) DO UPDATE SET hash = $2, updated_at = NOW()
    `, [username, hash]);

    return NextResponse.json({ success: true, message: 'Senha alterada com sucesso.' });
  } catch (err) {
    console.error('[PASSWORD]', err);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
