import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_EXPIRES_IN = '7d';

export const AUTH_COOKIE_NAME = 'dk_auth_token';
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET env var is required. Set it in .env.local or hosting panel.');
  return secret;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload & { iat: number; exp: number };
    return { userId: decoded.userId, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}

export function authCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE,
  };
}

export async function getAuthFromCookie(): Promise<JwtPayload | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
