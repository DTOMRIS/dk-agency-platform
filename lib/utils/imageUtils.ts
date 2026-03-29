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

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Şəkil oxunmadı.'));
    };

    image.src = url;
  });
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
  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Şəkil işlənməsi üçün canvas əlçatan deyil.');
  }

  const ratio = Math.min(settings.maxWidth / image.width, settings.maxHeight / image.height, 1);
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

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
  const preview = URL.createObjectURL(compressedFile);
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
  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Thumbnail yaradıla bilmədi.');
  }

  const ratio = Math.min(size / image.width, size / image.height, 1);
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', 0.75);
}
