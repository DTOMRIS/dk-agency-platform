import { type MemberSession } from '@/lib/member-access';
import {
  createEmailVerificationToken,
  createLoginLog,
  createMockUser,
  findMockUserByEmail,
} from '@/lib/auth/mock-state';
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
  verificationRequired?: boolean;
  verificationToken?: string;
  message?: string;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

async function localLogin(payload: AuthPayload): Promise<AuthResult> {
  const user = findMockUserByEmail(payload.email);

  if (!user || user.password !== payload.password) {
    if (user) {
      createLoginLog(user.id, { success: false });
    }

    return { ok: false, error: 'E-mail və ya şifrə yanlışdır.', provider: 'local' };
  }

  if (!user.emailVerified) {
    createLoginLog(user.id, { success: false });

    return {
      ok: false,
      error: 'Email ünvanınızı təsdiqləyin. Təsdiq linkini yenidən göndərə bilərik.',
      provider: 'local',
    };
  }

  createLoginLog(user.id, { success: true });

  return {
    ok: true,
    provider: 'local',
    session: {
      email: user.email,
      name: user.name,
      loggedIn: true,
      plan: user.role,
    },
  };
}

async function localRegister(payload: AuthPayload): Promise<AuthResult> {
  const created = createMockUser({
    email: payload.email,
    name: payload.name?.trim() || 'DK Member',
    password: payload.password || '',
    company: payload.company,
    phone: payload.phone,
  });

  if ('error' in created) {
    return { ok: false, error: created.error, provider: 'local' };
  }

  const verificationToken = crypto.randomUUID();
  createEmailVerificationToken(created.user.id, verificationToken);
  console.log('Verification email:', created.user.email, verificationToken);
  console.log(
    'Verify URL:',
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`,
  );

  return {
    ok: true,
    provider: 'local',
    verificationRequired: true,
    verificationToken,
    message: 'Hesabınız yaradıldı! Email ünvanınıza təsdiq linki göndərildi.',
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

  return {
    ok: true,
    provider: 'supabase',
    verificationRequired: true,
    message: 'Hesabınız yaradıldı! Email təsdiqi üçün gələn linki açın.',
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
