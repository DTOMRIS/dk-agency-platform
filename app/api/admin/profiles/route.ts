import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { memberProfiles } from '@/lib/db/schema';
import { eq, desc, isNull, and, ilike, or } from 'drizzle-orm';
import { writeAuditLog } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const auth = await getAuthFromCookie();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (!db) {
    return NextResponse.json({ error: 'database-unavailable' }, { status: 503 });
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status') || 'submitted';
  const search = searchParams.get('search') || '';

  const conditions = [isNull(memberProfiles.deletedAt)];

  if (status !== 'all') {
    conditions.push(eq(memberProfiles.approvalStatus, status));
  }

  if (search) {
    conditions.push(
      or(
        ilike(memberProfiles.company, `%${search}%`),
        ilike(memberProfiles.email, `%${search}%`),
        ilike(memberProfiles.fullName, `%${search}%`),
      )!,
    );
  }

  const rows = await db
    .select()
    .from(memberProfiles)
    .where(and(...conditions))
    .orderBy(desc(memberProfiles.updatedAt))
    .limit(50);

  return NextResponse.json({ profiles: rows });
}
