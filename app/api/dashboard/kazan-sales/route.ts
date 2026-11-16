import { NextRequest, NextResponse } from 'next/server';
import { requireApiAdmin } from '@/lib/api/guards';
import { salesInput } from '@/lib/sales/followup';
import { saveSalesFollowup } from '@/lib/sales/repository';

export async function PATCH(request: NextRequest) {
  const auth = await requireApiAdmin();
  if (!auth.ok) return auth.response;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_body' }, { status: 400 }); }
  const parsed = salesInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_fields', fields: [...new Set(parsed.error.issues.map(i => String(i.path[0])))] }, { status: 400 });
  try {
    const saved = await saveSalesFollowup(parsed.data);
    if (!saved) return NextResponse.json({ error: 'conflict_or_missing' }, { status: 409 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 }); }
}

export async function GET(request: NextRequest) {
  const auth = await requireApiAdmin();
  if (!auth.ok) return auth.response;
  const { dbAvailable } = await import('@/lib/db');
  if (!dbAvailable) return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 });
  try {
    const { getSalesBoardData } = await import('@/lib/sales/repository');
    const { bakuDay } = await import('@/lib/sales/followup');
    const p = request.nextUrl.searchParams;
    const result = await getSalesBoardData({ stage: p.get('stage') || 'all', intent: p.get('intent') || 'all', businessType: p.get('businessType') || 'all', queue: p.get('queue') || 'all', search: (p.get('search') || '').slice(0, 100), page: Math.min(100000, Math.max(0, Number.parseInt(p.get('page') || '0') || 0)), today: bakuDay() });
    return NextResponse.json({ success: true, ...result }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch { return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 }); }
}
