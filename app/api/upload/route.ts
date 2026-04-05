import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerMemberSession } from '@/lib/members/server-session';
import { canAccessNewsAdmin } from '@/lib/news/admin-access';

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
        transformation: [{ width: 1400, crop: 'limit', quality: 'auto', fetch_format: 'webp' }],
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Sekil yuklenmedi.'));
          return;
        }
        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerMemberSession();
  const purpose = request.nextUrl.searchParams.get('purpose');
  const newsAdminAccess = purpose === 'news-admin' ? await canAccessNewsAdmin(request) : null;
  const canUpload = session.loggedIn || Boolean(newsAdminAccess?.allowed);

  if (!canUpload) {
    return NextResponse.json({ success: false, error: 'Giris teleb olunur.' }, { status: 401 });
  }

  if (!hasCloudinaryConfig()) {
    return NextResponse.json(
      { success: false, error: 'Cloudinary konfigurasiya olunmayib.' },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const listingId = String(formData.get('listingId') || 'temp');
  const folder = String(formData.get('folder') || `dk-agency/listings/${listingId || 'temp'}`);

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: 'Sekil fayli tapilmadi.' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: 'Yalniz sekil fayli yukleye bilersiniz.' },
      { status: 400 },
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await uploadToCloudinary(Buffer.from(arrayBuffer), folder);

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
        error: error instanceof Error ? error.message : 'Sekil yuklenmesi zamani xeta bas verdi.',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerMemberSession();
  if (!session.loggedIn) {
    return NextResponse.json({ success: false, error: 'Giris teleb olunur.' }, { status: 401 });
  }

  if (!hasCloudinaryConfig()) {
    return NextResponse.json(
      { success: false, error: 'Cloudinary konfigurasiya olunmayib.' },
      { status: 503 },
    );
  }

  const publicId = request.nextUrl.searchParams.get('publicId');

  if (!publicId) {
    return NextResponse.json({ success: false, error: 'publicId teleb olunur.' }, { status: 400 });
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sekil silinmedi.',
      },
      { status: 500 },
    );
  }
}
