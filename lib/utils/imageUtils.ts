interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  maxSizeKB: 500,
};

/**
 * TASK-0460: CSP (`img-src 'self' data: https:`) `blob:` URL-ə icazə vermir — əvvəl
 * `new Image()` + `URL.createObjectURL` ilə oxuma brauzerdə bloklanırdı və sıxışdırma
 * «Şəkil oxunmadı» ilə düşürdü. İndi `createImageBitmap` (URL-siz, daha sürətli dekod),
 * dəstəklənməsə `data:` URL (CSP icazəli) ilə `Image`.
 */
interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

function readAsDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Şəkil oxunmadı.'));
    reader.readAsDataURL(blob);
  });
}

async function decodeImage(file: Blob): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch {
      /* köhnə brauzer / format — aşağıdakı yol */
    }
  }

  const dataUrl = await readAsDataURL(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Şəkil oxunmadı.'));
    img.src = dataUrl;
  });
  return { source: image, width: image.naturalWidth, height: image.naturalHeight, release: () => {} };
}

function blobToFile(blob: Blob, original: File) {
  const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const fileName = original.name.replace(/\.[^.]+$/, '') || 'listing-image';

  return new File([blob], `${fileName}.${extension}`, {
    type: blob.type,
    lastModified: Date.now(),
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function compressImage(
  file: File,
  options?: CompressOptions,
): Promise<{
  file: File;
  preview: string;
  originalSize: number;
  compressedSize: number;
  reduction: string;
  sizeReduction: string;
}> {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const image = await decodeImage(file);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    image.release();
    throw new Error('Şəkil işlənməsi üçün canvas əlçatan deyil.');
  }

  const ratio = Math.min(settings.maxWidth / image.width, settings.maxHeight / image.height, 1);
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image.source, 0, 0, width, height);
  image.release();

  let quality = settings.quality;
  let blob: Blob | null = null;

  while (quality >= 0.3) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality);
    });

    if (!blob) {
      throw new Error('Şəkil sıxışdırıla bilmədi.');
    }

    if (blob.size <= settings.maxSizeKB * 1024 || quality <= 0.31) {
      break;
    }

    quality -= 0.1;
  }

  if (!blob) {
    throw new Error('Şəkil sıxışdırıla bilmədi.');
  }

  const compressedFile = blobToFile(blob, file);
  // data: URL — CSP `blob:`-ə icazə vermir (yuxarıya bax)
  const preview = await readAsDataURL(compressedFile);
  const originalSize = file.size;
  const compressedSize = compressedFile.size;
  const reductionPercent =
    originalSize > 0 ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100)) : 0;
  const reduction = `${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${reductionPercent}% azaldı)`;

  return {
    file: compressedFile,
    preview,
    originalSize,
    compressedSize,
    reduction,
    sizeReduction: reduction,
  };
}

export function validateImage(file: File): { valid: boolean; error?: string } {
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Şəkil 10MB-dan böyük ola bilməz' };
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { valid: false, error: 'Yalnız JPEG, PNG və WebP formatları qəbul olunur' };
  }

  return { valid: true };
}

export async function generateThumbnail(file: File, size: number = 200): Promise<string> {
  const image = await decodeImage(file);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    image.release();
    throw new Error('Thumbnail yaradıla bilmədi.');
  }

  const ratio = Math.min(size / image.width, size / image.height, 1);
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image.source, 0, 0, width, height);
  image.release();

  return canvas.toDataURL('image/jpeg', 0.75);
}
