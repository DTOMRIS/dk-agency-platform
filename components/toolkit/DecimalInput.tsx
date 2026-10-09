'use client';

/**
 * TASK-0515 — numeric input for Toolkit tools. `type="number"` with a controlled numeric state
 * broke on "12,5" (comma dropped, digits appended → 12540). This keeps the typed text as a draft,
 * parses it with the shared `parseDecimal` helper ("12,5" = "12.5" = 12.5) and reports the number
 * upward. Unreadable text is flagged with aria-invalid and does not overwrite the last good value.
 */

import { useState, type InputHTMLAttributes } from 'react';
import { useLocale } from 'next-intl';
import { formatDecimalInput, parseDecimal } from '@/lib/toolkit/parse-decimal';

type NativeProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'defaultValue'>;

export interface DecimalInputProps extends NativeProps {
  value: number;
  onValueChange: (value: number) => void;
  /** Show an empty field instead of «0» (the tools' previous `value || ''` behaviour). */
  blankZero?: boolean;
}

export default function DecimalInput({
  value,
  onValueChange,
  blankZero = false,
  onBlur,
  inputMode,
  pattern,
  ...rest
}: DecimalInputProps) {
  const locale = useLocale();
  const show = (n: number) => (blankZero && n === 0 ? '' : formatDecimalInput(n, locale));
  const [draft, setDraft] = useState(() => show(value));
  const [lastValue, setLastValue] = useState(value);

  // External change (reset, preset, clamp) → re-sync the text, unless the draft already means it.
  if (value !== lastValue) {
    setLastValue(value);
    const parsedDraft = parseDecimal(draft);
    if (parsedDraft !== value && !(draft.trim() === '' && value === 0)) setDraft(show(value));
  }

  const parsed = parseDecimal(draft);
  const invalid = draft.trim() !== '' && parsed === null;

  return (
    <input
      {...rest}
      type="text"
      inputMode={inputMode ?? 'decimal'}
      pattern={pattern ?? '-?[0-9 .,]*'}
      autoComplete="off"
      value={draft}
      aria-invalid={invalid || rest['aria-invalid'] ? true : undefined}
      onChange={(e) => {
        const text = e.target.value;
        setDraft(text);
        const n = text.trim() === '' ? 0 : parseDecimal(text);
        if (n !== null) {
          setLastValue(n);
          onValueChange(n);
        }
      }}
      onBlur={(e) => {
        if (parsed !== null) setDraft(show(parsed));
        onBlur?.(e);
      }}
    />
  );
}
