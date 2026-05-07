import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'dash_session';
const EXPIRATION = '24h';

function getSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function createToken(username) {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRATION)
    .sign(getSecret());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function validateCredentials(username, password) {
  try {
    const users = JSON.parse(process.env.DASH_USERS || '{}');
    return users[username] === password;
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
