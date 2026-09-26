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
 * `app/dashboard/layout.tsx` yalnız JWT-nin varlığını yoxlayır — qeydiyyatdan keçən
 * istənilən üzv dashboard-u aça bilirdi. Layout-u admin-only etmək olmur: üzv
 * panelindən `/dashboard/marketinq-ocagi/*`-yə keçid var. Ona görə DB-ni birbaşa
 * oxuyan dashboard səhifələri bu funksiyanı ilk sətirdə çağırır.
 */
export async function requireAdminPage(): Promise<JwtPayload> {
  const user = await getAuthFromCookie();
  if (!user) redirect('/auth/login');
  if (user.role !== 'admin') redirect('/b2b-panel');
  return user;
}
