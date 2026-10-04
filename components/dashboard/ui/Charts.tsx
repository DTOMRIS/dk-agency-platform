/**
 * @file components/dashboard/ui/Charts.tsx
 * @purpose OCAQ v2 (TASK-0483): dependency-free SVG charts + card shell in a clean, light dashboard style.
 * Server-renderable (no hooks). Colors: bars/lines #0A84FF-like blue for neutral metrics, brand red for leads.
 */

import type { ReactNode } from 'react';

export type Point = { day: string; value: number };

const BLUE = '#0A7AFF';

function niceMax(max: number): number {
  if (max <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * pow * 4 >= max) ?? 10;
  return step * pow * 4;
}

function shortDay(day: string, locale: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  const months: Record<string, string[]> = {
    az: ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avq', 'sen', 'okt', 'noy', 'dek'],
    ru: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    tr: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  };
  return `${d.getUTCDate()} ${(months[locale] ?? months.az)[d.getUTCMonth()]}`;
}

/** Rounded white card with title, optional subtitle / range label and body. */
export function DashCard({
  title,
  subtitle,
  range,
  action,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  range?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex min-w-0 flex-col rounded-[22px] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] sm:p-6 ${className}`}
    >
      <header className="mb-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-[17px] font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 truncate text-[12px] text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[13px] text-slate-500">
          {range && <span>{range}</span>}
          {action}
        </div>
      </header>
      {children}
    </section>
  );
}

/** Big number + caption, Apple-dashboard style. */
export function BigNumber({
  value,
  caption,
  delta,
  deltaTone = 'neutral',
}: {
  value: string;
  caption: string;
  delta?: string;
  deltaTone?: 'up' | 'down' | 'neutral';
}) {
  const tone =
    deltaTone === 'up'
      ? 'text-emerald-700'
      : deltaTone === 'down'
        ? 'text-rose-700'
        : 'text-slate-500';
  return (
    <div className="mt-2">
      <div className="flex items-baseline gap-2">
        <span className="text-[38px] font-semibold leading-none tracking-tight text-slate-900 tabular-nums sm:text-[42px]">
          {value}
        </span>
        {delta && <span className={`text-[14px] font-medium ${tone}`}>{delta}</span>}
      </div>
      <p className="mt-1.5 text-[14px] text-slate-500">{caption}</p>
    </div>
  );
}

/** Vertical bars with light grid and right-hand scale. */
export function BarChart({
  data,
  locale,
  color = BLUE,
  height = 220,
  label,
}: {
  data: Point[];
  locale: string;
  color?: string;
  height?: number;
  label: string;
}) {
  const W = 600;
  const H = height;
  const padR = 36;
  const padB = 24;
  const max = niceMax(Math.max(1, ...data.map((p) => p.value)));
  const plotW = W - padR;
  const plotH = H - padB;
  const slot = plotW / Math.max(1, data.length);
  const barW = Math.max(2, slot * 0.58);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label={label}>
      {ticks.map((t) => {
        const y = plotH - t * plotH;
        return (
          <g key={t}>
            <line x1={0} x2={plotW} y1={y} y2={y} stroke="#E5E7EB" strokeWidth={1} />
            <text x={W - 2} y={y + 4} textAnchor="end" fontSize={11} fill="#6B7280">
              {Math.round(max * t)}
            </text>
          </g>
        );
      })}
      {data.map((p, i) => {
        const h = (p.value / max) * plotH;
        const x = i * slot + (slot - barW) / 2;
        return (
          <g key={p.day}>
            {i % labelEvery === 0 && (
              <line
                x1={x + barW / 2}
                x2={x + barW / 2}
                y1={0}
                y2={plotH}
                stroke="#F1F5F9"
                strokeDasharray="3 3"
              />
            )}
            <rect
              x={x}
              y={plotH - h}
              width={barW}
              height={Math.max(h, p.value > 0 ? 2 : 0)}
              rx={Math.min(3, barW / 2)}
              fill={color}
            >
              <title>{`${shortDay(p.day, locale)}: ${p.value}`}</title>
            </rect>
            {i % labelEvery === 0 && (
              <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="#6B7280">
                {shortDay(p.day, locale)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Line with soft area fill (for cumulative / trend metrics). */
export function AreaChart({
  data,
  locale,
  color = BLUE,
  height = 160,
  label,
  cumulative = false,
}: {
  data: Point[];
  locale: string;
  color?: string;
  height?: number;
  label: string;
  cumulative?: boolean;
}) {
  const values = cumulative
    ? data.reduce<number[]>((acc, p) => [...acc, (acc.at(-1) ?? 0) + p.value], [])
    : data.map((p) => p.value);
  const W = 300; // narrow cards: keep 11px labels legible
  const H = height;
  const padB = 22;
  const plotH = H - padB;
  const max = niceMax(Math.max(1, ...values));
  const step = W / Math.max(1, values.length - 1);
  const pts = values.map(
    (v, i) => `${(i * step).toFixed(1)},${(plotH - (v / max) * plotH).toFixed(1)}`
  );
  const id = `g${label.replace(/[^a-z0-9]/gi, '').slice(0, 12)}`;
  const labelEvery = Math.max(1, Math.ceil(data.length / 3));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" role="img" aria-label={label}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t) => (
        <line
          key={t}
          x1={0}
          x2={W}
          y1={plotH - t * plotH}
          y2={plotH - t * plotH}
          stroke="#E5E7EB"
        />
      ))}
      <polygon points={`0,${plotH} ${pts.join(' ')} ${W},${plotH}`} fill={`url(#${id})`} />
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((p, i) =>
        i % labelEvery === 0 ? (
          <text
            key={p.day}
            x={Math.min(W - 30, i * step)}
            y={H - 4}
            textAnchor={i === 0 ? 'start' : 'middle'}
            fontSize={11}
            fill="#6B7280"
          >
            {shortDay(p.day, locale)}
          </text>
        ) : null
      )}
    </svg>
  );
}

/** Ring chart for a small breakdown, with legend. */
export function RingChart({
  parts,
  label,
}: {
  parts: Array<{ label: string; value: number; color: string }>;
  label: string;
}) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  const R = 52;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 140 140" className="h-36 w-36 shrink-0" role="img" aria-label={label}>
        <circle cx={70} cy={70} r={R} fill="none" stroke="#EEF2F7" strokeWidth={16} />
        {total > 0 &&
          parts.map((p) => {
            const len = (p.value / total) * C;
            const el = (
              <circle
                key={p.label}
                cx={70}
                cy={70}
                r={R}
                fill="none"
                stroke={p.color}
                strokeWidth={16}
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 70 70)"
              />
            );
            offset += len;
            return el;
          })}
        <text x={70} y={76} textAnchor="middle" fontSize={22} fontWeight={600} fill="#0F172A">
          {total}
        </text>
      </svg>
      <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[14px]">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2 text-slate-700">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: p.color }}
            />
            <span>{p.label}</span>
            <span className="ml-auto pl-4 font-semibold tabular-nums text-slate-900">
              {p.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
