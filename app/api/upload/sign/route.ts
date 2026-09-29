import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireApiAdmin } from '@/lib/api/guards';

/**
 * TASK-0460: brauzerdən birbaşa Cloudinary-yə yükləmə üçün imza.
 *
 * Əvvəl şəkil brauzer → Hostinger (`/api/upload`) → Cloudinary gedirdi və Cloudinary
 * yükləmə zamanı çevirməni (incoming transformation) sinxron edirdi — iki şəbəkə
 * keçidi + gözləmə. İndi server yalnız imza verir (fayl serverdən keçmir), çevirmə
 * göstərmə URL-indədir (`lib/uploads/directCloudinaryUpload.ts`).
 *
 * Yalnız admin; yalnız icazəli qovluqlar — imza başqa qovluğa yükləməyə yaramır.
 */
const ALLOWED_FOLDERS = ['dk-agency/blog', 'dk-agency/news'] as const;

export async function POST(request: NextRequest) {
  const guard = await requireApiAdmin();
  if (!guard.ok) return guard.response;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { ok: false, error: 'Cloudinary konfiqurasiya olunmayıb.' },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as { folder?: unknown };
  const folder = typeof body.folder === 'string' ? body.folder : '';
  if (!(ALLOWED_FOLDERS as readonly string[]).includes(folder)) {
    return NextResponse.json({ ok: false, error: 'Qovluğa icazə yoxdur.' }, { status: 400 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, apiSecret);

  return NextResponse.json({ ok: true, cloudName, apiKey, folder, timestamp, signature });
}
