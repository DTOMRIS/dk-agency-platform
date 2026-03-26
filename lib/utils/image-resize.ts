/**
 * Client-side image resize + compress.
 * Canvas-based, no server needed. Outputs WebP (fallback JPEG).
 */

interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg';
}

const DEFAULTS: Required<ResizeOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  format: 'image/webp',
};

export async function resizeImage(
  file: File,
  options?: ResizeOptions,
): Promise<{ blob: Blob; width: number; height: number; url: string }> {
  const opts = { ...DEFAULTS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const sourceUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(sourceUrl);
    };

    img.onload = () => {
      let { width, height } = img;

      if (width > opts.maxWidth || height > opts.maxHeight) {
        const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        cleanup();
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            cleanup();
            reject(new Error('Failed to create blob'));
            return;
          }

          const url = URL.createObjectURL(blob);
          cleanup();
          resolve({ blob, width, height, url });
        },
        opts.format,
        opts.quality,
      );
    };

    img.onerror = () => {
      cleanup();
      reject(new Error('Failed to load image'));
    };

    img.src = sourceUrl;
  });
}

export function validateFile(
  file: File,
  opts?: { maxSizeMB?: number; allowVideo?: boolean },
): { valid: boolean; error?: string } {
  const maxSize = (opts?.maxSizeMB ?? 10) * 1024 * 1024;
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  const allowed = opts?.allowVideo ? [...imageTypes, ...videoTypes] : imageTypes;

  if (!allowed.includes(file.type)) {
    return {
      valid: false,
      error: `Dəstəklənməyən format: ${file.type.split('/')[1] || 'naməlum'}`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Fayl ${(opts?.maxSizeMB ?? 10)}MB-dan böyükdür`,
    };
  }

  return { valid: true };
}

export function isVideo(file: File): boolean {
  return file.type.startsWith('video/');
}
