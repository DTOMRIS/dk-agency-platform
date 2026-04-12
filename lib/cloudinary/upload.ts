/**
 * @file lib/cloudinary/upload.ts
 * @purpose Server-side Cloudinary upload helper with graceful fallback
 * @task TASK-0011
 */

import type { UploadApiResponse } from 'cloudinary';
import { cloudinary, isConfigured } from './client';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload a Buffer to Cloudinary.
 *
 * Returns null if Cloudinary is not configured (graceful degradation).
 * Throws on upload error.
 */
export async function uploadImage(
  buffer: Buffer,
  folder: string = 'dk-agency/listings',
): Promise<UploadResult | null> {
  if (!isConfigured) {
    console.warn('[Cloudinary] uploadImage called but Cloudinary is not configured — skipping.');
    return null;
  }

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          {
            width: 1200,
            crop: 'limit',
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error('Cloudinary upload failed: empty result'));
          return;
        }
        resolve(uploadResult);
      },
    );

    stream.end(buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

/**
 * Delete an image from Cloudinary by public_id.
 *
 * Returns false (no-op) if Cloudinary is not configured.
 * Throws on deletion error.
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  if (!isConfigured) {
    console.warn('[Cloudinary] deleteImage called but Cloudinary is not configured — skipping.');
    return false;
  }

  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  return true;
}
