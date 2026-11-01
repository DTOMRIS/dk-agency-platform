/**
 * @file NewsCoverImage.tsx
 * @purpose News cover image. Allowlisted hosts and same-origin paths go through the optimizer;
 *          RSS publisher images render `unoptimized` (loaded straight from the source). If the
 *          image fails to load, the generated category cover passed as `fallback` is shown.
 * @task TASK-0516, TASK-0552 (optimizer allowlist instead of `hostname: '**'`)
 */

'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { canOptimizeImage } from '@/lib/images/optimizedHosts';

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
        unoptimized={!canOptimizeImage(src)}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  );
}
