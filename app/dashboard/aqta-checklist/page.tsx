'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Droplets,
  Flame,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Soup,
  Users,
  Utensils,
  WalletCards,
  Waves,
} from 'lucide-react';

type TabKey = 'daily' | 'weekly' | 'monthly';

type AdminSection = {
  id: string;
  title: string;
  owner: string;
  icon: typeof ShieldAlert;
  items: string[];
};

const sections: AdminSection[] = [
  {
    id: 'storage',
    title: 'Ərzaq saxlama',
    owner: 'Sous chef',
    icon: Soup,
    items: [
      'Soyuducu +2°C ilə +6°C arasındadır',
      'Dondurucu -18°C və aşağıdır',
      'Çiy və hazır ərzaq ayrı saxlanır',
      'FIFO və tarix etiketi görünür',
    ],
  },
  {
    id: 'hygiene',
    title: 'Şəxsi gigiyena',
    owner: 'Shift manager',
    icon: Users,
    items: [
      'Tibbi arayışlar aktualdır',
      'İş geyimi və bone standartdadır',
      'Əl yuma stansiyası işləkdir',
      'Aksesuar və siqaret qaydası tətbiq olunur',
    ],
  },
  {
    id: 'kitchen',
    title: 'Mətbəx gigiyenası',
    owner: 'Kitchen lead',
    icon: Utensils,
    items: [
      'İş səthləri dezinfeksiya edilir',
      'Rəng kodlu taxtalar istifadə olunur',
      'Zibil qutuları qapaqlıdır',
      'Zərərverici izi görünmür',
    ],
  },
  {
    id: 'water',
    title: 'Su keyfiyyəti',
    owner: 'Operations',
    icon: Droplets,
    items: [
      'İçməli su sistemi təhlükəsizdir',
      'Buz maşını təmizdir',
      'Buz servis qaydası pozulmur',
    ],
  },
  {
    id: 'prep',
    title: 'Yemək hazırlama',
    owner: 'Chef',
    icon: Flame,
    items: [
      'Toyuq 74°C daxili temperaturu keçir',
      'Hazır yemək 2 saatdan çox kənarda qalmır',
      'Yenidən qızdırma 74°C üzərinə çıxır',
      'Əlcək qaydası qorunur',
    ],
  },
  {
    id: 'docs',
    title: 'Sənədləşdirmə',
    owner: 'Admin',
    icon: WalletCards,
    items: [
      'AQTA qeydiyyatı tamdır',
      'Temperatur jurnalı doldurulur',
      'Fakturalar arxivlənir',
      'Tibbi arayış tarixləri izlənir',
    ],
  },
  {
    id: 'hall',
    title: 'Zal və ümumi sahələr',
    owner: 'Front-of-house',
    icon: Waves,
    items: [
      'Tualet təmiz və tam təchizatlıdır',
      'Mətbəx qoxusu zala keçmir',
      'Ümumi sanitariya uyğun görünür',
    ],
  },
  {
    id: 'allergen',
    title: 'Allergen',
    owner: 'Service lead',
    icon: ShieldAlert,
    items: [
      'Menyuda allergen qeyd olunub',
      'Servis heyəti allergen cavabını bilir',
      'Allergen üçün ayrıca hazırlıq qaydası var',
    ],
  },
];

const routines: Record<TabKey, string[]> = {
  daily: [
    'Temperatur jurnalını doldur',
    'Əl yuma və sabun stansiyalarını yoxla',
    'FIFO və son tarixləri scan et',
    'İş səthləri və zibili bağlanışda audit et',
  ],
  weekly: [
    'Soyuducuları dərin təmizlə',
    'Kəsmə taxtalarını və havalandırma filtrini yoxla',
    'Zərərverici risk nöqtələrini audit et',
  ],
  monthly: [
    'Tibbi arayış və sənəd tarixlərini yenilə',
    'Komandaya 15 dəqiqəlik gigiyena refresher et',
    'Traceability sənədlərini arxivdən test çıxart',
  ],
};

const riskReasons = [
  'Tibbi arayış yoxdur',
  'Vaxtı keçmiş məhsul var',
  'Soyuducu norma xaricindədir',
  'Çiy və hazır məhsul qarışır',
  'Jurnal boşdur',
];

export default function DashboardAqtaChecklistPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [openSection, setOpenSection] = useState<string>(sections[0].id);
  const [tab, setTab] = useState<TabKey>('daily');

  const totalItems = useMemo(
    () => sections.reduce((sum, section) => sum + section.items.length, 0),
    []
  );

  const progress = Math.round((checked.size / totalItems) * 100);

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const reset = () => setChecked(new Set());

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-700">
            <ShieldAlert size={14} />
            Compliance Control
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AQTA Hazırlıq Paneli</h1>
          <p className="mt-1 text-sm text-gray-500">
            Admin üçün operativ gigiyena və sənədləşdirmə nəzarəti. Mock state ilə işləyir.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RefreshCcw size={16} />
            Sıfırla
          </button>
          <Link
            href="/toolkit/aqta-checklist"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            Public aləti aç
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:col-span-2">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Audit progress
          </div>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-black text-red-600">{progress}%</div>
            <div className="pb-1 text-sm text-gray-500">
              {checked.size}/{totalItems} nəzarət maddəsi tamamdır
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-red-500">
            Açıq risk
          </div>
          <div className="text-3xl font-black text-red-600">{riskReasons.length}</div>
          <div className="mt-1 text-xs text-gray-500">Ən çox cərimə doğuran başlıq</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Ritm
          </div>
          <div className="text-3xl font-black text-gray-900">3</div>
          <div className="mt-1 text-xs text-gray-500">Daily, weekly, monthly review</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="space-y-3">
              {sections.map((section) => {
                const Icon = section.icon;
                const isOpen = openSection === section.id;
                const done = section.items.filter((item) => checked.has(`${section.id}:${item}`)).length;
                return (
                  <div key={section.id} className="overflow-hidden rounded-2xl border border-gray-200">
                    <button
                      onClick={() => setOpenSection(isOpen ? '' : section.id)}
                      className="flex w-full items-center gap-4 px-4 py-4 text-left hover:bg-gray-50"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-bold text-gray-900 sm:text-base">{section.title}</h2>
                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                            {done}/{section.items.length}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Owner: {section.owner}</p>
                      </div>
                      {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </button>

                    {isOpen && (
                      <div className="border-t border-gray-100 bg-gray-50/50">
                        {section.items.map((item) => {
                          const key = `${section.id}:${item}`;
                          const active = checked.has(key);
                          return (
                            <button
                              key={key}
                              onClick={() => toggle(key)}
                              className="flex w-full items-start gap-3 border-b border-gray-100 px-4 py-4 text-left last:border-b-0 hover:bg-white"
                            >
                              <div
                                className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg border ${
                                  active
                                    ? 'border-emerald-500 bg-emerald-500 text-white'
                                    : 'border-gray-300 bg-white text-transparent'
                                }`}
                              >
                                <CheckSquare size={14} />
                              </div>
                              <div className={`text-sm ${active ? 'font-semibold text-emerald-700' : 'text-gray-700'}`}>
                                {item}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Gigiyena ritmi</h2>
                <p className="text-sm text-gray-500">Admin checklist görünüşü ilə komanda təkrarı.</p>
              </div>
            </div>
            <div className="mb-4 inline-flex rounded-xl bg-gray-100 p-1">
              {(['daily', 'weekly', 'monthly'] as TabKey[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                    tab === item ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {item === 'daily' ? 'Gündəlik' : item === 'weekly' ? 'Həftəlik' : 'Aylıq'}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {routines[tab].map((item, index) => (
                <div key={item} className="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-[11px] font-black text-red-600">
                    {index + 1}
                  </div>
                  <div className="text-sm text-gray-700">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" />
              <h2 className="font-bold text-gray-900">Ən yayğın cərimə səbəbləri</h2>
            </div>
            <div className="space-y-3">
              {riskReasons.map((reason) => (
                <div key={reason} className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900">
                  {reason}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardCheck size={18} className="text-red-600" />
              <h2 className="font-bold text-gray-900">Cross-contamination</h2>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Qırmızı: çiy ət</p>
              <p>Sarı: toyuq</p>
              <p>Mavi: balıq</p>
              <p>Yaşıl: tərəvəz</p>
              <p>Ağ: çörək və servis</p>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-6 text-white">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-red-300" />
              <h2 className="font-bold">OCAQ Panel upsell</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Bu kontrol siyahısını field-by-field işçi bazasında tapşırıq, deadline və tarixçə ilə
              izləmək üçün OCAQ panel workflow-u açılmalıdır.
            </p>
            <Link
              href="/auth/register"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-300 hover:text-red-200"
            >
              Panel setup planı <ArrowRight size={14} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
