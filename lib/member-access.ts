export const MEMBER_STORAGE_KEY = 'dk_user';

export type MemberPlan = 'free' | 'member' | 'admin';

export interface MemberSession {
  email: string;
  name: string;
  loggedIn: boolean;
  plan: MemberPlan;
}

export function getGuestSession(): MemberSession {
  return {
    email: '',
    name: '',
    loggedIn: false,
    plan: 'free',
  };
}

export function readMemberSession(): MemberSession {
  if (typeof window === 'undefined') {
    return getGuestSession();
  }

  try {
    const raw = window.localStorage.getItem(MEMBER_STORAGE_KEY);
    if (!raw) {
      return getGuestSession();
    }

    const parsed = JSON.parse(raw) as Partial<MemberSession>;
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

export function writeMemberSession(session: MemberSession) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event('member-session-updated'));
}

export function clearMemberSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(MEMBER_STORAGE_KEY);
  window.dispatchEvent(new Event('member-session-updated'));
}

export function hasFullArticleAccess(session: MemberSession) {
  return session.loggedIn && (session.plan === 'member' || session.plan === 'admin');
}
