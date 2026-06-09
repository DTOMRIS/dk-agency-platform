import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getServerMemberSession } from '@/lib/members/server-session';

// Resolve the authenticated user's DB id from their session email.
// Never trust a userId coming from the request — always derive it from the session.
async function resolveUserId(email: string): Promise<number | null> {
  if (!db) return null;
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  return row?.id ?? null;
}

const UNAUTHORIZED = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET(request: NextRequest) {
  try {
    const session = await getServerMemberSession();
    if (!session.loggedIn || !session.email) return UNAUTHORIZED;

    const sp = request.nextUrl.searchParams;

    if (!dbAvailable) {
      if (sp.get('stats') === '1') return NextResponse.json({ data: null });
      return NextResponse.json({ data: [], total: 0 });
    }

    const userId = await resolveUserId(session.email);
    if (!userId) return UNAUTHORIZED;

    const repo = await import('@/lib/repositories/invoiceRepository');

    if (sp.get('stats') === '1') {
      const stats = await repo.getInvoiceStats(userId);
      return NextResponse.json({ data: stats });
    }

    // userId is forced from the session — query-string userId is ignored.
    const filters = {
      userId,
      status: sp.get('status'),
      source: sp.get('source'),
      supplierName: sp.get('supplier'),
      dateFrom: sp.get('dateFrom'),
      dateTo: sp.get('dateTo'),
      query: sp.get('q'),
      limit: sp.get('limit') ? Number(sp.get('limit')) : 20,
      offset: sp.get('offset') ? Number(sp.get('offset')) : 0,
    };

    const result = await repo.getInvoices(filters);
    return NextResponse.json({ data: result.rows, total: result.total });
  } catch (err) {
    return NextResponse.json({ data: [], total: 0, error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerMemberSession();
    if (!session.loggedIn || !session.email) return UNAUTHORIZED;

    const body = await request.json();

    if (!body.supplierName || !body.invoiceDate || !body.source) {
      return NextResponse.json(
        { error: 'supplierName, invoiceDate və source tələb olunur' },
        { status: 400 }
      );
    }

    if (!dbAvailable) {
      return NextResponse.json({ data: { id: Date.now(), ...body } }, { status: 201 });
    }

    const userId = await resolveUserId(session.email);
    if (!userId) return UNAUTHORIZED;

    const repo = await import('@/lib/repositories/invoiceRepository');
    // Force ownership to the session user — ignore any userId in the body.
    const invoice = await repo.createInvoice({ ...body, userId });
    if (!invoice) {
      return NextResponse.json({ error: 'Fatura yaradıla bilmədi' }, { status: 500 });
    }

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerMemberSession();
    if (!session.loggedIn || !session.email) return UNAUTHORIZED;

    const body = (await request.json()) as { ids: number[] };
    if (!body.ids || body.ids.length === 0) {
      return NextResponse.json({ error: 'ids tələb olunur' }, { status: 400 });
    }

    if (!dbAvailable) {
      return NextResponse.json({ success: true });
    }

    const userId = await resolveUserId(session.email);
    if (!userId) return UNAUTHORIZED;

    const repo = await import('@/lib/repositories/invoiceRepository');
    // Ownership-scoped delete — only removes invoices owned by this user.
    await repo.bulkDeleteInvoices(body.ids, userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
