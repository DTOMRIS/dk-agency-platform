import { NextRequest, NextResponse } from 'next/server';
import { requireApiAdmin } from '@/lib/api/guards';
import {
  getAuditById,
  updateAudit,
  deleteAudit,
  addAuditAction,
} from '@/lib/repositories/auditRepository';

type Params = { params: Promise<{ id: string }> };

// GET /api/audit/[id]
// TASK-0439: bu route-un heç bir handler-ində auth yoxlaması yox idi —
// middleware də /api/* yolunu tutmur (matcher yalnız locale prefiksi üçündür),
// yəni DELETE daxil hər əməliyyat internetdən açıq idi. Yalnız dashboard
// səhifələri çağırdığı üçün hamısı admin tələb edir.
export async function GET(_request: NextRequest, { params }: Params) {
  const guard = await requireApiAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;
    const audit = await getAuditById(Number(id));
    if (!audit) {
      return NextResponse.json({ error: 'Audit tapılmadı.' }, { status: 404 });
    }
    return NextResponse.json({ data: audit });
  } catch (error) {
    return NextResponse.json(
      { error: 'Audit yüklənə bilmədi.', details: String(error) },
      { status: 500 },
    );
  }
}

// PATCH /api/audit/[id] — status, notes update
export async function PATCH(request: NextRequest, { params }: Params) {
  const guard = await requireApiAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      status?: 'draft' | 'sent' | 'meeting' | 'converted' | 'rejected';
      notes?: string;
      name?: string;
      address?: string;
      phone?: string;
    };

    const updated = await updateAudit(Number(id), body);

    // Log status dəyişikliyi
    if (body.status) {
      await addAuditAction(Number(id), body.status, `Status dəyişdi: ${body.status}`);
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: 'Yeniləmə xətası.', details: String(error) },
      { status: 500 },
    );
  }
}

// DELETE /api/audit/[id]
export async function DELETE(_request: NextRequest, { params }: Params) {
  const guard = await requireApiAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;
    await deleteAudit(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Silmə xətası.', details: String(error) },
      { status: 500 },
    );
  }
}

// POST /api/audit/[id] — action log
export async function POST(request: NextRequest, { params }: Params) {
  const guard = await requireApiAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;
    const body = (await request.json()) as { actionType: string; notes?: string };

    if (!body.actionType) {
      return NextResponse.json({ error: 'actionType məcburidir.' }, { status: 400 });
    }

    const action = await addAuditAction(Number(id), body.actionType, body.notes);
    return NextResponse.json({ data: action });
  } catch (error) {
    return NextResponse.json(
      { error: 'Action log xətası.', details: String(error) },
      { status: 500 },
    );
  }
}
