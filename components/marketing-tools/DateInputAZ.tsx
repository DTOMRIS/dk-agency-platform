import { ChangeEvent } from 'react';

interface DateInputAZProps {
  value: string;
  onChange: (iso: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export function DateInputAZ({ value, onChange, label, required, className }: DateInputAZProps) {
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
        <p className="text-sm text-blue-700 font-medium mt-1.5">
          📅 Seçilən tarix: <strong>{display}</strong>
        </p>
      ) : (
        <p className="text-xs text-gray-500 mt-1.5">
          Format: gün.ay.il (məs: 14.05.2026)
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