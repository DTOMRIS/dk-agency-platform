'use client';

import Link from 'next/link';
import { UserCircle, UserX, Megaphone, UtensilsCrossed } from 'lucide-react';
import type { Locale } from '@/i18n/config';

interface Persona { name: string; age: string; occupation: string; income: string; lifestyle: string; visitFrequency: string; avgSpend: string; motivations: string[]; painPoints: string[]; channels: string[]; quote: string }
interface MarketingTip { channel: string; message: string; timing: string }

interface PersonaResultData {
  primaryPersona: Persona;
  secondaryPersona: Persona;
  antiPersona: { description: string; whyNot: string };
  marketingTips: MarketingTip[];
  menuSuggestions: string[];
  ahilikQuote: string;
}

const copy: Record<Locale, {
  primary: string; secondary: string; anti: string; antiDesc: string;
  age: string; job: string; income: string; lifestyle: string; visits: string; spend: string;
  motivations: string; painPoints: string; channels: string;
  tipsTitle: string; channel: string; message: string; timing: string;
  menuTitle: string; redo: string; next: string;
}> = {
  az: {
    primary: 'Əsas Persona', secondary: 'İkinci Persona', anti: 'Anti-Persona', antiDesc: 'Bu müştəri sizin restoranınız üçün uyğun deyil',
    age: 'Yaş', job: 'Peşə', income: 'Gəlir', lifestyle: 'Həyat tərzi', visits: 'Ziyarət', spend: 'Xərc',
    motivations: 'Motivasiyalar', painPoints: 'Ağrı nöqtələri', channels: 'Kanallar',
    tipsTitle: 'Marketinq Tövsiyələri', channel: 'Kanal', message: 'Mesaj', timing: 'Vaxt',
    menuTitle: 'Menyu Tövsiyələri', redo: 'Yenidən Yarat', next: 'Növbəti Alət',
  },
  en: {
    primary: 'Primary Persona', secondary: 'Secondary Persona', anti: 'Anti-Persona', antiDesc: 'This customer is NOT your target',
    age: 'Age', job: 'Occupation', income: 'Income', lifestyle: 'Lifestyle', visits: 'Visits', spend: 'Spend',
    motivations: 'Motivations', painPoints: 'Pain Points', channels: 'Channels',
    tipsTitle: 'Marketing Tips', channel: 'Channel', message: 'Message', timing: 'Timing',
    menuTitle: 'Menu Suggestions', redo: 'Recreate', next: 'Next Tool',
  },
  tr: {
    primary: 'Ana Persona', secondary: 'İkinci Persona', anti: 'Anti-Persona', antiDesc: 'Bu müşteri sizin restoranınız için uygun değil',
    age: 'Yaş', job: 'Meslek', income: 'Gelir', lifestyle: 'Yaşam tarzı', visits: 'Ziyaret', spend: 'Harcama',
    motivations: 'Motivasyonlar', painPoints: 'Ağrı noktaları', channels: 'Kanallar',
    tipsTitle: 'Pazarlama Önerileri', channel: 'Kanal', message: 'Mesaj', timing: 'Zamanlama',
    menuTitle: 'Menü Önerileri', redo: 'Tekrar Oluştur', next: 'Sonraki Araç',
  },
  ru: {
    primary: 'Основная персона', secondary: 'Вторичная персона', anti: 'Анти-персона', antiDesc: 'Этот клиент НЕ ваша цель',
    age: 'Возраст', job: 'Профессия', income: 'Доход', lifestyle: 'Образ жизни', visits: 'Визиты', spend: 'Расход',
    motivations: 'Мотивации', painPoints: 'Болевые точки', channels: 'Каналы',
    tipsTitle: 'Маркетинг советы', channel: 'Канал', message: 'Сообщение', timing: 'Время',
    menuTitle: 'Рекомендации по меню', redo: 'Пересоздать', next: 'Следующий',
  },
};

function PersonaCard({ persona, title, locale }: { persona: Persona; title: string; locale: Locale }) {
  const t = copy[locale];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-3">
        <UserCircle size={24} className="text-[var(--dk-gold)]" />
        <div>
          <h3 className="text-sm font-bold text-[var(--dk-navy)]">{title}</h3>
          <p className="text-lg font-bold text-[var(--dk-navy)]">{persona.name}</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-slate-50 p-2 text-center"><span className="block text-[10px] text-slate-400">{t.age}</span><span className="font-semibold">{persona.age}</span></div>
        <div className="rounded-lg bg-slate-50 p-2 text-center"><span className="block text-[10px] text-slate-400">{t.job}</span><span className="font-semibold">{persona.occupation}</span></div>
        <div className="rounded-lg bg-slate-50 p-2 text-center"><span className="block text-[10px] text-slate-400">{t.income}</span><span className="font-semibold">{persona.income}</span></div>
        <div className="rounded-lg bg-slate-50 p-2 text-center"><span className="block text-[10px] text-slate-400">{t.lifestyle}</span><span className="font-semibold">{persona.lifestyle}</span></div>
        <div className="rounded-lg bg-slate-50 p-2 text-center"><span className="block text-[10px] text-slate-400">{t.visits}</span><span className="font-semibold">{persona.visitFrequency}</span></div>
        <div className="rounded-lg bg-slate-50 p-2 text-center"><span className="block text-[10px] text-slate-400">{t.spend}</span><span className="font-semibold">{persona.avgSpend}</span></div>
      </div>

      <div className="space-y-3 text-sm">
        <div><span className="text-xs font-bold text-green-600">{t.motivations}:</span>
          <ul className="mt-1 space-y-0.5 text-slate-600">{persona.motivations.map((m, i) => <li key={i}>+ {m}</li>)}</ul></div>
        <div><span className="text-xs font-bold text-red-500">{t.painPoints}:</span>
          <ul className="mt-1 space-y-0.5 text-slate-600">{persona.painPoints.map((p, i) => <li key={i}>- {p}</li>)}</ul></div>
        <div><span className="text-xs font-bold text-blue-600">{t.channels}:</span>
          <ul className="mt-1 space-y-0.5 text-slate-600">{persona.channels.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
      </div>

      <p className="mt-4 rounded-lg bg-[var(--dk-gold)]/5 px-4 py-3 text-sm italic text-[var(--dk-navy)]">&ldquo;{persona.quote}&rdquo;</p>
    </div>
  );
}

interface Props { result: PersonaResultData; locale: Locale; onRedo: () => void }

export default function PersonaResult({ result, locale, onRedo }: Props) {
  const t = copy[locale];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PersonaCard persona={result.primaryPersona} title={t.primary} locale={locale} />
        <PersonaCard persona={result.secondaryPersona} title={t.secondary} locale={locale} />
      </div>

      {/* Anti-persona */}
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
        <div className="mb-2 flex items-center gap-2">
          <UserX size={18} className="text-red-500" />
          <h3 className="text-sm font-bold text-red-700">{t.anti}</h3>
        </div>
        <p className="text-xs text-red-600">{t.antiDesc}</p>
        <p className="mt-2 text-sm text-slate-700">{result.antiPersona.description}</p>
        <p className="mt-1 text-xs text-slate-500">{result.antiPersona.whyNot}</p>
      </div>

      {/* Marketing tips */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--dk-navy)]"><Megaphone size={16} />{t.tipsTitle}</h3>
        <div className="space-y-3">
          {result.marketingTips.map((tip, i) => (
            <div key={i} className="rounded-lg border border-slate-100 px-4 py-3">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="font-bold text-[var(--dk-gold)]">{tip.channel}</span>
                <span>·</span>
                <span>{tip.timing}</span>
              </div>
              <p className="mt-1 text-sm text-[var(--dk-navy)]">{tip.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu suggestions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--dk-navy)]"><UtensilsCrossed size={16} />{t.menuTitle}</h3>
        <ul className="space-y-1.5 text-sm text-slate-600">
          {result.menuSuggestions.map((s, i) => <li key={i}>• {s}</li>)}
        </ul>
      </div>

      <p className="text-center text-xs italic text-slate-400">&ldquo;{result.ahilikQuote}&rdquo; — Əhilik</p>

      <div className="flex gap-3">
        <button type="button" onClick={onRedo} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[var(--dk-navy)] hover:text-[var(--dk-navy)]">{t.redo}</button>
        <Link href="/dashboard/marketinq-ocagi" className="flex flex-1 items-center justify-center rounded-xl bg-[var(--dk-navy)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--dk-navy)]/90">{t.next}</Link>
      </div>
    </div>
  );
}
