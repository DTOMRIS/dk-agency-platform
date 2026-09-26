import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, verifyToken, type JwtPayload } from '@/lib/auth/jwt';
import { getGuestSession, type MemberSession } from '@/lib/member-access';

/**
 * TASK-0457 (təhlükəsizlik): bu cookie imzasız base64 JSON-dur və əvvəl
 * `/api/member/session` POST bədəndəki `plan: 'admin'`-i yoxlamadan yazırdı →
 * istənilən şəxs özünü admin edə bilirdi. İndi səlahiyyət (`loggedIn`, `plan`)
 * YALNIZ imzalı JWT-dən (`dk_auth_token`, httpOnly) gəlir; bu cookie-dən yalnız
 * göstəriləcək ad götürülür (e-poçt JWT ilə üst-üstə düşəndə).
 */
export const MEMBER_COOKIE_NAME = 'dk_member_session';

export function encodeMemberSession(session: MemberSession) {
  return Buffer.from(JSON.stringify(session), 'utf8').toString('base64url');
}

export function decodeMemberSession(value: string): MemberSession {
  try {
    const decoded = Buffer.from(value, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded) as Partial<MemberSession>;

    return {
      email: parsed.email ?? '',
      name: parsed.name ?? '',
      loggedIn: parsed.loggedIn === true,
      plan: parsed.plan === 'admin' || parsed.plan === 'member' ? parsed.plan : 'free',
    };
  } catch {
    return getGuestSession();
  }
}

/** Yoxlanmış JWT → member sessiyası. `name` yalnız göstərmək üçündür. */
export function sessionFromJwt(payload: JwtPayload | null, displayName = ''): MemberSession {
  if (!payload) return getGuestSession();
  return {
    email: payload.email,
    name: displayName.slice(0, 120),
    loggedIn: true,
    plan: payload.role === 'admin' ? 'admin' : 'member',
  };
}

export async function getServerMemberSession(): Promise<MemberSession> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return getGuestSession();

  const raw = store.get(MEMBER_COOKIE_NAME)?.value;
  const display = raw ? decodeMemberSession(raw) : null;
  const name =
    display && display.email.toLowerCase() === payload.email.toLowerCase() ? display.name : '';
  return sessionFromJwt(payload, name);
}
