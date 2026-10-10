/**
 * @file DkMark.tsx
 * @purpose TASK-0524/0529: the one DK logo — the real brand file public/images/logo-mobil.png (red circle
 *          «DK», also in the footer). Owner 10.10: «logomuz yine yok?» — the text square «DK» was not the logo.
 *          `spin` = coin-flip animation (owner 10.10: «logo dönsün»).
 */

import s from './DkMark.module.css';

const SIZE = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
} as const;

export default function DkMark({
  size = 'md',
  spin = false,
  withName = false,
  subtitle,
}: {
  size?: keyof typeof SIZE;
  /** true = flip on load + hover + every 8 s (login); 'hover' = only on hover (header, panels) */
  spin?: boolean | 'hover';
  withName?: boolean;
  subtitle?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element -- 9 KB static brand file, same as the footer */}
      <img src="/images/logo-mobil.png" alt="" aria-hidden="true" width={48} height={48} className={`${s.mark} ${SIZE[size]} ${spin === 'hover' ? s.spinHover : spin ? s.spin : ''}`} />
      {withName && (
        <span className="flex flex-col leading-tight">
          <span className={`whitespace-nowrap font-extrabold tracking-[-0.02em] text-[#0F172A] ${size === 'sm' ? 'text-[15.5px]' : 'text-[15.5px] sm:text-[17px]'}`}>DK Agency</span>
          {subtitle && <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-500">{subtitle}</span>}
        </span>
      )}
    </span>
  );
}
