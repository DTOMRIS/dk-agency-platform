import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerMemberSession } from '@/lib/members/server-session';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function uploadToCloudinary(buffer: Buffer, folder: string) {
  return new Promise<Record<string, any>>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'webp' }],
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Şəkil yüklənmədi.'));
          return;
        }
        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

export async function POST(request: Request) {
  const session = await getServerMemberSession();
  if (!session.loggedIn) {
    return NextResponse.json({ success: false, error: 'Giriş tələb olunur.' }, { status: 401 });
  }

  if (!hasCloudinaryConfig()) {
    return NextResponse.json(
      { success: false, error: 'Cloudinary konfiqurasiya olunmayıb.' },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const listingId = String(formData.get('listingId') || 'temp');

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: 'Şəkil faylı tapılmadı.' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: 'Yalnız şəkil faylı yükləyə bilərsiniz.' },
      { status: 400 },
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await uploadToCloudinary(
      Buffer.from(arrayBuffer),
      `dk-agency/listings/${listingId || 'temp'}`,
    );

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Şəkil yüklənməsi zamanı xəta baş verdi.',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerMemberSession();
  if (!session.loggedIn) {
    return NextResponse.json({ success: false, error: 'Giriş tələb olunur.' }, { status: 401 });
  }

  if (!hasCloudinaryConfig()) {
    return NextResponse.json(
      { success: false, error: 'Cloudinary konfiqurasiya olunmayıb.' },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const publicId = searchParams.get('publicId');

  if (!publicId) {
    return NextResponse.json({ success: false, error: 'publicId tələb olunur.' }, { status: 400 });
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Şəkil silinmədi.',
      },
      { status: 500 },
    );
  }
}
