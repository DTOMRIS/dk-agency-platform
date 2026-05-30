import { getActivationFunnel } from '@/lib/admin/funnelQuery';
import type { Locale } from '@/i18n/config';

const copy: Record<Locale, {
  title: string;
  subtitle: string;
  registered: string;
  prioritiesSet: string;
  toolClicked: string;
  d7Returned: string;
  benchmark: string;
  skipped: string;
  noData: string;
}> = {
  az: {
    title: 'Aktivasiya funeli',
    subtitle: 'Qeydiyyatdan D7 qayıdışa qədər istifadəçi axını',
    registered: 'Qeydiyyat',
    prioritiesSet: 'Prioritet seçim',
    toolClicked: 'Alət açma (24s)',
    d7Returned: 'D7 qayıdış',
    benchmark: 'Top kvartil: aktivasiya 40%+, D7 30%+',
    skipped: 'Keçdi (skip)',
    noData: 'Hələ kifayət qədər veri yoxdur',
  },
  en: {
    title: 'Activation funnel',
    subtitle: 'User flow from registration to D7 return',
    registered: 'Registered',
    prioritiesSet: 'Priorities set',
    toolClicked: 'Tool opened (24h)',
    d7Returned: 'D7 return',
    benchmark: 'Top quartile: activation 40%+, D7 30%+',
    skipped: 'Skipped',
    noData: 'Not enough data yet',
  },
  ru: {
    title: 'Воронка активации',
    subtitle: 'Поток пользователей от регистрации до возврата D7',
    registered: 'Регистрация',
    prioritiesSet: 'Выбор приоритетов',
    toolClicked: 'Открытие инструмента (24ч)',
    d7Returned: 'Возврат D7',
    benchmark: 'Топ квартиль: активация 40%+, D7 30%+',
    skipped: 'Пропустили',
    noData: 'Пока недостаточно данных',
  },
  tr: {
    title: 'Aktivasyon hunisi',
    subtitle: 'Kayıttan D7 geri dönüşe kullanıcı akışı',
    registered: 'Kayıt',
    prioritiesSet: 'Öncelik seçimi',
    toolClicked: 'Araç açma (24s)',
    d7Returned: 'D7 geri dönüş',
    benchmark: 'Üst çeyrek: aktivasyon 40%+, D7 30%+',
    skipped: 'Atladı',
    noData: 'Henüz yeterli veri yok',
  },
};

const STAGES = ['registered', 'prioritiesSet', 'toolClicked', 'd7Returned'] as const;

const STAGE_COLORS = {
  registered: 'bg-slate-200',
  prioritiesSet: 'bg-amber-400',
  toolClicked: 'bg-emerald-500',
  d7Returned: 'bg-blue-500',
} as const;

interface Props {
  locale: Locale;
  days?: number;
}

export default async function ActivationFunnelWidget({ locale, days = 30 }: Props) {
  const data = await getActivationFunnel(days);
  const c = copy[locale];

  if (data.registered === 0) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-display text-xl font-black text-[var(--dk-navy)]">{c.title}</h3>
        <p className="mt-2 text-sm text-slate-400">{c.noData}</p>
      </div>
    );
  }

  const stageValues: Record<(typeof STAGES)[number], number> = {
    registered: data.registered,
    prioritiesSet: data.prioritiesSet,
    toolClicked: data.toolClicked24h,
    d7Returned: data.d7Returned,
  };

  const stageLabels: Record<(typeof STAGES)[number], string> = {
    registered: c.registered,
    prioritiesSet: c.prioritiesSet,
    toolClicked: c.toolClicked,
    d7Returned: c.d7Returned,
  };

  const maxVal = data.registered;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-black text-[var(--dk-navy)]">{c.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{c.subtitle}</p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">
          {days}d
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {STAGES.map((key) => {
          const val = stageValues[key];
          const pct = maxVal > 0 ? Math.round((val / maxVal) * 100) : 0;
          const barWidth = Math.max(pct, 2);

          return (
            <div key={key}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold text-slate-700">{stageLabels[key]}</span>
                <span className="font-bold text-[var(--dk-navy)]">
                  {val} <span className="text-xs font-normal text-slate-400">({pct}%)</span>
                </span>
              </div>
              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${STAGE_COLORS[key]}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {data.prioritiesSkipped > 0 && (
        <p className="mt-3 text-xs text-slate-400">
          {c.skipped}: {data.prioritiesSkipped}
        </p>
      )}

      <p className="mt-4 rounded-xl bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
        {c.benchmark}
      </p>
    </div>
  );
}
