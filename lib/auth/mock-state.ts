export interface MockAuthUser {
  id: number;
  email: string;
  name: string;
  password: string;
  phone?: string;
  company?: string;
  emailVerified: boolean;
  role: 'member' | 'admin';
}

export interface MockTokenRecord {
  token: string;
  userId: number;
  expiresAt: number;
  usedAt?: number;
}

export interface MockLoginLog {
  id: number;
  userId: number;
  ipAddress: string;
  userAgent: string;
  city: string;
  country: string;
  success: boolean;
  createdAt: string;
}

const users: MockAuthUser[] = [
  {
    id: 1,
    email: 'dotomris@gmail.com',
    name: 'Doğan Tomris',
    password: '12345678',
    emailVerified: true,
    role: 'admin',
    phone: '+994501234567',
  },
  {
    id: 2,
    email: 'admin@dkagency.az',
    name: 'DK Admin',
    password: 'admin123',
    emailVerified: true,
    role: 'admin',
    phone: '+994501112233',
  },
  {
    id: 3,
    email: 'member@dkagency.az',
    name: 'DK Member',
    password: 'member123',
    emailVerified: true,
    role: 'member',
    phone: '+994501112244',
  },
];

const passwordResetTokens: MockTokenRecord[] = [];
const emailVerificationTokens: MockTokenRecord[] = [];
const loginLogs: MockLoginLog[] = [
  {
    id: 1,
    userId: 1,
    ipAddress: '85.132.14.22',
    userAgent: 'Chrome / Windows',
    city: 'Bakı',
    country: 'AZ',
    success: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    userId: 1,
    ipAddress: '85.132.14.55',
    userAgent: 'Safari / iPhone',
    city: 'Bakı',
    country: 'AZ',
    success: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function findMockUserByEmail(email: string) {
  return users.find((user) => user.email === normalizeEmail(email));
}

export function findMockUserById(id: number) {
  return users.find((user) => user.id === id);
}

export function createMockUser(input: {
  email: string;
  name: string;
  password: string;
  phone?: string;
  company?: string;
}) {
  const existing = findMockUserByEmail(input.email);
  if (existing) return { error: 'Bu email artıq qeydiyyatdadır.' as const };

  const user: MockAuthUser = {
    id: users.length + 1,
    email: normalizeEmail(input.email),
    name: input.name.trim(),
    password: input.password,
    phone: input.phone?.trim(),
    company: input.company?.trim(),
    emailVerified: false,
    role: 'member',
  };

  users.push(user);
  return { user };
}

export function updateMockPassword(userId: number, password: string) {
  const user = findMockUserById(userId);
  if (!user) return false;
  user.password = password;
  return true;
}

export function updateMockProfile(userId: number, data: Partial<Pick<MockAuthUser, 'name' | 'phone'>>) {
  const user = findMockUserById(userId);
  if (!user) return false;
  if (data.name !== undefined) user.name = data.name;
  if (data.phone !== undefined) user.phone = data.phone;
  return true;
}

export function createPasswordResetToken(userId: number, token: string, hours: number = 1) {
  passwordResetTokens.push({
    token,
    userId,
    expiresAt: Date.now() + hours * 60 * 60 * 1000,
  });
}

export function consumePasswordResetToken(token: string) {
  const record = passwordResetTokens.find((item) => item.token === token && !item.usedAt);
  if (!record) return { ok: false as const, error: 'Link etibarsızdır.' };
  if (record.expiresAt < Date.now()) return { ok: false as const, error: 'Müddəti bitib.' };
  record.usedAt = Date.now();
  return { ok: true as const, userId: record.userId };
}

export function createEmailVerificationToken(userId: number, token: string, hours: number = 24) {
  emailVerificationTokens.push({
    token,
    userId,
    expiresAt: Date.now() + hours * 60 * 60 * 1000,
  });
}

export function consumeEmailVerificationToken(token: string) {
  const record = emailVerificationTokens.find((item) => item.token === token && !item.usedAt);
  if (!record) return { ok: false as const, error: 'Link etibarsızdır.' };
  if (record.expiresAt < Date.now()) return { ok: false as const, error: 'Linkin müddəti bitib.' };
  record.usedAt = Date.now();
  const user = findMockUserById(record.userId);
  if (user) user.emailVerified = true;
  return { ok: true as const, user };
}

export function createLoginLog(userId: number, partial?: Partial<MockLoginLog>) {
  loginLogs.unshift({
    id: loginLogs.length + 1,
    userId,
    ipAddress: partial?.ipAddress ?? '127.0.0.1',
    userAgent: partial?.userAgent ?? 'Chrome / Windows',
    city: partial?.city ?? 'Bakı',
    country: partial?.country ?? 'AZ',
    success: partial?.success ?? true,
    createdAt: partial?.createdAt ?? new Date().toISOString(),
  });
}

export function getLoginLogsForUser(userId: number) {
  return loginLogs.filter((item) => item.userId === userId).slice(0, 10);
}
