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
            setApiError({ message: issue.message || 'validation error', field });
          } else {
            setApiError({ message: errData.error || 'error' });
          }
        } catch {
          setApiError({ message: 'error' });
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
      <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6 sm:p-8">
        <span className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#BE2F47]">
          <span className="h-[7px] w-[7px] rounded-full bg-[#E94560]" aria-hidden="true" />
          {t('locked.badge')}
        </span>
        <h1 className="mt-3 mb-3 text-[clamp(28px,4vw,44px)] font-black leading-[1.05] tracking-[-0.04em] text-[#0F172A]">{t('locked.title')}</h1>
        <p className="mb-6 text-[15px] leading-7 text-slate-600">{t('locked.body')}</p>
        <LeadForm toolSource="franchbook_gate" score={{ tool: 'franchbook-generator' }} />
      </div>
    );
  }

  if (!content) {
    return (
      <div>
        {state === 'generating' && (
          <div className="mb-4 rounded-2xl border border-[#E4DCCD] bg-[#FBF8F3] p-4 text-[14px] font-semibold text-[#0F172A]" role="status">
            {t('generating')}
          </div>
        )}
        {state === 'error' && (
          <div className="mb-4 rounded-2xl border border-[#F4B8C3] bg-[#FDECEF] p-4 text-[14px] text-[#BE2F47]" role="alert">
            <p className="font-semibold">{t('error')}</p>
            {apiError?.message && <p className="mt-1">{apiError.field ? `${apiError.field}: ` : ''}{apiError.message}</p>}
          </div>
        )}
        <FranchiseQuiz config={config} />
      </div>
    );
  }

  return (
    <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6 sm:p-8">
      <div className="mb-6 rounded-2xl border-l-[3px] border-[#BE2F47] bg-[#FBF8F3] px-5 py-4 text-[14px] leading-6 text-[#0F172A]">
        <strong>{t('banner.title')}</strong> {t('banner.body')}
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="mb-2 inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-[#BE2F47] ring-1 ring-[#F4B8C3]">
            BETA
          </span>
          <h1 className="text-[clamp(28px,4vw,44px)] font-black leading-[1.05] tracking-[-0.04em] text-[#0F172A]">{brand}</h1>
          <p className="mt-1 text-[14px] text-slate-500">{sector}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void saveEdits()}
            disabled={state === 'saving'}
            type="button"
            className="inline-flex min-h-11 items-center rounded-full border border-[#E4DCCD] bg-white px-5 text-[14px] font-bold text-[#0F172A] transition-colors hover:border-[#0F172A] disabled:opacity-50"
          >
            {state === 'saving' ? t('result.saving') : state === 'saved' ? t('result.saved') : t('result.save')}
          </button>
          <button
            type="button"
            onClick={downloadMarkdown}
            className="inline-flex min-h-11 items-center rounded-full bg-dk-red-strong px-5 text-[14px] font-bold text-white transition-colors hover:bg-dk-red-deep"
          >
            {t('result.export')}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {orderedContent(content).map((section) => {
          const isOpen = openKey === section.key;
          return (
            <div key={section.key} className="overflow-hidden rounded-2xl border border-[#E4DCCD]">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenKey(section.key)}
                className="flex w-full items-center justify-between bg-[#FBF8F3] px-4 py-3.5 text-left text-[15px] font-bold text-[#0F172A]"
              >
                <span>{t(`sections.${section.key}`)}</span>
                <span className="text-slate-400">{isOpen ? '-' : '+'}</span>
              </button>
              {isOpen && (
                <div className="space-y-4 p-4">
                  <label className="block">
                    <span className="mb-1.5 block text-[14px] font-bold text-[#0F172A]">{t('result.purpose')}</span>
                    <textarea
                      value={section.content.purpose}
                      onChange={(event) => setContent(editSection(content, section.key, { purpose: event.target.value }))}
                      className="w-full rounded-xl border border-[#E4DCCD] bg-white px-4 py-3 text-[15px] text-[#0F172A] outline-none focus:border-[#D63B54] focus:ring-2 focus:ring-[#D63B54]/15"
                      rows={3}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[14px] font-bold text-[#0F172A]">{t('result.procedure')}</span>
                    <textarea
                      value={section.content.procedure.join('\n')}
                      onChange={(event) => setContent(editSection(content, section.key, { procedure: event.target.value.split('\n').filter(Boolean) }))}
                      className="w-full rounded-xl border border-[#E4DCCD] bg-white px-4 py-3 text-[15px] text-[#0F172A] outline-none focus:border-[#D63B54] focus:ring-2 focus:ring-[#D63B54]/15"
                      rows={5}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[14px] font-bold text-[#0F172A]">{t('result.controls')}</span>
                    <textarea
                      value={section.content.controls.join('\n')}
                      onChange={(event) => setContent(editSection(content, section.key, { controls: event.target.value.split('\n').filter(Boolean) }))}
                      className="w-full rounded-xl border border-[#E4DCCD] bg-white px-4 py-3 text-[15px] text-[#0F172A] outline-none focus:border-[#D63B54] focus:ring-2 focus:ring-[#D63B54]/15"
                      rows={5}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[14px] font-bold text-[#0F172A]">{t('result.template')}</span>
                    <textarea
                      value={section.content.template}
                      onChange={(event) => setContent(editSection(content, section.key, { template: event.target.value }))}
                      className="w-full rounded-xl border border-[#E4DCCD] bg-white px-4 py-3 text-[15px] text-[#0F172A] outline-none focus:border-[#D63B54] focus:ring-2 focus:ring-[#D63B54]/15"
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
