import { type MemberSession } from '@/lib/member-access';
import { getMembershipCapability } from '@/lib/members/provider';

export interface AuthPayload {
  email: string;
  password?: string;
  name?: string;
  company?: string;
  phone?: string;
}

export interface AuthResult {
  ok: boolean;
  session?: MemberSession;
  error?: string;
  provider: 'local' | 'supabase';
}

const LOCAL_USERS = [
  { email: 'dotomris@gmail.com', password: '123456', name: 'Doğan Tomris', plan: 'admin' as const },
  { email: 'admin@dkagency.az', password: 'admin123', name: 'DK Admin', plan: 'admin' as const },
  { email: 'member@dkagency.az', password: 'member123', name: 'DK Member', plan: 'member' as const },
];

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

async function localLogin(payload: AuthPayload): Promise<AuthResult> {
  const user = LOCAL_USERS.find(
    (item) => item.email === normalizeEmail(payload.email) && item.password === payload.password
  );

  if (!user) {
    return { ok: false, error: 'E-mail və ya şifrə yanlışdır.', provider: 'local' };
  }

  return {
    ok: true,
    provider: 'local',
    session: {
      email: user.email,
      name: user.name,
      loggedIn: true,
      plan: user.plan,
    },
  };
}

async function localRegister(payload: AuthPayload): Promise<AuthResult> {
  return {
    ok: true,
    provider: 'local',
    session: {
      email: normalizeEmail(payload.email),
      name: payload.name?.trim() || 'DK Member',
      loggedIn: true,
      plan: 'member',
    },
  };
}

async function supabaseLogin(payload: AuthPayload): Promise<AuthResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return { ok: false, error: 'Supabase env tapılmadı.', provider: 'supabase' };
  }

  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anon,
    },
    body: JSON.stringify({
      email: normalizeEmail(payload.email),
      password: payload.password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      error: data?.msg || data?.error_description || 'Supabase login alınmadı.',
      provider: 'supabase',
    };
  }

  const email = data?.user?.email || normalizeEmail(payload.email);
  const name = data?.user?.user_metadata?.name || email.split('@')[0];
  const role = data?.user?.user_metadata?.role === 'admin' ? 'admin' : 'member';

  return {
    ok: true,
    provider: 'supabase',
    session: {
      email,
      name,
      loggedIn: true,
      plan: role,
    },
  };
}

async function supabaseRegister(payload: AuthPayload): Promise<AuthResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return { ok: false, error: 'Supabase env tapılmadı.', provider: 'supabase' };
  }

  const response = await fetch(`${url}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anon,
    },
    body: JSON.stringify({
      email: normalizeEmail(payload.email),
      password: payload.password,
      data: {
        name: payload.name?.trim() || 'DK Member',
        company: payload.company?.trim() || '',
        phone: payload.phone?.trim() || '',
        role: 'member',
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      error: data?.msg || data?.error_description || 'Supabase signup alınmadı.',
      provider: 'supabase',
    };
  }

  const email = data?.user?.email || normalizeEmail(payload.email);
  const name = data?.user?.user_metadata?.name || payload.name?.trim() || 'DK Member';

  return {
    ok: true,
    provider: 'supabase',
    session: {
      email,
      name,
      loggedIn: true,
      plan: 'member',
    },
  };
}

export async function loginMember(payload: AuthPayload): Promise<AuthResult> {
  const capability = getMembershipCapability();
  return capability.provider === 'supabase' ? supabaseLogin(payload) : localLogin(payload);
}

export async function registerMember(payload: AuthPayload): Promise<AuthResult> {
  const capability = getMembershipCapability();
  return capability.provider === 'supabase' ? supabaseRegister(payload) : localRegister(payload);
}
