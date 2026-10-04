/**
 * @file FounderAvatar.tsx
 * @purpose Founder (Doğan Tomris) photo avatar — replaces "DT" initials placeholders
 * @task TASK-0419
 */

import Image from 'next/image';

export const FOUNDER_NAME = 'Doğan Tomris';
export const FOUNDER_AVATAR_SRC = '/images/founder/dogan-tomris-avatar.jpg';
export const FOUNDER_PORTRAIT_SRC = '/images/founder/dogan-tomris-portrait.jpg';

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
