/**
 * @file DkMark.tsx
 * @purpose TASK-0524: one DK logo outside the protected Header — the same dark «DK» square as the v2
 *          header (components/layout/Header.tsx BrandMark), used in the B2B portal and on the login page.
 *          `spin` = coin-flip animation (owner 10.10: «logo dönsün»).
 */

import s from './DkMark.module.css';

const SIZE = {
  sm: 'h-8 w-8 text-[13px]',
  md: 'h-9 w-9 text-[14px]',
  lg: 'h-12 w-12 text-[18px] rounded-[13px]',
} as const;

export default function DkMark({
  size = 'md',
  spin = false,
  withName = false,
  subtitle,
}: {
  size?: keyof typeof SIZE;
  spin?: boolean;
  withName?: boolean;
  subtitle?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span aria-hidden="true" className={`${s.mark} ${SIZE[size]} ${spin ? s.spin : ''}`}>DK</span>
      {withName && (
        <span className="flex flex-col leading-tight">
          <span className="whitespace-nowrap text-[16px] font-extrabold tracking-[-0.02em] text-[#0F172A]">DK Agency</span>
          {subtitle && <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-500">{subtitle}</span>}
        </span>
      )}
    </span>
  );
}
