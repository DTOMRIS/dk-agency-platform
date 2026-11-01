/**
 * @file optimizedHosts.ts
 * @purpose Single source of truth for which remote image hosts go through the Next.js image
 *          optimizer. next.config.ts builds `images.remotePatterns` from this list, and components
 *          that render arbitrary URLs (RSS news covers) call `canOptimizeImage` to decide whether
 *          to pass `unoptimized`.
 * @task TASK-0552 — replaces the `hostname: '**'` pattern (TASK-0516), which let anyone use
 *       /_next/image as a free resize proxy for any https image on the internet.
 */

export const OPTIMIZED_REMOTE_HOSTS = [
  'res.cloudinary.com',
  'images.unsplash.com',
  'randomuser.me',
  'picsum.photos',
] as const;

/**
 * True for same-origin paths and https URLs on an allowlisted host. Everything else (RSS
 * publisher images, http URLs, data: URIs) must be rendered with `unoptimized` so the browser
 * loads it straight from its source and our optimizer is never involved.
 */
export function canOptimizeImage(src: string): boolean {
  if (src.startsWith('/') && !src.startsWith('//')) return true;
  try {
    const url = new URL(src);
    return (
      url.protocol === 'https:' &&
      (OPTIMIZED_REMOTE_HOSTS as readonly string[]).includes(url.hostname)
    );
  } catch {
    return false;
  }
}
