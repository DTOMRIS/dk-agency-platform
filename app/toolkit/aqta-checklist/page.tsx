'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ClipboardCheck,
  Droplets,
  Flame,
  Lightbulb,
  RefreshCcw,
  Shield,
  ShieldAlert,
  Soup,
  Users,
  Utensils,
  WalletCards,
  Waves,
} from 'lucide-react';

type FrequencyTab = 'daily' | 'weekly' | 'monthly';

type Section = {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Shield;
  accent: string;
  accentBg: string;
  accentRing: string;
  items: { id: string; text: string; detail: string }[];
};

const STORAGE_KEY = 'dk-aqta-checklist';

const sections: Section[] = [
  {
    id: 'storage',
    title: 'Ərzaq saxlama',
    subtitle: 'Soyuducu, FIFO, tarix etiketi və ayrılmış rəflər',
    icon: Soup,
    accent: 'text-red-600',
    accentBg: 'bg-red-50',
    accentRing: 'ring-red-200/60',
    items: [
      {
        id: 'storage-1',
        text: 'Soyuducu +2°C ilə +6°C arasındadır',
        detail: 'Termometr gündəlik yoxlanır və qeyd də düşür.',
      },
      {
        id: 'storage-2',
        text: 'Dondurucu -18°C və aşağıdır',
        detail: 'Normadan çıxırsa dərhal tədbir planı var.',
      },
      {
        id: 'storage-3',
        text: 'Çiy və hazır ərzaq ayrı saxlanır',
        detail: 'Damcılama riski olmayan ayrı rəf və qab qaydası tətbiq edilir.',
      },
      {
        id: 'storage-4',
        text: 'Ərzaq yerdən yuxarı saxlanır',
        detail: 'Rəf, palet və uyğun konteyner istifadəsi olunur.',
      },
      {
        id: 'storage-5',
        text: 'FIFO və son tarix etiketi görünür',
        detail: 'Köhnə məhsul ön sıradadır, vaxtı keçmiş məhsul yoxdur.',
      },
    ],
  },
  {
    id: 'hygiene',
    title: 'Şəxsi gigiyena',
    subtitle: 'Komanda davranışı, bone, tibbi arayış və əl yuma',
    icon: Users,
    accent: 'text-red-600',
    accentBg: 'bg-red-50',
    accentRing: 'ring-red-200/60',
    items: [
      {
        id: 'hygiene-1',
        text: 'Bütün işçilərin tibbi arayışı aktualdır',
        detail: 'Tarix nəzarəti aylıq aparılır.',
      },
      {
        id: 'hygiene-2',
        text: 'İş geyimi təmiz və standartdır',
        detail: 'Mətbəx komandasında açıq rəng forma və bone var.',
      },
      {
        id: 'hygiene-3',
        text: 'Əl yuma stansiyası işləkdir',
        detail: 'Sabun, dezinfeksiya və quruducu həmişə doludur.',
      },
      {
        id: 'hygiene-4',
        text: 'Dırnaq, aksesuar və siqaret qaydası tətbiq olunur',
        detail: 'Üzük, bilərzik və mətbəxdə siqaret qadağası pozulmur.',
      },
    ],
  },
  {
    id: 'kitchen',
    title: 'Mətbəx gigiyenası',
    subtitle: 'Səthlər, taxtalar, zibil və zərərverici nəzarəti',
    icon: Utensils,
    accent: 'text-red-600',
    accentBg: 'bg-red-50',
    accentRing: 'ring-red-200/60',
    items: [
      {
        id: 'kitchen-1',
        text: 'İş səthləri və bıçaqlar hər istifadə sonrası təmizlənir',
        detail: 'Təmizlik və dezinfeksiya ayrıdır, ikisi də tətbiq edilir.',
      },
      {
        id: 'kitchen-2',
        text: 'Rəng kodlu kəsmə taxtaları istifadə olunur',
        detail: 'Çiy ət, toyuq, balıq və tərəvəz üçün ayrıca taxta ayrılıb.',
      },
      {
        id: 'kitchen-3',
        text: 'Zibil qutuları qapaqlı və pedallıdır',
        detail: 'Daşma, qoxu və açıq zibil sahəsi yoxdur.',
      },
      {
        id: 'kitchen-4',
        text: 'Zərərverici izi yoxdur',
        detail: 'Həftəlik yoxlama və peşəkar dərmanlama planı saxlanılır.',
      },
    ],
  },
  {
    id: 'water',
    title: 'Su keyfiyyəti',
    subtitle: 'İçməli su, buz maşını və təhlükəsiz servis',
    icon: Droplets,
    accent: 'text-red-600',
    accentBg: 'bg-red-50',
    accentRing: 'ring-red-200/60',
    items: [
      {
        id: 'water-1',
        text: 'İçməli su mənbəyi təhlükəsizdir',
        detail: 'Filtr, servis və baxım vaxtı nəzarətdədir.',
      },
      {
        id: 'water-2',
        text: 'Buz maşını təmizdir',
        detail: 'Buz əl ilə deyil, maşa və ya kürək ilə götürülür.',
      },
      {
        id: 'water-3',
        text: 'Su ilə təmas edən qablar ayrıdır',
        detail: 'Buz qabı, su qabı və qabyuyan axını qarışdırılmır.',
      },
    ],
  },
  {
    id: 'prep',
    title: 'Yemək hazırlama',
    subtitle: 'Pişirmə temperaturu, saxlanma limiti və yenidən qızdırma',
    icon: Flame,
    accent: 'text-red-600',
    accentBg: 'bg-red-50',
    accentRing: 'ring-red-200/60',
    items: [
      {
        id: 'prep-1',
        text: 'Toyuq minimum 74°C daxili temperatura çatır',
        detail: 'Termometr ilə yoxlanılır, gözə görə qərar verilmir.',
      },
      {
        id: 'prep-2',
        text: 'Hazır yemək 2 saatdan çox otaq temperaturunda qalmır',
        detail: '2 saatdan sonra soyudulur və ya atılır.',
      },
      {
        id: 'prep-3',
        text: 'Yenidən qızdırılan məhsul 74°C üzərinə çıxır',
        detail: 'Təkrar servis üçün eyni təhlükəsizlik sərhədi qorunur.',
      },
      {
        id: 'prep-4',
        text: 'Eyni əlcək fərqli məhsul qruplarında istifadə olunmur',
        detail: 'Çarpaz kontaminasiya qaydası komanda tərəfindən bilinir.',
      },
    ],
  },
  {
    id: 'docs',
    title: 'Sənədləşdirmə',
    subtitle: 'AQTA qeydiyyatı, jurnal və izlənə bilənlik',
    icon: WalletCards,
    accent: 'text-red-600',
    accentBg: 'bg-red-50',
    accentRing: 'ring-red-200/60',
    items: [
      {
        id: 'docs-1',
        text: 'AQTA qeydiyyatı tamamlanıb',
        detail:
          'AQTA qeydiyyatı üçün müraciət ASAN/KOBİA vasitəsilə verilir. Dövlət rüsumu yoxdur, müraciət pulsuzdur.',
      },
      {
        id: 'docs-2',
        text: 'Temperatur və gigiyena jurnalı doludur',
        detail: 'Gündəlik qeydlər boş buraxılmır.',
      },
      {
        id: 'docs-3',
        text: 'Faktura və məhsul mənbə sənədləri arxivlənir',
        detail: 'Traceability tələbi üçün sənəd çıxarmaq mümkündür.',
      },
      {
        id: 'docs-4',
        text: 'Tibbi arayış tarixləri ayrıca cədvəldə izlənir',
        detail: 'Müddəti bitmədən yenilənmə xəbərdarlığı verilir.',
      },
    ],
  },
  {
    id: 'hall',
    title: 'Zal və ümumi sahələr',
    subtitle: 'Tualet, havalandırma və ümumi sanitariya görünüşü',
    icon: Waves,
    accent: 'text-red-600',
    accentBg: 'bg-red-50',
    accentRing: 'ring-red-200/60',
    items: [
      {
        id: 'hall-1',
        text: 'Tualet təmiz və tam təchizatlıdır',
        detail: 'Sabun, quruducu və işlək su mövcuddur.',
      },
      {
        id: 'hall-2',
        text: 'Mətbəx qoxusu zala keçmir',
        detail: 'Havalandırma axını və filtr təmizliyi nəzarətdədir.',
      },
      {
        id: 'hall-3',
        text: 'Döşəmə, divar və tavan sanitariya baxımından uyğundur',
        detail: 'Səthlərdə yağ, kif və açıq çirk görünmür.',
      },
    ],
  },
  {
    id: 'allergen',
    title: 'Allergen',
    subtitle: 'Menyu məlumatı və qonağa aydın xəbərdarlıq',
    icon: ShieldAlert,
    accent: 'text-red-600',
    accentBg: 'bg-red-50',
    accentRing: 'ring-red-200/60',
    items: [
      {
        id: 'allergen-1',
        text: 'Menyuda əsas allergenlər qeyd olunub',
        detail: 'Süd, gluten, yumurta, fındıq və s. aydın göstərilir.',
      },
      {
        id: 'allergen-2',
        text: 'Komanda allergen sualına düzgün cavab verir',
        detail: 'Servis heyətində qısa cavab skripti var.',
      },
      {
        id: 'allergen-3',
        text: 'Allergen üçün ayrıca hazırlıq qaydası mövcuddur',
        detail: 'Taxta, bıçaq və səth ayrımı məlumdur.',
      },
    ],
  },
];

const frequencyPlan: Record<FrequencyTab, string[]> = {
  daily: [
    'Soyuducu və dondurucu temperaturlarını jurnala yaz.',
    'İş səthlərini təmizlə və dezinfeksiya et.',
    'FIFO və son istifadə tarixlərini yoxla.',
    'Əl yuma stansiyalarında sabun və quruducu olub-olmadığını yoxla.',
    'İş geyimi, bone və əlcək qaydasına nəzarət et.',
  ],
  weekly: [
    'Soyuducuların içini tam təmizlə.',
    'Zərərverici riski üçün künc və rəf arxalarını yoxla.',
    'Kəsmə taxtalarının çat və aşınma vəziyyətini yoxla.',
    'Havalandırma filtrini və tualet gigiyenasını dərin təmizlə.',
  ],
  monthly: [
    'Tibbi arayış tarixlərini yenidən nəzərdən keçir.',
    'Faktura və traceability sənədlərini arxivlə.',
    'Avadanlığın texniki baxış siyahısını tamamla.',
    'Komandaya 15 dəqiqəlik gigiyena refresher təlimi keç.',
    'Peşəkar dərmanlama və ya yoxlama xidməti planlaşdır.',
  ],
};

const fineReasons = [
  'Tibbi arayışların olmaması',
  'Vaxtı keçmiş ərzağın tapılması',
  'Soyuducu temperaturunun normadan çıxması',
  'Çiy və hazır ərzağın birlikdə saxlanması',
  'Əl yuma imkanının olmaması',
  'Gigiyena jurnalının boş qalması',
  'Zərərverici izlərinin görünməsi',
  'Mənbə sənədlərinin təqdim edilə bilməməsi',
  'Uyğunsuz iş geyimi və bone qaydası',
  'Tualet sanitariyasının zəif olması',
];

const crossBoards = [
  { label: 'Qırmızı', use: 'Çiy ət', color: 'bg-red-500' },
  { label: 'Sarı', use: 'Toyuq', color: 'bg-amber-400' },
  { label: 'Mavi', use: 'Balıq', color: 'bg-blue-500' },
  { label: 'Yaşıl', use: 'Tərəvəz', color: 'bg-emerald-500' },
  { label: 'Ağ', use: 'Çörək və servis', color: 'bg-slate-200 text-slate-700' },
];

const blogLinks = [
  { title: 'AQTA Cərimə Checklist', href: '/blog/aqta-cerime-checklist', tag: 'Blog' },
  { title: 'Restoran Açılış Checklist', href: '/toolkit/checklist', tag: 'Alət' },
  { title: 'İnşaatdan Açılışa', href: '/toolkit/insaat-checklist', tag: 'Alət' },
];

export default function AqtaChecklistPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [openSection, setOpenSection] = useState<string>(sections[0].id);
  const [frequencyTab, setFrequencyTab] = useState<FrequencyTab>('daily');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setChecked(new Set(JSON.parse(saved) as string[]));
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked]));
  }, [checked]);

  const totalItems = useMemo(
    () => sections.reduce((sum, section) => sum + section.items.length, 0),
    []
  );

  const progress = Math.round((checked.size / totalItems) * 100);

  const sectionProgress = useMemo(
    () =>
      sections.map((section) => {
        const done = section.items.filter((item) => checked.has(item.id)).length;
        return {
          id: section.id,
          done,
          total: section.items.length,
          pct: Math.round((done / section.items.length) * 100),
        };
      }),
    [checked]
  );

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetAll = () => {
    setChecked(new Set());
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="bg-white pb-24">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0">
          <div className="absolute right-[-10%] top-[-15%] h-[520px] w-[520px] rounded-full bg-red-500/10 blur-[110px]" />
          <div className="absolute bottom-[-25%] left-[-10%] h-[360px] w-[360px] rounded-full bg-rose-500/10 blur-[90px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6">
          <Link
            href="/toolkit"
            className="group mb-8 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Toolkit</span>
          </Link>
          <div className="max-w-2xl">
            <h1 className="mb-5 text-4xl font-display font-black leading-[1.05] tracking-tight text-white sm:text-5xl">
              AQTA
              <br />
              <span className="bg-gradient-to-r from-red-400 to-rose-300 bg-clip-text text-transparent">
                Hazırlıq Checklist
              </span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
              Gigiyena, sənədləşdirmə, cross-contamination və gündəlik nəzarət. Cərimə riskini
              bölmə-bölmə gör və komandan üçün standart qur.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 md:col-span-2">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Ümumi irəliləyiş
            </div>
            <div className="flex items-end gap-3">
              <div className="text-3xl font-black tabular-nums text-red-600">{progress}%</div>
              <div className="pb-1 text-sm text-slate-500">
                {checked.size}/{totalItems} maddə tamamlandı
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="rounded-2xl bg-red-50 p-5 ring-1 ring-red-200/60">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Risk zonası
            </div>
            <div className="text-3xl font-black text-red-600">{fineReasons.length}</div>
            <div className="mt-1 text-xs text-slate-500">Ən yayğın cərimə səbəbi</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Rejim
            </div>
            <div className="text-3xl font-black text-slate-900">3</div>
            <div className="mt-1 text-xs text-slate-500">Gündəlik, həftəlik, aylıq plan</div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">İnteraktiv checklist</h2>
                <p className="text-sm text-slate-500">AQTA yoxlamasına hazır olmaq üçün 8 əsas blok.</p>
              </div>
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-red-500"
              >
                <RefreshCcw size={13} />
                Sıfırla
              </button>
            </div>

            <div className="space-y-3 p-4">
              {sections.map((section) => {
                const stats = sectionProgress.find((item) => item.id === section.id)!;
                const Icon = section.icon;
                const isOpen = openSection === section.id;

                return (
                  <div key={section.id} className="overflow-hidden rounded-2xl border border-slate-200/80">
                    <button
                      onClick={() => setOpenSection(isOpen ? '' : section.id)}
                      className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${section.accentBg}`}>
                        <Icon size={20} className={section.accent} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 sm:text-base">{section.title}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${section.accentBg} ${section.accent}`}>
                            {stats.done}/{stats.total}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{section.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 sm:block">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-500"
                            style={{ width: `${stats.pct}%` }}
                          />
                        </div>
                        {isOpen ? (
                          <ChevronUp size={18} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={18} className="text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/40">
                        {section.items.map((item) => {
                          const done = checked.has(item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => toggleCheck(item.id)}
                              className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left last:border-b-0 hover:bg-white/70"
                            >
                              <div
                                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                                  done
                                    ? 'border-emerald-500 bg-emerald-500 text-white'
                                    : 'border-slate-300 bg-white text-transparent'
                                }`}
                              >
                                <ClipboardCheck size={14} />
                              </div>
                              <div className="min-w-0">
                                <div className={`text-sm font-semibold ${done ? 'text-emerald-700' : 'text-slate-900'}`}>
                                  {item.text}
                                </div>
                                <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.detail}</p>
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

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">Gigiyena rejimi</h2>
              <p className="text-sm text-slate-500">Komanda üçün gündəlik, həftəlik və aylıq ritm cədvəli.</p>
            </div>
            <div className="px-5 pt-4">
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                {(['daily', 'weekly', 'monthly'] as FrequencyTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFrequencyTab(tab)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      frequencyTab === tab
                        ? 'bg-white text-red-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab === 'daily' ? 'Gündəlik' : tab === 'weekly' ? 'Həftəlik' : 'Aylıq'}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5">
              <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200/80">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Rejim
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Tapşırıq
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {frequencyPlan[frequencyTab].map((item, index) => (
                      <tr key={item}>
                        <td className="px-4 py-3 text-xs font-bold text-red-600">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{item}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Shield size={18} className="text-red-600" />
              <h2 className="text-base font-bold text-slate-900">AQTA nədir?</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              AQTA qida təhlükəsizliyi, gigiyena, traceability və istehlakçı riskinə baxır.
              Problem yalnız təmizlik deyil. Qaydaların sistemli izlənməsi və sənədləşdirilməsi
              əsasdır. AQTA qeydiyyatı üçün müraciət ASAN/KOBİA vasitəsilə verilir. Dövlət
              rüsumu yoxdur, müraciət pulsuzdur.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" />
              <h2 className="text-base font-bold text-slate-900">Ən yayğın 10 cərimə səbəbi</h2>
            </div>
            <div className="space-y-3">
              {fineReasons.map((reason, index) => (
                <div key={reason} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-[11px] font-black text-red-600">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Droplets size={18} className="text-red-600" />
              <h2 className="text-base font-bold text-slate-900">Cross-contamination</h2>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-slate-600">
              Çiy məhsuldakı bakteriyanın hazır yeməyə keçməsi qida zəhərlənməsinin əsas
              səbəbidir. Eyni taxta, eyni əlcək və yanlış soyuducu düzülüşü ən riskli üçlükdür.
            </p>
            <div className="space-y-2">
              {crossBoards.map((board) => (
                <div key={board.label} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                  <span className={`inline-flex min-w-20 items-center justify-center rounded-lg px-2 py-1 text-xs font-bold text-white ${board.color}`}>
                    {board.label}
                  </span>
                  <span className="text-sm text-slate-600">{board.use}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-6 text-white">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-red-500/15 blur-3xl" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb size={18} className="text-red-400" />
                <h2 className="text-base font-bold text-red-300">DK Agency məsləhəti</h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                AQTA problemi adətən &quot;təmizlik problemi&quot; deyil, &quot;idarəetmə ritmi problemi&quot;dir.
                Jurnal, məsul şəxs və gündəlik nəzarət saatı yoxdursa, cərimə riski yüksəlir.
              </p>
              <Link
                href="/blog/aqta-cerime-checklist"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-300 transition-colors hover:text-red-200"
              >
                Tam yazını oxu <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 p-6 text-white shadow-xl shadow-red-500/15">
            <div className="mb-3 flex items-center gap-2">
              <Waves size={18} />
              <h2 className="text-base font-bold">OCAQ Panel</h2>
            </div>
            <p className="text-sm leading-relaxed text-white/85">
              Temperatur jurnalı, tibbi arayış tarixləri, gigiyena tapşırıqları və audit
              qeydlərini komandaya field-by-field payla.
            </p>
            <Link
              href="/auth/register"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-red-600 transition-colors hover:bg-red-50"
            >
              OCAQ Panel-ə keç <ArrowRight size={15} />
            </Link>
          </div>
        </aside>
      </div>

      <div className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl bg-slate-50 p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2.5">
            <BookOpen size={18} className="text-red-600" />
            <h3 className="text-lg font-bold text-slate-900">Əlaqəli məzmun</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {blogLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group block rounded-xl bg-white p-5 ring-1 ring-slate-200/70 transition-all hover:shadow-md"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">{link.tag}</span>
                <h4 className="mt-2 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-red-600">
                  {link.title}
                </h4>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-400 transition-all group-hover:gap-2 group-hover:text-red-600">
                  Bax <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
