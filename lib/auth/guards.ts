import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken, AUTH_COOKIE_NAME, getAuthFromCookie, type JwtPayload } from './jwt';

export async function requireAdmin(): Promise<
  { ok: true; user: JwtPayload } | { ok: false; response: NextResponse }
> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const user = verifyToken(token);
  if (!user || user.role !== 'admin') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { ok: true, user };
}

/**
 * Server səhifəsi üçün admin qoruyucusu (TASK-0457).
 * TASK-0458-dən bəri `app/dashboard/layout.tsx` özü admin-only-dir; DB-ni birbaşa
 * oxuyan dashboard səhifələri bunu əlavə qat kimi ilk sətirdə çağırır (layout
 * dəyişsə belə lead/müştəri datası açılmasın).
 */
export async function requireAdminPage(): Promise<JwtPayload> {
  const user = await getAuthFromCookie();
  if (!user) redirect('/auth/login');
  if (user.role !== 'admin') redirect('/b2b-panel');
  return user;
}
