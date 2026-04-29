import { NextRequest, NextResponse } from 'next/server';
import { dbAvailable } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;

    // DB yoxdursa boş cavab
    if (!dbAvailable) {
      if (sp.get('stats') === '1') {
        return NextResponse.json({ data: null });
      }
      return NextResponse.json({ data: [], total: 0 });
    }

    // Lazy import — yalnız DB varsa yüklə
    const repo = await import('@/lib/repositories/invoiceRepository');

    if (sp.get('stats') === '1') {
      const userId = sp.get('userId') ? Number(sp.get('userId')) : undefined;
      const stats = await repo.getInvoiceStats(userId);
      return NextResponse.json({ data: stats });
    }

    const filters = {
      userId: sp.get('userId') ? Number(sp.get('userId')) : undefined,
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
    console.error('[API /invoices GET]', err);
    return NextResponse.json({ data: [], total: 0, error: String(err) });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.supplierName || !body.invoiceDate || !body.source) {
      return NextResponse.json(
        { error: 'supplierName, invoiceDate və source tələb olunur' },
        { status: 400 },
      );
    }

    if (!dbAvailable) {
      // DB yoxdursa lokal mock cavab
      return NextResponse.json({ data: { id: Date.now(), ...body } }, { status: 201 });
    }

    const repo = await import('@/lib/repositories/invoiceRepository');
    const invoice = await repo.createInvoice(body);
    if (!invoice) {
      return NextResponse.json({ error: 'Fatura yaradıla bilmədi' }, { status: 500 });
    }

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (err) {
    console.error('[API /invoices POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as { ids: number[] };
    if (!body.ids || body.ids.length === 0) {
      return NextResponse.json({ error: 'ids tələb olunur' }, { status: 400 });
    }

    if (!dbAvailable) {
      return NextResponse.json({ success: true });
    }

    const repo = await import('@/lib/repositories/invoiceRepository');
    await repo.bulkDeleteInvoices(body.ids);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API /invoices DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
