'use client';
import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { customerWhatsappHref, salesInput, salesServices, salesStages, type SalesFollowup } from '@/lib/sales/followup';
import type { SalesLead } from '@/lib/sales/types';
import { formatAzDateTime } from '@/lib/i18n/format';

const field = 'mt-1 w-full min-w-0 rounded-xl border border-[#E4DCCD] bg-white px-3 py-2 text-sm text-slate-900';
export default function KazanLeadStatusActions({ lead, available, onSaved, onDirty }: { lead: SalesLead; available: boolean; onSaved: () => Promise<void>; onDirty: () => void }) {
  const t = useTranslations('salesFollowup');
  const [form, setForm] = useState<SalesFollowup>(lead.sales);
  const [note, setNote] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [template, setTemplate] = useState('discovery');
  const topic = lead.conversationContext?.filter(m => m.role === 'user').at(-1)?.content.slice(0, 500) || t('generalTopic');
  const proposal = t('drafts.proposal', { name: lead.name, service: t(`services.${form.service}`), amount: form.proposalAmount === null ? t('priceUnspecified') : `${form.proposalAmount.toFixed(2)} ₼`, scope: t(`scopes.${form.service}`) });
  const draft = template === 'proposal' ? proposal : t(`drafts.${template}`, { name: lead.name, topic });
  const [customDraft, setCustomDraft] = useState<string | null>(null);
  const href = customerWhatsappHref(lead.phone, customDraft ?? draft);
  const edit = <K extends keyof SalesFollowup>(key: K, value: SalesFollowup[K]) => { setForm(v => ({ ...v, [key]: value })); onDirty(); setCustomDraft(null); };
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending || !available) return;
    setError(''); onDirty();
    const parsed = salesInput.safeParse({ ...form, addNote: note });
    if (!parsed.success) { setError(t('invalid')); return; }
    setPending(true);
    try {
      const res = await fetch('/api/dashboard/kazan-sales', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) });
      const result = await res.json();
      if (!res.ok || result.success !== true) { setError(t(res.status === 409 ? 'conflict' : 'saveError')); return; }
      setNote('');
      // A successful refresh remounts this editor with its current version.
      await onSaved();
    } catch { setError(t('saveError')); }
    finally { setPending(false); }
  }
  return <div className="space-y-4" data-testid={`sales-editor-${lead.id}`}>
    <form onSubmit={submit} className="space-y-3">
      <fieldset disabled={pending || !available} className="space-y-3">
        <label className="block text-sm font-semibold text-slate-800">{t('stage')}
          <select name="stage" value={form.stage} onChange={e => edit('stage', e.target.value as SalesFollowup['stage'])} className={field}>{salesStages.map(v => <option key={v} value={v}>{t(`stages.${v}`)}</option>)}</select>
        </label>
        <label className="block text-sm font-semibold text-slate-800">{t('owner')}<input name="ownerName" maxLength={100} value={form.ownerName} onChange={e => edit('ownerName', e.target.value)} className={field} /></label>
        <label className="block text-sm font-semibold text-slate-800">{t('nextAction')}<input name="nextAction" maxLength={1000} value={form.nextAction} onChange={e => edit('nextAction', e.target.value)} className={field} /></label>
        <label className="block text-sm font-semibold text-slate-800">{t('nextDate')}<input name="nextContactOn" type="date" value={form.nextContactOn ?? ''} onChange={e => edit('nextContactOn', e.target.value || null)} className={field} /></label>
        <label className="block text-sm font-semibold text-slate-800">{t('service')}<select name="service" value={form.service} onChange={e => edit('service', e.target.value as SalesFollowup['service'])} className={field}>{salesServices.map(v => <option key={v} value={v}>{t(`services.${v}`)}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block min-w-0 text-sm font-semibold text-slate-800">{t('proposalAmount')}<input name="proposalAmount" type="number" min="0" step="0.01" value={form.proposalAmount ?? ''} onChange={e => edit('proposalAmount', e.target.value === '' ? null : Number(e.target.value))} className={field} /></label>
          <label className="block min-w-0 text-sm font-semibold text-slate-800">{t('collectedAmount')}<input name="collectedAmount" type="number" min="0" step="0.01" value={form.collectedAmount} onChange={e => edit('collectedAmount', Number(e.target.value))} className={field} /></label>
        </div>
        <p className="text-xs leading-5 text-slate-700">{t('moneyHelp')}</p>
        <label className="block text-sm font-semibold text-slate-800">{t('spentMinutes')}<input name="spentMinutes" type="number" min="0" step="1" value={form.spentMinutes} onChange={e => edit('spentMinutes', Number(e.target.value))} className={field} /></label>
        <label className="block text-sm font-semibold text-slate-800">{t('lossReason')}<input name="lossReason" maxLength={1000} value={form.lossReason} onChange={e => edit('lossReason', e.target.value)} className={field} /></label>
        <label className="block text-sm font-semibold text-slate-800">{t('addNote')}<textarea name="addNote" maxLength={2000} value={note} onChange={e => { setNote(e.target.value); onDirty(); }} rows={2} className={field} /></label>
      </fieldset>
      <p className="text-xs leading-5 text-slate-700">{t('requiredHelp')}</p>
      {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
      <button type="submit" disabled={pending || !available} className="min-h-11 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{t(pending ? 'saving' : 'save')}</button>
    </form>
    <details className="rounded-xl border border-[#E4DCCD] p-3"><summary className="cursor-pointer text-sm font-semibold text-slate-900">{t('notes')}</summary>
      <ul className="mt-2 space-y-2 text-xs text-slate-800">{(lead.notes ?? []).map((n, i) => <li key={i}><time className="font-semibold">{formatAzDateTime(n.at)}</time><p className="whitespace-pre-wrap break-words">{n.text}</p></li>)}</ul>
    </details>
    <details className="rounded-xl border border-[#E4DCCD] p-3"><summary className="cursor-pointer text-sm font-semibold text-slate-900">{t('whatsappDraft')}</summary>
      <label className="mt-3 block text-sm font-semibold text-slate-800">{t('template')}<select value={template} onChange={e => { setTemplate(e.target.value); setCustomDraft(null); }} className={field}>{['discovery', 'proposal', 'followup'].map(v => <option key={v} value={v}>{t(`templates.${v}`)}</option>)}</select></label>
      <label className="mt-3 block text-sm font-semibold text-slate-800">{t('message')}<textarea rows={7} value={customDraft ?? draft} onChange={e => setCustomDraft(e.target.value)} className={field} /></label>
      <p className="mt-2 text-xs leading-5 text-slate-700">{t('draftHelp', { phone: lead.phone })}</p>
      {href ? <a href={href} target="_blank" rel="noopener noreferrer" data-testid="customer-whatsapp" className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white">{t('openWhatsapp')}</a> : <p className="mt-2 text-sm text-red-800">{t('invalidPhone')}</p>}
    </details>
  </div>;
}
