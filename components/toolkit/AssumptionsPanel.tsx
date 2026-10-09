'use client';

/**
 * @file AssumptionsPanel.tsx
 * @purpose Box for the EXAMPLE numbers a tool calculates with (salaries, average check, budget rows).
 *          Owner 2026-10-09: such numbers must not look like facts — they are editable inputs with the
 *          old values as starting defaults, and a visible «nümunədir; arta və ya azala bilər» note.
 * @task TASK-0518
 */

import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import DecimalInput from '@/components/toolkit/DecimalInput';

interface AssumptionsPanelProps {
  title: string;
  note: string;
  /** Optional reset row (ToolResetControls) shown under the title. */
  controls?: ReactNode;
  children: ReactNode;
  testId?: string;
}

export default function AssumptionsPanel({ title, note, controls, children, testId }: AssumptionsPanelProps) {
  return (
    <section
      className="rounded-xl border border-amber-200 bg-amber-50/40 p-4"
      data-testid={testId}
      aria-label={title}
    >
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-slate-700" data-testid="assumptions-note">
        <Info size={14} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
        <span>{note}</span>
      </p>
      {controls ? <div className="mt-3">{controls}</div> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** One editable example number (₼ or %) inside the panel; negative values are not allowed. */
export function AssumptionField({
  id,
  label,
  help,
  value,
  max,
  onChange,
}: {
  id: string;
  label: string;
  help?: string;
  value: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[11px] font-semibold text-slate-700">
        {label}
      </label>
      <DecimalInput
        id={id}
        blankZero
        value={value}
        onValueChange={(v) => onChange(Math.max(0, max === undefined ? v : Math.min(max, v)))}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
      />
      {help ? <p className="mt-0.5 text-[10px] text-slate-600">{help}</p> : null}
    </div>
  );
}
