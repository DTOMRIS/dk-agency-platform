import { NextRequest, NextResponse } from 'next/server';
import {
  createAudit,
  getAudits,
  getAuditStats,
  bulkDeleteAudits,
} from '@/lib/repositories/auditRepository';
import { generateFullAudit } from '@/lib/audit/full-audit';

// GET /api/audit?status=draft&category=restoran&q=metro&limit=20&offset=0&stats=1
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    if (searchParams.get('stats') === '1') {
      const stats = await getAuditStats();
      return NextResponse.json({ data: stats });
    }

    const filters = {
      status: searchParams.get('status') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      query: searchParams.get('q') ?? undefined,
      limit: Number(searchParams.get('limit') ?? '20'),
      offset: Number(searchParams.get('offset') ?? '0'),
    };

    const result = await getAudits(filters);
    return NextResponse.json({ data: result.rows, total: result.total });
  } catch (error) {
    return NextResponse.json(
      { error: 'Audit siyahısı yüklənə bilmədi.', details: String(error) },
      { status: 500 },
    );
  }
}

// POST /api/audit — yeni audit yarat + AI analiz
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name: string;
      address?: string;
      phone?: string;
      category?: 'kafe' | 'restoran' | 'fast-food' | 'fine-dining';
      photos?: string[];
      socialLinks?: { instagram?: string; facebook?: string };
      deliveryLinks?: { wolt?: string; bolt?: string };
      menuPhotoUrl?: string | null;
    };

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Restoran adı məcburidir.' }, { status: 400 });
    }

    // 1) AI audit generate
    const auditResult = await generateFullAudit({
      name: body.name,
      address: body.address,
      category: body.category ?? 'restoran',
      photos: body.photos ?? [],
      socialLinks: body.socialLinks,
      deliveryLinks: body.deliveryLinks,
      menuPhotoUrl: body.menuPhotoUrl,
    });

    // 2) DB-yə yaz
    const audit = await createAudit({
      name: body.name.trim(),
      address: body.address?.trim(),
      phone: body.phone?.trim(),
      category: body.category ?? 'restoran',
      photos: body.photos ?? [],
      socialLinks: body.socialLinks ?? {},
      deliveryLinks: body.deliveryLinks ?? {},
      menuPhotoUrl: body.menuPhotoUrl,
      aiAnalysis: {
        strengths: auditResult.strengths,
        weaknesses: auditResult.weaknesses,
        recommendations: auditResult.recommendations,
        estimatedRevenue: auditResult.estimatedRevenue,
        redFlags: auditResult.redFlags,
        whatsappTemplate: auditResult.whatsappTemplate,
        summary: auditResult.summary,
      },
      status: 'draft',
    });

    // Mock fallback (DB yoxdursa)
    const response = audit ?? {
      id: Date.now(),
      name: body.name,
      status: 'draft',
    };

    return NextResponse.json({
      data: response,
      aiAnalysis: {
        strengths: auditResult.strengths,
        weaknesses: auditResult.weaknesses,
        recommendations: auditResult.recommendations,
        estimatedRevenue: auditResult.estimatedRevenue,
        redFlags: auditResult.redFlags,
        whatsappTemplate: auditResult.whatsappTemplate,
        summary: auditResult.summary,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Audit yaradılma xətası.', details: String(error) },
      { status: 500 },
    );
  }
}

// DELETE /api/audit — bulk delete
export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as { ids: number[] };
    if (!body.ids?.length) {
      return NextResponse.json({ error: 'ID-lər göndərilmədi.' }, { status: 400 });
    }
    await bulkDeleteAudits(body.ids);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Silmə xətası.', details: String(error) },
      { status: 500 },
    );
  }
}
