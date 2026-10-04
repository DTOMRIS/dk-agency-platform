/**
 * @file FounderAvatar.tsx
 * @purpose Founder (Doğan Tomris) photo avatar — replaces "DT" initials placeholders
 * @task TASK-0467
 */

import Image from 'next/image';

export const FOUNDER_NAME = 'Doğan Tomris';
export const FOUNDER_AVATAR_SRC = '/images/founder/dogan-tomris-avatar.jpg';
export const FOUNDER_PORTRAIT_SRC = '/images/founder/dogan-tomris-portrait.jpg';

/** True when an author string refers to the founder (handles "Dogan"/"Doğan" spellings). */
export function isFounderName(author: string | null | undefined): boolean {
  return /tomris/i.test(author ?? '');
}

/** Up to two initials for a non-founder author avatar fallback. */
export function authorInitials(author: string | null | undefined): string {
  return (author ?? '').trim().split(/\s+/).map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase();
}

interface FounderAvatarProps {
  /** Rendered diameter in px */
  size: number;
  className?: string;
  priority?: boolean;
}

export function FounderAvatar({ size, className = '', priority = false }: FounderAvatarProps) {
  return (
    <Image
      src={FOUNDER_AVATAR_SRC}
      alt={FOUNDER_NAME}
      width={size}
      height={size}
      priority={priority}
      className={`shrink-0 rounded-full object-cover ${className}`}
    />
  );
}
