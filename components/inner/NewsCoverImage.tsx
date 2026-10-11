/**
 * @file NewsCoverImage.tsx
 * @purpose External news image through next/image (resized + AVIF/WebP by the optimizer instead
 *          of the full-size RSS original). If the image fails to load, the generated category
 *          cover passed as `fallback` is shown instead.
 * @task TASK-0516 (next.config allows any https host, owner-approved 2026-10-09)
 */

'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';

/** Only https and same-origin paths go through the optimizer (remotePatterns is https-only). */
function canOptimize(src: string): boolean {
  return src.startsWith('https://') || (src.startsWith('/') && !src.startsWith('//'));
}

export default function NewsCoverImage({
  src,
  alt,
  sizes,
  priority,
  className,
  fallback,
  objectPosition,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority: boolean;
  className: string;
  fallback: ReactNode;
  /** TASK-0539: category covers keep their left edge (the category name) when the box crops them. */
  objectPosition?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    <div className={className}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={!canOptimize(src)}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  );
}
