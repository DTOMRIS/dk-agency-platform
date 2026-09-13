import { NextRequest, NextResponse } from 'next/server';
import { requireApiAdmin } from '@/lib/api/guards';
import { dbAvailable } from '@/lib/db';
import { DEFAULT_INVOICE_CATEGORIES } from '@/lib/data/invoice-category-seeds';

// TASK-0439: bu route-un heç bir handler-ində auth yoxlaması yox idi —
// middleware də /api/* yolunu tutmur (matcher yalnız locale prefiksi üçündür),
// yəni DELETE daxil hər əməliyyat internetdən açıq idi. Yalnız dashboard
// səhifələri çağırdığı üçün hamısı admin tələb edir.
export async function GET() {
  const guard = await requireApiAdmin();
  if (!guard.ok) return guard.response;

  try {
    if (!dbAvailable) {
      // DB yoxdursa seed data-dan göstər
      const mock = DEFAULT_INVOICE_CATEGORIES.map((c, i) => ({ id: i + 1, ...c, isActive: true, createdAt: null, updatedAt: null }));
      return NextResponse.json({ data: mock });
    }

    const repo = await import('@/lib/repositories/invoiceRepository');
    const categories = await repo.getCategories();
    return NextResponse.json({ data: categories });
  } catch (err) {
    console.error('[API /invoice-categories GET]', err);
    return NextResponse.json({ data: [], error: String(err) });
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireApiAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json()) as { name: string; slug: string; color?: string; icon?: string; sortOrder?: number };

    if (!body.name || !body.slug) {
      return NextResponse.json({ error: 'name və slug tələb olunur' }, { status: 400 });
    }

    if (!dbAvailable) {
      return NextResponse.json({ data: { id: Date.now(), ...body } }, { status: 201 });
    }

    const repo = await import('@/lib/repositories/invoiceRepository');
    const category = await repo.createCategory(body);
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (err) {
    console.error('[API /invoice-categories POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireApiAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json()) as { id: number; name?: string; slug?: string; color?: string; icon?: string; sortOrder?: number; isActive?: boolean };

    if (!body.id) {
      return NextResponse.json({ error: 'id tələb olunur' }, { status: 400 });
    }

    if (!dbAvailable) {
      return NextResponse.json({ data: body });
    }

    const repo = await import('@/lib/repositories/invoiceRepository');
    const { id, ...data } = body;
    const category = await repo.updateCategory(id, data);
    return NextResponse.json({ data: category });
  } catch (err) {
    console.error('[API /invoice-categories PATCH]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const guard = await requireApiAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json()) as { ids: number[] };
    if (!body.ids || body.ids.length === 0) {
      return NextResponse.json({ error: 'ids tələb olunur' }, { status: 400 });
    }

    if (!dbAvailable) {
      return NextResponse.json({ success: true });
    }

    const repo = await import('@/lib/repositories/invoiceRepository');
    if (body.ids.length === 1) {
      await repo.deleteCategory(body.ids[0]);
    } else {
      await repo.bulkDeleteCategories(body.ids);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API /invoice-categories DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
