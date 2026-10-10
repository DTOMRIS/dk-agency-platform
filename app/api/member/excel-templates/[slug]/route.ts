import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { requireApiMember } from '@/lib/api/guards';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getExcelTemplate } from '@/lib/excel-templates/catalog';
import { EXCEL_TEMPLATE_FILES } from '@/lib/excel-templates/files.generated';
import { logEvent } from '@/lib/user/events';

/**
 * GET /api/member/excel-templates/[slug] — TASK-0532. Members only (free membership): the file comes from the
 * generated base64 module (never in public/, so there is no direct link around the check) and every download
 * is logged as a `template_download` event for the owner.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const guard = await requireApiMember();
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const template = getExcelTemplate(slug);
  if (!template) return NextResponse.json({ success: false, error: 'Şablon tapılmadı.' }, { status: 404 });

  const b64 = EXCEL_TEMPLATE_FILES[template.file];
  if (!b64) return NextResponse.json({ success: false, error: 'Fayl hazır deyil.' }, { status: 503 });
  const bytes = Buffer.from(b64, 'base64');

  if (db && guard.session.email) {
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, guard.session.email.trim().toLowerCase()))
      .then((rows) => rows[0])
      .catch(() => undefined);
    if (user) await logEvent(user.id, 'template_download', { slug });
  }

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${template.file}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
