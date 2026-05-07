import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE_NAME = 'dash_session';
const EXPIRATION = '24h';

/**
 * Create a JWT token for the given username
 */
export async function createToken(username) {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRATION)
    .sign(SECRET);
}

/**
 * Verify a JWT token and return the payload
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Get the current session from cookies
 */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Validate credentials against DASH_USERS env var
 */
export function validateCredentials(username, password) {
  try {
    const users = JSON.parse(process.env.DASH_USERS || '{}');
    return users[username] === password;
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
