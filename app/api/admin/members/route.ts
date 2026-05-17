import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { memberProfiles, memberSubscriptions, users, passwordResetTokens } from '@/lib/db/schema';
import { eq, ilike, or, sql, desc } from 'drizzle-orm';
import { sendEmail, emailTemplates } from '@/lib/email/templates';
import { getBaseUrl } from '@/lib/utils/get-base-url';

const PAGE_SIZE = 25;

export async function GET(request: NextRequest) {
  // 1. Auth — JWT pattern (L-002: auth.userId, auth.role)
  const auth = await getAuthFromCookie();
  if (!auth) {
    return NextResponse.json({ error: 'not-authenticated' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  if (!db) {
    return NextResponse.json({ error: 'database-unavailable' }, { status: 503 });
  }

  // 2. Query params
  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search') || '';
  const planFilter = searchParams.get('plan') || '';
  const statusFilter = searchParams.get('status') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  // 3. Build WHERE conditions
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(memberProfiles.email, `%${search}%`),
        ilike(memberProfiles.fullName, `%${search}%`),
      ),
    );
  }

  if (planFilter) {
    conditions.push(eq(memberSubscriptions.planCode, planFilter));
  }

  if (statusFilter) {
    conditions.push(eq(memberSubscriptions.status, statusFilter));
  }

  const whereClause = conditions.length > 0
    ? conditions.reduce((acc, cond) => (acc ? sql`${acc} AND ${cond}` : cond))
    : undefined;

  // 4. Query — memberProfiles LEFT JOIN memberSubscriptions
  // passwordHash NEVER selected (users table not joined)
  const offset = (page - 1) * PAGE_SIZE;

  const rows = await db
    .select({
      id: memberProfiles.id,
      email: memberProfiles.email,
      fullName: memberProfiles.fullName,
      company: memberProfiles.company,
      phone: memberProfiles.phone,
      role: memberProfiles.role,
      emailVerified: memberProfiles.emailVerified,
      createdAt: memberProfiles.createdAt,
      planCode: memberSubscriptions.planCode,
      subStatus: memberSubscriptions.status,
    })
    .from(memberProfiles)
    .leftJoin(memberSubscriptions, eq(memberProfiles.id, memberSubscriptions.profileId))
    .where(whereClause)
    .orderBy(desc(memberProfiles.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  // 5. Total count
  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(memberProfiles)
    .leftJoin(memberSubscriptions, eq(memberProfiles.id, memberSubscriptions.profileId))
    .where(whereClause);

  const total = countResult[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // 6. Stats (unfiltered)
  const statsResult = await db
    .select({
      total: sql<number>`count(*)::int`,
      verified: sql<number>`count(*) filter (where ${memberProfiles.emailVerified} = true)::int`,
      kalfa: sql<number>`count(*) filter (where ${memberSubscriptions.planCode} = 'KALFA')::int`,
      usta: sql<number>`count(*) filter (where ${memberSubscriptions.planCode} = 'USTA')::int`,
      sagird: sql<number>`count(*) filter (where ${memberSubscriptions.planCode} is null or ${memberSubscriptions.planCode} = 'SAGIRD')::int`,
    })
    .from(memberProfiles)
    .leftJoin(memberSubscriptions, eq(memberProfiles.id, memberSubscriptions.profileId));

  const stats = statsResult[0] ?? { total: 0, verified: 0, kalfa: 0, usta: 0, sagird: 0 };

  // 7. Map response
  const members = rows.map((r) => ({
    id: r.id,
    email: r.email,
    fullName: r.fullName,
    company: r.company,
    phone: r.phone,
    role: r.role,
    emailVerified: r.emailVerified,
    createdAt: r.createdAt,
    plan: r.planCode || null,
    subStatus: r.subStatus || null,
  }));

  return NextResponse.json({ members, total, page, totalPages, stats, currentUserId: auth.userId });
}

const VALID_ROLES = ['member', 'admin'] as const;

export async function POST(request: NextRequest) {
  // 1. Auth — admin only
  const auth = await getAuthFromCookie();
  if (!auth) {
    return NextResponse.json({ error: 'not-authenticated' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  if (!db) {
    return NextResponse.json({ error: 'database-unavailable' }, { status: 503 });
  }

  // 2. Parse + validate body
  let body: { name?: string; email?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid-body' }, { status: 400 });
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const role = body.role || 'member';

  if (!name || !email) {
    return NextResponse.json({ error: 'name-and-email-required' }, { status: 400 });
  }
  if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
    return NextResponse.json({ error: 'invalid-role' }, { status: 400 });
  }

  // 3. Check duplicate — both tables
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .then((rows) => rows[0]);

  const existingProfile = await db
    .select({ id: memberProfiles.id })
    .from(memberProfiles)
    .where(eq(memberProfiles.email, email))
    .then((rows) => rows[0]);

  if (existingUser || existingProfile) {
    return NextResponse.json({ error: 'email-exists' }, { status: 409 });
  }

  // 4. Insert into users (auth system — passwordHash=null, emailVerified=true)
  //    emailVerified=true: admin vouches for email, passwordHash=null blocks login until set
  const insertedUser = await db
    .insert(users)
    .values({
      email,
      name,
      passwordHash: null,
      role,
      emailVerified: true,
    })
    .returning({ id: users.id });

  const userId = insertedUser[0].id;

  // 5. Insert into memberProfiles (admin panel visibility)
  await db.insert(memberProfiles).values({
    email,
    fullName: name,
    role,
    emailVerified: true,
  });

  // 6. Create password-set token (24h — longer than forgot-password's 1h)
  const token = crypto.randomUUID();
  await db.insert(passwordResetTokens).values({
    userId,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  // 7. Send invite email
  const setPasswordUrl = `${getBaseUrl()}/reset-password?token=${token}`;
  try {
    await sendEmail(
      email,
      emailTemplates.adminInvite(setPasswordUrl, name, auth.email, 'az'),
    );
  } catch (emailErr) {
    // User created but email failed — don't rollback, admin can resend later
    console.error('[admin/members POST] Email send failed:', emailErr);
    return NextResponse.json(
      { success: true, userId, emailSent: false, warning: 'user-created-email-failed' },
      { status: 201 },
    );
  }

  return NextResponse.json({ success: true, userId, emailSent: true }, { status: 201 });
}
