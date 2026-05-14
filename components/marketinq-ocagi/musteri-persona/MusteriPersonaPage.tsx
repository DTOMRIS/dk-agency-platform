'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { TIER_COLORS } from '@/lib/marketing-tools-config';
import PersonaForm from './PersonaForm';
import PersonaResult from './PersonaResult';
import { ToolInfoBox } from '@/components/marketing-tools/ToolInfoBox';

const pageCopy: Record<Locale, { title: string; subtitle: string; backToList: string; whyTitle: string; why: string; tier: string; loading: string }> = {
  az: { title: 'Müştəri Persona', subtitle: 'Hədəf müştəri profilini yaradın', backToList: 'Bütün alətlər',
    whyTitle: 'Niyə bu vacibdir?', why: 'Hər kəsə satmaq heç kimə satmaq deməkdir. AI sizin restoran üçün 2 ideal persona + 1 anti-persona yaradır, marketinq mesajını kəskinləşdirir.',
    tier: 'KALFA', loading: 'Yüklənir...' },
  en: { title: 'Customer Persona', subtitle: 'Build target customer profiles', backToList: 'All tools',
    whyTitle: 'Why is this important?', why: 'Selling to everyone means selling to no one. AI creates 2 ideal personas + 1 anti-persona for your restaurant.',
    tier: 'PRO', loading: 'Loading...' },
  tr: { title: 'Müşteri Persona', subtitle: 'Hedef müşteri profili oluşturun', backToList: 'Tüm araçlar',
    whyTitle: 'Bu neden önemli?', why: 'Herkese satmak kimseye satmamak demektir. AI restoranınız için 2 ideal persona + 1 anti-persona oluşturur.',
    tier: 'KALFA', loading: 'Yükleniyor...' },
  ru: { title: 'Персона Клиента', subtitle: 'Создайте профиль целевого клиента', backToList: 'Все инструменты',
    whyTitle: 'Почему это важно?', why: 'Продавать всем — значит не продавать никому. AI создаёт 2 идеальных персоны + 1 анти-персону.',
    tier: 'ПОДМАСТЕРЬЕ', loading: 'Загрузка...' },
};

type ViewMode = 'loading' | 'form' | 'result';

export default function MusteriPersonaPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const c = pageCopy[locale];
  const tierColors = TIER_COLORS.kalfa;

  const [view, setView] = useState<ViewMode>('loading');
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/marketing-tools/musteri-persona')
      .then((r) => r.json())
      .then((data) => { if (data.hasRun && data.lastResult) { setResult(data.lastResult); setView('result'); } else setView('form'); })
      .catch(() => setView('form'));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link href="/dashboard/marketinq-ocagi" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-[var(--dk-navy)]">
        <ArrowLeft size={16} />{c.backToList}
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dk-navy)]">{c.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{c.subtitle}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${tierColors.bg} ${tierColors.text} ${tierColors.border}`}>{c.tier}</span>
      </div>

      {view !== 'result' && (
        <ToolInfoBox title="Niyə bu vacibdir?" variant="info">
          <p>Hər kəsə satmaq heç kimə satmaq deməkdir. AI sizin restoran üçün 2 ideal persona + 1 anti-persona yaradır, marketinq mesajını kəskinləşdirir.</p>
        </ToolInfoBox>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {view === 'loading' && <div className="py-12 text-center text-sm text-slate-400">{c.loading}</div>}
      {view === 'form' && <PersonaForm locale={locale} onResult={(d) => { setResult(d); setError(null); setView('result'); }} onError={setError} />}
      {view === 'result' && result && <PersonaResult result={result as Parameters<typeof PersonaResult>[0]['result']} locale={locale} onRedo={() => { setView('form'); setError(null); }} />}
    </div>
  );
}
