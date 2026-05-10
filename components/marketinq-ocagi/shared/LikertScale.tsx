'use client';

import { memo } from 'react';
import { Star } from 'lucide-react';

interface LikertScaleProps {
  questionId: string;
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const LikertScale = memo(function LikertScale({
  questionId,
  label,
  value,
  onChange,
  disabled,
}: LikertScaleProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <label
        id={questionId}
        className="flex-1 text-sm font-medium text-[var(--dk-navy)]"
      >
        <span className="mr-2 text-xs font-bold text-slate-400">{questionId}</span>
        {label}
      </label>
      <div className="flex gap-0.5" role="radiogroup" aria-labelledby={questionId}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} ulduz`}
            disabled={disabled}
            onClick={() => onChange(star)}
            className="rounded-md p-1.5 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Star
              size={20}
              className={
                value !== null && star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-300'
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
});
