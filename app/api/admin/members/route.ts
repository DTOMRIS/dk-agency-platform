import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { memberProfiles, memberSubscriptions } from '@/lib/db/schema';
import { eq, ilike, or, sql, desc } from 'drizzle-orm';

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

  return NextResponse.json({ members, total, page, totalPages, stats });
}
