'use client';

/** TASK-0498 — Təchizatçı bazası üçün kiçik ortaq UI parçaları (OCAQ v2 üslubu). */

import { useState } from 'react';
import { Check, Copy, Phone } from 'lucide-react';

import type { Locale } from '@/i18n/config';
import { SUPPLY_CATEGORY_LABELS, formatPhone, isSupplyCategory } from '@/lib/supply/categories';
import type { SupplyCopy } from '@/lib/supply/copy';

export const CARD =
  'rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]';
export const FIELD =
  'h-10 rounded-full border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-900 outline-none transition focus:border-[#0A7AFF] focus:ring-2 focus:ring-[#0A7AFF]/20';
export const PILL_BTN =
  'inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export function categoryLabel(key: string, locale: Locale): string {
  return isSupplyCategory(key) ? SUPPLY_CATEGORY_LABELS[key][locale] : key;
}

export function CategoryBadges({ keys, locale }: { keys: string[]; locale: Locale }) {
  if (!keys.length) return <span className="text-[12px] text-slate-600">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {keys.map((key) => (
        <span
          key={key}
          className="inline-flex items-center rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[11px] font-semibold text-[#0A4FB8]"
        >
          {categoryLabel(key, locale)}
        </span>
      ))}
    </div>
  );
}

export function initials(name: string): string {
  const letters = name
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0]?.toUpperCase() ?? '');
  return letters.join('') || '#';
}

export function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2F2F7] text-[12px] font-bold text-slate-800"
    >
      {initials(name)}
    </span>
  );
}

export function PhoneList({ phones, copy }: { phones: string[]; copy: SupplyCopy }) {
  const [copied, setCopied] = useState<string | null>(null);
  if (!phones.length) return <span className="text-[12px] text-slate-600">—</span>;

  async function copyPhone(phone: string) {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(phone);
      window.setTimeout(() => setCopied((current) => (current === phone ? null : current)), 1500);
    } catch {
      /* clipboard bloklanıbsa sakit keç — tel: linki qalır */
    }
  }

  return (
    <ul className="space-y-1">
      {phones.map((phone) => (
        <li key={phone} className="flex items-center gap-1.5">
          <a
            href={`tel:${phone}`}
            aria-label={copy.callPhone(formatPhone(phone))}
            className="inline-flex items-center gap-1 whitespace-nowrap text-[13px] font-medium tabular-nums text-[#0A5BD6] hover:underline"
          >
            <Phone size={12} aria-hidden="true" />
            {formatPhone(phone)}
          </a>
          <button
            type="button"
            onClick={() => void copyPhone(phone)}
            aria-label={copied === phone ? copy.copied : copy.copyPhone(formatPhone(phone))}
            title={copied === phone ? copy.copied : copy.copyPhone(formatPhone(phone))}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            {copied === phone ? (
              <Check size={12} className="text-emerald-700" aria-hidden="true" />
            ) : (
              <Copy size={12} aria-hidden="true" />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** `!` — globals.css-dəki qatsız `select { background-color; color }` utility-ləri əzir. */
const STATUS_TONE: Record<string, string> = {
  yeni: 'bg-slate-100! text-slate-800!',
  elaqe_saxlanildi: 'bg-amber-50! text-amber-900!',
  razi: 'bg-emerald-50! text-emerald-800!',
  imtina: 'bg-rose-50! text-rose-800!',
  aciq: 'bg-[#EEF4FF]! text-[#0A4FB8]!',
  uygunlasdirildi: 'bg-emerald-50! text-emerald-800!',
  baglandi: 'bg-slate-100! text-slate-800!',
};

export function StatusSelect({
  value,
  options,
  label,
  disabled,
  onChange,
}: {
  value: string;
  options: Array<[string, string]>;
  label: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      aria-label={label}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={`h-8 max-w-[150px] cursor-pointer rounded-full border-0 px-3 pr-7 text-[12px] font-semibold outline-none ring-1 ring-inset ring-black/5 focus:ring-2 focus:ring-[#0A7AFF] disabled:opacity-60 ${
        STATUS_TONE[value] ?? 'bg-slate-100! text-slate-800!'
      }`}
    >
      {options.map(([key, text]) => (
        <option key={key} value={key} className="bg-white text-slate-900">
          {text}
        </option>
      ))}
    </select>
  );
}

export function ConsentSwitch({
  checked,
  label,
  onText,
  offText,
  disabled,
  onChange,
}: {
  checked: boolean;
  label: string;
  onText: string;
  offText: string;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-800 disabled:opacity-60"
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-emerald-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </span>
      <span className="whitespace-nowrap">{checked ? onText : offText}</span>
    </button>
  );
}

export function Pager({
  page,
  pages,
  copy,
  onPage,
}: {
  page: number;
  pages: number;
  copy: SupplyCopy;
  onPage: (page: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
      <span className="text-[13px] font-medium text-slate-700">{copy.pageInfo(page, pages)}</span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className={`${PILL_BTN} h-9 bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50`}
        >
          {copy.prev}
        </button>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className={`${PILL_BTN} h-9 bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50`}
        >
          {copy.next}
        </button>
      </div>
    </div>
  );
}

/** API xəta kodunu oxunaqlı mətnə çevirir. */
export function errorText(copy: SupplyCopy, code: string | undefined, status?: number): string {
  if (status === 401 || status === 403) return copy.errors.unauthorized;
  return (code && copy.errors[code]) || copy.errors.default;
}
