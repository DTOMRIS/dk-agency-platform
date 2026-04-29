/**
 * @file image-compress.ts
 * @purpose Client-side şəkil sıxılma — yükləmədən əvvəl MB azalt
 */

import imageCompression from 'browser-image-compression';

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
}

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 2048,
  useWebWorker: true,
  fileType: 'image/webp' as const,
  initialQuality: 0.7,
};

/**
 * Şəkli sıxır: 4-8MB → ~0.5-1MB
 * WebP-yə çevirir (dəstəklənirsə)
 * UI bloklanmır (Web Worker istifadə edir)
 */
export async function compressInvoiceImage(file: File): Promise<CompressionResult> {
  const originalSize = file.size;

  // Əgər artıq kiçikdirsə (1MB-dan az), sıxma
  if (originalSize <= 1 * 1024 * 1024) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      reductionPercent: 0,
    };
  }

  const compressed = await imageCompression(file, COMPRESSION_OPTIONS);

  return {
    file: compressed,
    originalSize,
    compressedSize: compressed.size,
    reductionPercent: Math.round((1 - compressed.size / originalSize) * 100),
  };
}
