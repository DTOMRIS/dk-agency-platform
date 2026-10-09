'use client';

import { ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { CalendarDays } from 'lucide-react';

interface DateInputAZProps {
  value: string;
  onChange: (iso: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export function DateInputAZ({ value, onChange, label, required, className }: DateInputAZProps) {
  // TASK-0517: the hint and the «selected date» line were hardcoded Azerbaijani.
  const t = useTranslations('mqForms.dateInput');
  const display = formatDateAZ(value);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>
      {value ? (
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700">
          <CalendarDays size={14} aria-hidden="true" />
          {t('selected')} <strong>{display}</strong>
        </p>
      ) : (
        <p className="text-xs text-gray-500 mt-1.5">
          {t('formatHint')}
        </p>
      )}
    </div>
  );
}

function formatDateAZ(iso: string): string {
  if (!iso || !iso.match(/^\d{4}-\d{2}-\d{2}$/)) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}