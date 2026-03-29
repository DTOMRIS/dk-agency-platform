import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

function cloudinaryConfigured() {
  return (
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET)
  );
}

function signParams(params: Record<string, string>, apiSecret: string) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return createHash('sha1')
    .update(`${sorted}${apiSecret}`)
    .digest('hex');
}

export async function POST(request: Request) {
  if (!cloudinaryConfigured()) {
    return NextResponse.json(
      { error: 'Cloudinary konfiqurasiya olunmayıb.' },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const folder = String(formData.get('folder') || '');
  const listingId = String(formData.get('listingId') || 'draft');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Şəkil faylı tapılmadı.' }, { status: 400 });
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return NextResponse.json({ error: 'Yalnız JPG, PNG və WEBP formatı qəbul olunur.' }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Şəkil 10MB-dan böyük ola bilməz.' }, { status: 400 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const timestamp = `${Math.floor(Date.now() / 1000)}`;
  const uploadFolder = `dk-agency/listings/${listingId}${folder ? `/${folder}` : ''}`;
  const paramsToSign = {
    folder: uploadFolder,
    timestamp,
    transformation: 'f_auto,q_auto,w_1200,c_limit',
  };

  const signature = signParams(paramsToSign, apiSecret);
  const cloudinaryForm = new FormData();
  cloudinaryForm.set('file', file);
  cloudinaryForm.set('api_key', apiKey);
  cloudinaryForm.set('timestamp', timestamp);
  cloudinaryForm.set('folder', uploadFolder);
  cloudinaryForm.set('transformation', 'f_auto,q_auto,w_1200,c_limit');
  cloudinaryForm.set('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: cloudinaryForm,
  });

  const payload = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      {
        error: payload?.error?.message || 'Cloudinary yükləməsi zamanı xəta baş verdi.',
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    url: payload.secure_url,
    publicId: payload.public_id,
    width: payload.width,
    height: payload.height,
    format: payload.format,
    bytes: payload.bytes,
  });
}
