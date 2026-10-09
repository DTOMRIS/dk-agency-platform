'use client';

/**
 * Shared tool page shell — v2 inner design (TASK-0514, owner-approved mockup 09.10.2026):
 * back button + breadcrumb, group eyebrow + live status, inputs panel on the left and a sticky
 * result column on desktop that becomes a bottom sheet on mobile/tablet (< 1024px).
 * The props contract is unchanged, so every tool's own logic stays as it was.
 */

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { normalizeLocale, withLocale } from '@/i18n/config';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Icon } from '@/components/home/v2/shared';
import { Crumbs, LiveStatus } from '@/components/inner/InnerParts';
import s from '@/components/inner/inner.module.css';
import { getToolMeta } from '@/lib/toolkit/tool-directory';
import ToolIntro from '@/components/toolkit/ToolIntro';

// ── Types ───────────────────────────────────────────────────────────

export type ToolTier = 'sagird' | 'kalfa' | 'usta';

export interface AIInsightState {
  status: 'idle' | 'loading' | 'success' | 'error';
  text?: string;
}

interface ToolkitStudioLayoutProps {
  toolId: string;
  toolName: string;
  toolDescription?: string;
  tier: ToolTier;
  inputSection: ReactNode;
  resultSection: ReactNode;
  bottomSection?: ReactNode;
  /** Kept for compatibility — the live status now sits in the page header for every tool. */
  showLiveBadge?: boolean;
  /** AI insight state — connected pages pass this, others get placeholder */
  aiInsight?: AIInsightState;
  /** Callback to request AI insight */
  onRequestInsight?: () => void;
  /** Short headline value shown on the collapsed mobile result sheet (e.g. «45,0%»). */
  resultSummary?: ReactNode;
  /** Optional card next to the title (e.g. the formula). */
  headerAside?: ReactNode;
}

// ── Sub-components ──────────────────────────────────────────────────

function TierBadge({ tier }: { tier: ToolTier }) {
  const t = useTranslations('toolkit');
  const styles: Record<ToolTier, { bg: string; text: string; ring: string }> = {
    sagird: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200' },
    kalfa: { bg: 'bg-amber-50', text: 'text-amber-800', ring: 'ring-amber-200' },
    usta: { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200' },
  };
  const labels: Record<ToolTier, string> = {
    sagird: t('tierBadge.sagird'),
    kalfa: t('tierBadge.kalfa'),
    usta: t('tierBadge.usta'),
  };
  const st = styles[tier];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${st.bg} ${st.text} ${st.ring}`}
    >
      {labels[tier]}
    </span>
  );
}

function LiveBadge() {
  const t = useTranslations('toolkit');
  return <LiveStatus label={t('live')} />;
}

function AIInsightPanel({ insight, onRequest }: { insight?: AIInsightState; onRequest?: () => void }) {
  const t = useTranslations('toolkit');

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles size={12} className="text-amber-700" />
        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
          {t('aiInsight')}
        </div>
      </div>

      {!insight || insight.status === 'idle' ? (
        <div>
          <p className="mb-3 text-xs leading-relaxed text-slate-600">{t('aiInsightPending')}</p>
          {onRequest && (
            <button
              type="button"
              onClick={onRequest}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 ring-1 ring-amber-200 transition-colors hover:bg-amber-100"
            >
              <Sparkles size={12} />
              {t('aiInsightRequest')}
            </button>
          )}
        </div>
      ) : insight.status === 'loading' ? (
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
          <p className="text-xs text-slate-600">{t('aiInsightLoading')}</p>
        </div>
      ) : insight.status === 'error' ? (
        <div>
          <p className="text-xs leading-relaxed text-slate-600">{t('aiInsightError')}</p>
          {onRequest && (
            <button
              type="button"
              onClick={onRequest}
              className="mt-2 text-xs font-bold text-amber-800 hover:underline"
            >
              {t('aiInsightRetry')}
            </button>
          )}
        </div>
      ) : (
        <p className="text-xs leading-relaxed text-slate-700">{insight.text}</p>
      )}
    </div>
  );
}

// ── Main Layout ─────────────────────────────────────────────────────

export default function ToolkitStudioLayout({
  toolId,
  toolName,
  toolDescription,
  inputSection,
  resultSection,
  bottomSection,
  aiInsight,
  onRequestInsight,
  resultSummary,
  headerAside,
}: ToolkitStudioLayoutProps) {
  const tc = useTranslations('innerV2.common');
  const locale = normalizeLocale(useLocale());
  const meta = getToolMeta(toolId);
  const groupLabel = meta ? tc(`groups.${meta.group}`) : null;
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  const trail = [tc('toolsCrumb'), groupLabel, toolName].filter(Boolean).join(' / ');
  const sheetId = `rs-${toolId}`;

  return (
    <div className={`${s.page} ${s.withSheet} ${inter.className}`}>
      <div className={home.wrap}>
        <Crumbs
          backHref={withLocale(locale, '/toolkit')}
          backLabel={tc('allTools')}
          trail={trail}
        />
        <div className={s.tpHead}>
          <div style={{ minWidth: 0 }}>
            <div className={s.tpHeadMeta}>
              {meta ? (
                <span className={home.eyebrow}>
                  <span className={home.dot} />
                  {tc(`groupEyebrow.${meta.group}`)}
                </span>
              ) : null}
              <LiveStatus label={tc('live')} />
            </div>
            <h1>{toolName}</h1>
            {toolDescription ? <p className={s.lead}>{toolDescription}</p> : null}
          </div>
          {headerAside ? <div className={s.tpAside}>{headerAside}</div> : null}
        </div>

        <ToolIntro slug={toolId} />

        <div className={s.tpGrid}>
          <div className={s.panelC} data-testid="tool-inputs">{inputSection}</div>
          <aside
            className={`${s.result} ${sheetOpen ? s.resultOpen : ''}`}
            aria-label={tc('result')}
          >
            <div className={s.rs}>
              <button
                type="button"
                className={s.sheetH}
                aria-expanded={sheetOpen}
                aria-controls={sheetId}
                onClick={() => setSheetOpen((open) => !open)}
              >
                <span className={s.shL}>
                  <small>{toolName}</small>
                  <b>{resultSummary ?? tc('result')}</b>
                </span>
                <span className={s.shR}>
                  <span>{sheetOpen ? tc('hideResult') : tc('showResult')}</span>
                  <Icon name="chevUp" />
                </span>
              </button>
              <div className={s.rsBody} id={sheetId}>
                {resultSection}
                <AIInsightPanel insight={aiInsight} onRequest={onRequestInsight} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {bottomSection ? (
        <div className={`${home.wrap} ${s.bottom}`}>{bottomSection}</div>
      ) : null}

      <div className={home.wrap}>
        <Link href={withLocale(locale, '/toolkit')} className={s.back}>
          <Icon name="left" />
          {tc('allTools')}
        </Link>
      </div>
    </div>
  );
}

export { TierBadge, LiveBadge, AIInsightPanel };
