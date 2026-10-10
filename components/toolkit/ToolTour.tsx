'use client';

/**
 * @file ToolTour.tsx
 * @purpose TASK-0529: the «Bələdçi» button in every tool header + the first-visit Spotlight tour
 *          (components/toolkit/SpotlightTour). Same 4 steps for every tool — what it does, where to type,
 *          example / clear, where the result appears; steps whose element a tool lacks are skipped.
 *          Auto-opens once per tool; never under automation (navigator.webdriver) so e2e clicks are not blocked.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Compass } from 'lucide-react';
import SpotlightTour, { hasSeenTour, type TourStep } from '@/components/toolkit/SpotlightTour';

const FIRST_FIELD =
  '[data-testid="tool-inputs"] input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), [data-testid="tool-inputs"] select, main input[inputmode], main input[type="number"], main input[type="checkbox"]';

export default function ToolTour({ toolId }: { toolId: string }) {
  const t = useTranslations('innerV2.common.tour');
  const [open, setOpen] = useState(false);

  const steps = useMemo<TourStep[]>(
    () => [
      { target: '[data-testid="tool-intro"]', title: t('steps.intro.title'), body: t('steps.intro.body') },
      { target: FIRST_FIELD, title: t('steps.inputs.title'), body: t('steps.inputs.body') },
      { target: '[data-testid="tool-reset"]', title: t('steps.reset.title'), body: t('steps.reset.body') },
      { target: '[data-testid="tool-result-sheet"]', title: t('steps.result.title'), body: t('steps.result.body') },
    ],
    [t],
  );

  useEffect(() => {
    if (navigator.webdriver || hasSeenTour(toolId)) return;
    const timer = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(timer);
  }, [toolId]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="tour-start"
        className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#E4DCCD] bg-white px-3 text-[12px] font-bold text-slate-800 transition hover:border-[#D63B54] hover:text-[#BE2F47]"
      >
        <Compass size={14} aria-hidden="true" />
        {t('start')}
      </button>
      <SpotlightTour id={toolId} steps={steps} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
