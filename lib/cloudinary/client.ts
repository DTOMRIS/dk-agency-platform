/**
 * @file lib/cloudinary/client.ts
 * @purpose Cloudinary SDK singleton — graceful degradation if env vars missing
 * @task TASK-0011
 */

import { v2 as cloudinary } from 'cloudinary';

export const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn(
    '[Cloudinary] CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET env vars missing — upload disabled.',
  );
}

export { cloudinary };
