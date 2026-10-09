'use client';

/**
 * @file ToolIntro.tsx
 * @purpose «Bu alət nə edir?» (one sentence: which decision it helps) + «Necə işləyir» (3 steps
 *          with one realistic Baku example) for every free Toolkit tool. Texts live in
 *          messages → innerV2.toolkit.tools.<slug>.{what, how[3]}. Rendered by ToolkitStudioLayout
 *          and ToolPageShell, so every tool page shows it in the same place.
 * @task TASK-0517
 */

import { useTranslations } from 'next-intl';
import { getToolMeta } from '@/lib/toolkit/tool-directory';

export default function ToolIntro({ slug }: { slug: string }) {
  const t = useTranslations('innerV2.toolkit.tools');
  const tc = useTranslations('innerV2.common.intro');
  const meta = getToolMeta(slug);
  if (!meta) return null;
  const key = meta.slug;
  if (!t.has(`${key}.what`)) return null;
  const how = t.has(`${key}.how`) ? (t.raw(`${key}.how`) as unknown) : [];
  const steps = Array.isArray(how) ? how.filter((x): x is string => typeof x === 'string') : [];

  return (
    <section
      aria-label={tc('what')}
      data-testid="tool-intro"
      className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
    >
      <p className="text-sm leading-relaxed text-slate-800">
        <strong className="text-slate-900">{tc('what')}</strong> {t(`${key}.what`)}
      </p>
      {steps.length ? (
        <>
          <h2 className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-700">
            {tc('how')}
          </h2>
          <ol className="mt-2 grid gap-2 md:grid-cols-3">
            {steps.map((step, i) => (
              <li
                key={i}
                className="flex gap-2.5 rounded-xl bg-slate-50 p-3 text-[13px] leading-relaxed text-slate-800"
              >
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white"
                >
                  {i + 1}
                </span>
                <span className="min-w-0">{step}</span>
              </li>
            ))}
          </ol>
        </>
      ) : null}
    </section>
  );
}
