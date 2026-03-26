import { cookies } from 'next/headers';
import { getGuestSession, type MemberSession } from '@/lib/member-access';

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

export async function getServerMemberSession() {
  const store = await cookies();
  const raw = store.get(MEMBER_COOKIE_NAME)?.value;

  if (!raw) {
    return getGuestSession();
  }

  return decodeMemberSession(raw);
}
