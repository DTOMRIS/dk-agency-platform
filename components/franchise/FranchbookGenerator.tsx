'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import FranchiseQuiz, { type QuizConfig } from './FranchiseQuiz';
import LeadForm from './LeadForm';
import {
  FRANCHBOOK_OUTLINE,
  type FranchbookContent,
  type FranchbookSectionContent,
  type FranchbookSectionKey,
} from '@/lib/data/franchbookOutline';

type ApiState = 'idle' | 'generating' | 'generated' | 'locked' | 'error' | 'saving' | 'saved';
type ApiError = { message: string; field?: string } | null;

function orderedContent(content: FranchbookContent) {
  return FRANCHBOOK_OUTLINE.map((section) => ({
    ...section,
    content: content[section.key],
  }));
}

function toMarkdown(brand: string, sector: string, content: FranchbookContent, label: (key: string) => string) {
  const lines = [
    `# ${brand} - Franchise Manual Skeleton`,
    '',
    `Sector: ${sector}`,
    '',
    '> This is an AI-generated skeleton. Human review is required before use.',
    '',
  ];

  for (const section of orderedContent(content)) {
    lines.push(`## ${label(`sections.${section.key}`)}`);
    lines.push('');
    lines.push(`### ${label('result.purpose')}`);
    lines.push(section.content.purpose);
    lines.push('');
    lines.push(`### ${label('result.procedure')}`);
    section.content.procedure.forEach((item) => lines.push(`- ${item}`));
    lines.push('');
    lines.push(`### ${label('result.controls')}`);
    section.content.controls.forEach((item) => lines.push(`- ${item}`));
    lines.push('');
    lines.push(`### ${label('result.template')}`);
    lines.push(section.content.template);
    lines.push('');
  }

  return lines.join('\n');
}

function editSection(
  content: FranchbookContent,
  key: FranchbookSectionKey,
  next: Partial<FranchbookSectionContent>,
): FranchbookContent {
  return {
    ...content,
    [key]: {
      ...content[key],
      ...next,
    },
  };
}

export default function FranchbookGenerator() {
  const t = useTranslations('franchise.franchbook');
  const locale = useLocale();
  const [state, setState] = useState<ApiState>('idle');
  const [apiError, setApiError] = useState<ApiError>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [brand, setBrand] = useState('');
  const [sector, setSector] = useState('');
  const [content, setContent] = useState<FranchbookContent | null>(null);
  const [openKey, setOpenKey] = useState<FranchbookSectionKey>('communication');

  const config = useMemo<QuizConfig>(() => ({
    variant: 'wizard',
    namespace: 'franchise.franchbook',
    storageKey: 'dk-franchbook-generator',
    submitLabelKey: 'generate',
    steps: [
      { key: 'brand', fields: [{ name: 'brand', type: 'text', required: true, maxLength: 120 }, { name: 'sector', type: 'text', required: true, maxLength: 120 }] },
      { key: 'operations', fields: [{ name: 'operationDescription', type: 'textarea', required: true, maxLength: 1600 }] },
      { key: 'standards', fields: [{ name: 'standards', type: 'textarea', required: true, maxLength: 1600 }] },
      { key: 'staff', fields: [{ name: 'staff', type: 'textarea', required: true, maxLength: 1600 }] },
      { key: 'supply', fields: [{ name: 'supply', type: 'textarea', required: true, maxLength: 1600 }] },
      { key: 'opening', fields: [{ name: 'openingProcess', type: 'textarea', required: true, maxLength: 1600 }] },
    ],
    onComplete: async (values) => {
      setState('generating');
      setApiError(null);
      setBrand(values.brand || '');
      setSector(values.sector || '');
      const response = await fetch('/api/franchise/franchbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, locale }),
      });

      if (response.status === 401 || response.status === 403) {
        setState('locked');
        return;
      }

      if (!response.ok) {
        try {
          const errData = await response.json() as { error?: string; issues?: Array<{ path?: string[]; message?: string }> };
          if (errData.issues?.length) {
            const issue = errData.issues[0];
            const field = issue.path?.join('.') || '';
            setApiError({ message: issue.message || t('error'), field });
          } else {
            setApiError({ message: errData.error || t('error') });
          }
        } catch {
          setApiError({ message: t('error') });
        }
        setState('error');
        return;
      }

      const data = await response.json() as { projectId: number; content: FranchbookContent };
      setProjectId(data.projectId);
      setContent(data.content);
      setState('generated');
    },
  }), [locale]);

  async function saveEdits() {
    if (!content || !projectId) return;
    setState('saving');
    const response = await fetch('/api/franchise/franchbook', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId, content, status: 'reviewed' }),
    });
    setState(response.ok ? 'saved' : 'error');
  }

  function downloadMarkdown() {
    if (!content) return;
    const markdown = toMarkdown(brand || t('export.defaultBrand'), sector || t('export.defaultSector'), content, t);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(brand || 'franchbook').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-franchbook.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (state === 'locked') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
        <span className="mb-3 inline-block rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-700">
          {t('locked.badge')}
        </span>
        <h1 className="mb-3 font-display text-3xl font-extrabold text-slate-900">{t('locked.title')}</h1>
        <p className="mb-6 text-sm leading-6 text-slate-600">{t('locked.body')}</p>
        <LeadForm toolSource="franchbook_gate" score={{ tool: 'franchbook-generator' }} />
      </div>
    );
  }

  if (!content) {
    return (
      <div>
        {state === 'generating' && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-[var(--dk-navy)]">
            {t('generating')}
          </div>
        )}
        {state === 'error' && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">{t('error')}</p>
            {apiError?.message && <p className="mt-1">{apiError.field ? `${apiError.field}: ` : ''}{apiError.message}</p>}
          </div>
        )}
        <FranchiseQuiz config={config} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-[var(--dk-navy)]">
        <strong>{t('banner.title')}</strong> {t('banner.body')}
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="mb-2 inline-block rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-700">
            BETA
          </span>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">{brand}</h1>
          <p className="text-sm text-slate-500">{sector}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void saveEdits()}
            disabled={state === 'saving'}
            className="rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
          >
            {state === 'saving' ? t('result.saving') : state === 'saved' ? t('result.saved') : t('result.save')}
          </button>
          <button
            onClick={downloadMarkdown}
            className="rounded-full bg-[var(--dk-gold)] px-5 py-3 text-sm font-bold text-[var(--dk-navy)] transition hover:bg-amber-400"
          >
            {t('result.export')}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {orderedContent(content).map((section) => {
          const isOpen = openKey === section.key;
          return (
            <div key={section.key} className="overflow-hidden rounded-xl border border-slate-200">
              <button
                onClick={() => setOpenKey(section.key)}
                className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-900"
              >
                <span>{t(`sections.${section.key}`)}</span>
                <span className="text-slate-400">{isOpen ? '-' : '+'}</span>
              </button>
              {isOpen && (
                <div className="space-y-4 p-4">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{t('result.purpose')}</span>
                    <textarea
                      value={section.content.purpose}
                      onChange={(event) => setContent(editSection(content, section.key, { purpose: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-[var(--dk-gold)] focus:outline-none"
                      rows={3}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{t('result.procedure')}</span>
                    <textarea
                      value={section.content.procedure.join('\n')}
                      onChange={(event) => setContent(editSection(content, section.key, { procedure: event.target.value.split('\n').filter(Boolean) }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-[var(--dk-gold)] focus:outline-none"
                      rows={5}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{t('result.controls')}</span>
                    <textarea
                      value={section.content.controls.join('\n')}
                      onChange={(event) => setContent(editSection(content, section.key, { controls: event.target.value.split('\n').filter(Boolean) }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-[var(--dk-gold)] focus:outline-none"
                      rows={5}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{t('result.template')}</span>
                    <textarea
                      value={section.content.template}
                      onChange={(event) => setContent(editSection(content, section.key, { template: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-[var(--dk-gold)] focus:outline-none"
                      rows={6}
                    />
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
