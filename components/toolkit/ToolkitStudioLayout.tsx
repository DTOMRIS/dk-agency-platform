'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronLeft } from 'lucide-react';

// ── Types ─────────���─────────────────────────────────────────────────

export type ToolTier = 'sagird' | 'kalfa' | 'usta';

interface ToolkitStudioLayoutProps {
  /** Tool identifier for tier badge + description lookup */
  toolId: string;
  /** Display name (from i18n, not hardcoded) */
  toolName: string;
  /** Short description line */
  toolDescription?: string;
  /** Tier badge */
  tier: ToolTier;
  /** Left column — form/inputs */
  inputSection: ReactNode;
  /** Right column — results/KPIs (sticky on desktop) */
  resultSection: ReactNode;
  /** Optional bottom section (education, blog links, CTA) */
  bottomSection?: ReactNode;
  /** Show pulsing "CANLI" badge (default: true) */
  showLiveBadge?: boolean;
}

// ── Sub-components ─────────���────────────────────────────────────────

function TierBadge({ tier }: { tier: ToolTier }) {
  const t = useTranslations('toolkit');

  const styles: Record<ToolTier, { bg: string; text: string; ring: string }> = {
    sagird: { bg: 'bg-blue-500/10', text: 'text-blue-400', ring: 'ring-blue-500/20' },
    kalfa: { bg: 'bg-[var(--dk-gold)]/10', text: 'text-[var(--dk-gold)]', ring: 'ring-[var(--dk-gold)]/20' },
    usta: { bg: 'bg-[var(--dk-purple)]/10', text: 'text-[var(--dk-purple)]', ring: 'ring-[var(--dk-purple)]/20' },
  };

  const labels: Record<ToolTier, string> = {
    sagird: t('tierBadge.sagird'),
    kalfa: t('tierBadge.kalfa'),
    usta: t('tierBadge.usta'),
  };

  const s = styles[tier];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${s.bg} ${s.text} ${s.ring}`}>
      {labels[tier]}
    </span>
  );
}

function LiveBadge() {
  const t = useTranslations('toolkit');

  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--dk-success)]">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--dk-success)] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--dk-success)]" />
      </span>
      {t('live')}
    </div>
  );
}

function AIInsightSlot() {
  const t = useTranslations('toolkit');

  return (
    <div className="border-t border-slate-200 pt-4 mt-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--dk-gold)] mb-2">
        {t('aiInsight')}
      </div>
      <p className="text-xs leading-relaxed text-slate-400">
        {t('aiInsightPending')}
      </p>
      {/* TASK-A02c: replace with real DeepSeek call via lib/ai-models.ts */}
    </div>
  );
}

// ── Main Layout ─────────���───────────────────────────────────────────

export default function ToolkitStudioLayout({
  toolName,
  toolDescription,
  tier,
  inputSection,
  resultSection,
  bottomSection,
  showLiveBadge = true,
}: ToolkitStudioLayoutProps) {
  const t = useTranslations('toolkit');

  return (
    <div className="bg-[var(--dk-paper)] min-h-screen pb-16">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[var(--dk-navy)] to-slate-950">
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[var(--dk-gold)]/8 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pt-6 pb-16">
          <Link
            href="/toolkit"
            className="group mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            <span>{t('backToToolkit')}</span>
          </Link>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <TierBadge tier={tier} />
              </div>
              <h1 className="text-3xl font-display font-black leading-tight tracking-tight text-white sm:text-4xl">
                {toolName}
              </h1>
              {toolDescription && (
                <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-400">
                  {toolDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column grid ────────────────────────────────── */}
      <div className="relative z-10 mx-auto -mt-8 max-w-7xl px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left — Input section */}
          <div className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200/80">
            {inputSection}
          </div>

          {/* Right — Result section (sticky) */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200/80">
              {showLiveBadge && (
                <div className="mb-4">
                  <LiveBadge />
                </div>
              )}
              {resultSection}
              <AIInsightSlot />
            </div>
          </aside>
        </div>
      </div>

      {/* ── Bottom section (education, CTA, blog) ──────────── */}
      {bottomSection && (
        <div className="mx-auto mt-12 max-w-7xl px-6">
          {bottomSection}
        </div>
      )}
    </div>
  );
}

export { TierBadge, LiveBadge, AIInsightSlot };
