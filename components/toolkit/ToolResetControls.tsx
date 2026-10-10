'use client';

/**
 * @file ToolResetControls.tsx
 * @purpose One reset UX for every free Toolkit tool (owner feedback 2026-10-09: «Sıfırla işləmir»).
 *          «Təmizlə» empties the inputs (checklists: unticks everything), «Nümunəni yüklə» loads the
 *          tool's example values. Every click shows a visible status line; after «Təmizlə» or
 *          «Nümunəni yüklə» a «Geri al» button restores the previous state for UNDO_MS.
 * @task TASK-0517
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eraser, RotateCcw, Sparkles } from 'lucide-react';

export const UNDO_MS = 8000;

type Status = 'cleared' | 'example' | 'undone' | null;

export interface ToolResetControlsProps<T> {
  /** Current state of the tool (taken right before clearing / loading the example). */
  snapshot: () => T;
  /** Put a saved state back (used by «Geri al»). */
  restore: (state: T) => void;
  /** Empty every input (or untick every checkbox). */
  onClear: () => void;
  /** Load the tool's example values. Omit for tools without an example (checklists). */
  onLoadExample?: () => void;
  /** Checklist wording: «Bütün işarələr götürüldü» instead of «Təmizləndi». */
  variant?: 'form' | 'checklist';
  className?: string;
}

export default function ToolResetControls<T>({
  snapshot,
  restore,
  onClear,
  onLoadExample,
  variant = 'form',
  className = '',
}: ToolResetControlsProps<T>) {
  const t = useTranslations('innerV2.common.reset');
  const saved = useRef<{ state: T } | null>(null);
  const [status, setStatus] = useState<Status>(null);
  // Bumped on every action so a second click restarts the timer.
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!status) return;
    const ms = status === 'undone' ? 3000 : UNDO_MS;
    const timer = window.setTimeout(() => {
      setStatus(null);
      saved.current = null;
    }, ms);
    return () => window.clearTimeout(timer);
  }, [status, tick]);

  const act = (next: Exclude<Status, null>, run: () => void) => {
    saved.current = { state: snapshot() };
    run();
    setStatus(next);
    setTick((n) => n + 1);
  };

  const undo = () => {
    if (!saved.current) return;
    restore(saved.current.state);
    saved.current = null;
    setStatus('undone');
    setTick((n) => n + 1);
  };

  const message =
    status === 'cleared'
      ? variant === 'checklist'
        ? t('clearedChecklist')
        : t('cleared')
      : status === 'example'
        ? t('exampleLoaded')
        : status === 'undone'
          ? t('undone')
          : '';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} data-testid="tool-reset">
      <button
        type="button"
        onClick={() => act('cleared', onClear)}
        data-testid="tool-clear"
        // TASK-0529 (owner 10.10 «təmizlə daha belirgin olmalı»): red-outlined pill, bigger than before.
        className="inline-flex min-h-[40px] items-center gap-2 rounded-full border-2 border-[#D63B54] bg-white px-4 text-[13px] font-bold text-[#BE2F47] transition-colors hover:bg-[#D63B54] hover:text-white"
      >
        <Eraser size={16} aria-hidden="true" />
        {t('clear')}
      </button>
      {onLoadExample ? (
        <button
          type="button"
          onClick={() => act('example', onLoadExample)}
          data-testid="tool-example"
          className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#E4DCCD] bg-white px-4 text-[13px] font-bold text-slate-800 transition-colors hover:border-[#0F172A] hover:bg-[#F6F1E9]"
        >
          <Sparkles size={16} aria-hidden="true" />
          {t('example')}
        </button>
      ) : null}
      <span role="status" aria-live="polite" className="inline-flex min-h-[36px] items-center gap-2 text-xs">
        {status ? (
          <>
            <span data-testid="tool-reset-status" className="font-semibold text-emerald-800">
              {message}
            </span>
            {status !== 'undone' ? (
              <button
                type="button"
                onClick={undo}
                data-testid="tool-undo"
                className="inline-flex min-h-[32px] items-center gap-1 rounded-lg px-2 font-bold text-slate-900 underline underline-offset-2 hover:bg-slate-100"
              >
                <RotateCcw size={13} aria-hidden="true" />
                {t('undo')}
              </button>
            ) : null}
          </>
        ) : null}
      </span>
    </div>
  );
}
