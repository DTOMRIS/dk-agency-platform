/**
 * @file ToolPageShell.tsx
 * @purpose v2 frame for tools that render their own full UI (quizzes, ROI, WhatsApp templates):
 *          back button + breadcrumb, optional title header, cream page. Tools with an input/result
 *          split use ToolkitStudioLayout instead.
 * @task TASK-0514
 */

'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { normalizeLocale, withLocale } from '@/i18n/config';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Crumbs, LiveStatus } from '@/components/inner/InnerParts';
import s from '@/components/inner/inner.module.css';
import { getToolMeta } from '@/lib/toolkit/tool-directory';
import ToolIntro from '@/components/toolkit/ToolIntro';

export default function ToolPageShell({
  slug,
  children,
  showHeader = false,
  maxWidth = 1200,
}: {
  slug: string;
  children: ReactNode;
  /** Render the title/description header (for tools without their own h1). */
  showHeader?: boolean;
  maxWidth?: number;
}) {
  const tc = useTranslations('innerV2.common');
  const tt = useTranslations('innerV2.toolkit.tools');
  const locale = normalizeLocale(useLocale());
  const meta = getToolMeta(slug);
  const title = meta ? tt(`${meta.slug}.t`) : '';
  const trail = [tc('toolsCrumb'), meta ? tc(`groups.${meta.group}`) : null, title]
    .filter(Boolean)
    .join(' / ');

  return (
    <div className={`${s.page} ${inter.className}`}>
      <div className={home.wrap}>
        <Crumbs backHref={withLocale(locale, '/toolkit')} backLabel={tc('allTools')} trail={trail} />
        {showHeader && meta ? (
          <div className={s.tpHead}>
            <div style={{ minWidth: 0 }}>
              <div className={s.tpHeadMeta}>
                <span className={home.eyebrow}>
                  <span className={home.dot} />
                  {tc(`groupEyebrow.${meta.group}`)}
                </span>
                <LiveStatus label={tc('live')} />
              </div>
              <h1>{title}</h1>
              <p className={s.lead}>{tt(`${meta.slug}.d`)}</p>
            </div>
          </div>
        ) : null}
        <div style={{ maxWidth, margin: '0 auto', paddingTop: showHeader ? 0 : 24 }}>
          <ToolIntro slug={slug} />
          {children}
        </div>
      </div>
    </div>
  );
}
