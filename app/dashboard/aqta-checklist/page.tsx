'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Droplets,
  FileCheck2,
  Flame,
  Gauge,
  Shield,
  Sparkles,
  SprayCan,
  TimerReset,
  UtensilsCrossed,
  Users,
} from 'lucide-react';

type RoutineTab = 'daily' | 'weekly' | 'monthly';

type ChecklistItem = {
  id: string;
  label: string;
};

type Section = {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  items: ChecklistItem[];
};

const SECTIONS: Section[] = [
  {
    title: 'Ərzaq saxlama',
    subtitle: 'Soyuq zəncir, FIFO və temperatur intizamı',
    icon: Droplets,
    items: [
      { id: 'storage-1', label: 'Soyuducu +2°C ilə +6°C arasında saxlanır' },
      { id: 'storage-2', label: 'Dondurucu -18°C və aşağıda işləyir' },
      { id: 'storage-3', label: 'Çiy və hazır ərzaq ayrı rəflərdədir' },
      { id: 'storage-4', label: 'Ərzaqlar yerdən 15-20 sm yuxarıdadır' },
      { id: 'storage-5', label: 'FIFO və tarix etiketləri izlənir' },
      { id: 'storage-6', label: 'Vaxtı keçmiş məhsul anbarı yoxdur' },
    ],
  },
  {
    title: 'Şəxsi gigiyena',
    subtitle: 'Komanda intizamı və tibbi uyğunluq',
    icon: Users,
    items: [
      { id: 'personal-1', label: 'Aktual tibbi arayışlar mövcuddur' },
      { id: 'personal-2', label: 'İş geyimi təmiz və açıq rəngdədir' },
      { id: 'personal-3', label: 'Bone və baş örtüyü istifadə olunur' },
      { id: 'personal-4', label: 'Əl yuma stansiyası sabun və quruducu ilə hazırdır' },
      { id: 'personal-5', label: 'Uzun dırnaq, zərgərlik və lak qadağası izlənir' },
      { id: 'personal-6', label: 'Mətbəx və saxlama zonasında siqaret yoxdur' },
    ],
  },
  {
    title: 'Mətbəx gigiyenası',
    subtitle: 'İş səthləri, rəng kodları və zibil axını',
    icon: SprayCan,
    items: [
      { id: 'kitchen-1', label: 'Kəsmə taxtaları hər istifadədən sonra təmizlənir' },
      { id: 'kitchen-2', label: 'Rəng kodlu taxtalar ayrı saxlanılır' },
      { id: 'kitchen-3', label: 'Zibil qutuları qapaqlı və pedallıdır' },
      { id: 'kitchen-4', label: 'Səthlərdə yağ, qalıq və çirk yığılmır' },
      { id: 'kitchen-5', label: 'Zərərverici izi yoxdur' },
      { id: 'kitchen-6', label: 'Əlcəklər çiy və bişmiş məhsul arasında dəyişdirilir' },
    ],
  },
  {
    title: 'Su keyfiyyəti',
    subtitle: 'İçməli su, buz və təmiz axın',
    icon: Droplets,
    items: [
      { id: 'water-1', label: 'Şəbəkə suyu filtrdən keçir' },
      { id: 'water-2', label: 'Buz maşını təmizlənir və izlənir' },
      { id: 'water-3', label: 'Buz əl ilə deyil, alətlə götürülür' },
      { id: 'water-4', label: 'Suyun qoxu və bulanıqlıq problemi yoxdur' },
    ],
  },
  {
    title: 'Yemək hazırlama',
    subtitle: 'Temperatur və təhlükəsiz saxlanma rejimi',
    icon: Flame,
    items: [
      { id: 'prep-1', label: 'Toyuq minimum 74°C daxili temperaturda bişirilir' },
      { id: 'prep-2', label: 'Mal əti uyğun daxili temperaturla çıxarılır' },
      { id: 'prep-3', label: 'Hazır yemək 2 saatdan çox otaq temperaturunda qalmır' },
      { id: 'prep-4', label: 'Yenidən qızdırma 74°C səviyyəsinə çatır' },
      { id: 'prep-5', label: 'Termometr istifadə qaydası komanda tərəfindən bilinir' },
    ],
  },
  {
    title: 'Sənədləşdirmə',
    subtitle: 'Audit, izlenebilirlik və jurnal intizamı',
    icon: FileCheck2,
    items: [
      { id: 'docs-1', label: 'AQTA qeydiyyatı tamamlanıb' },
      { id: 'docs-2', label: 'Gündəlik temperatur jurnalı doldurulur' },
      { id: 'docs-3', label: 'Təmizlik jurnalı saxlanır' },
      { id: 'docs-4', label: 'Ərzaq mənbəyi faktura və qəbzlə izlənir' },
      { id: 'docs-5', label: 'Tibbi arayışların tarixləri nəzarətdədir' },
    ],
  },
  {
    title: 'Zal və ümumi sahələr',
    subtitle: 'Tualet, havalandırma və görünən nizam',
    icon: UtensilsCrossed,
    items: [
      { id: 'hall-1', label: 'Tualet təmiz və tam təchizatlıdır' },
      { id: 'hall-2', label: 'Havalandırma qoxu daşımır' },
      { id: 'hall-3', label: 'Giriş və zal sanitariya baxımından uyğundur' },
      { id: 'hall-4', label: 'Döşəmə və divar səthləri təmiz saxlanır' },
    ],
  },
  {
    title: 'Allergen',
    subtitle: 'Menyu üzərində riskli maddələrin işarəsi',
    icon: AlertTriangle,
    items: [
      { id: 'allergen-1', label: 'Menyuda allergen məlumatı göstərilir' },
      { id: 'allergen-2', label: 'Süd, gluten, yumurta və qoz işarələnib' },
      { id: 'allergen-3', label: 'Server allergen sualına cavab verə bilir' },
      { id: 'allergen-4', label: 'Çarpaz kontaminasiya protokolu yazılıb' },
    ],
  },
];

const ROUTINES: Record<RoutineTab, string[]> = {
  daily: [
    'Soyuducu və dondurucu temperaturunu yoxla',
    'İş səthlərini və əl yuma zonalarını dezinfeksiya et',
    'FIFO və son istifadə tarixlərini gözdən keçir',
    'Zibil qutularını boşalt və qapaqları yoxla',
    'İş geyimləri və bone intizamını təsdiqlə',
  ],
  weekly: [
    'Soyuducu içini tam təmizlə',
    'Zərərverici nəzarəti üçün küncləri yoxla',
    'Kəsmə taxtalarında çat və deformasiya olub-olmadığını bax',
    'Havalandırma filtrini təmizlə',
    'Tualet sanitariya auditini apar',
  ],
  monthly: [
    'Tibbi arayış tarixlərini yenilə',
    'Ərzaq mənbəyi sənədlərini arxivlə',
    'Avadanlıq xidmət statusunu yoxla',
    'Komandaya qısa gigiyena refresher keç',
    'Pest control xidmətini planla',
  ],
};

const COMMON_FINES = [
  'Tibbi arayışların olmaması',
  'Vaxtı keçmiş ərzaq',
  'Soyuducu temperaturunun normadan kənar olması',
  'Çiy və hazır ərzağın birlikdə saxlanması',
  'Əl yuma imkanının olmaması',
  'Gigiyena jurnalının aparılmaması',
  'Zərərverici izi',
  'Ərzaq mənbəyi sənədlərinin olmaması',
  'Uyğunsuz iş geyimi',
  'Tualet sanitariya problemi',
];

const CROSS_CONTAMINATION = [
  { color: 'bg-red-500', label: 'Qırmızı', desc: 'Çiy ət' },
  { color: 'bg-green-500', label: 'Yaşıl', desc: 'Tərəvəz' },
  { color: 'bg-yellow-500', label: 'Sarı', desc: 'Toyuq' },
  { color: 'bg-blue-500', label: 'Mavi', desc: 'Balıq' },
];

export default function AqtaChecklistAdminPage() {
  const [openSection, setOpenSection] = useState(0);
  const [activeRoutine, setActiveRoutine] = useState<RoutineTab>('daily');
  const [checked, setChecked] = useState<Set<string>>(new Set(['storage-1', 'personal-1']));

  const totalItems = useMemo(() => SECTIONS.reduce((sum, section) => sum + section.items.length, 0), []);
  const completedItems = checked.size;
  const progress = Math.round((completedItems / totalItems) * 100);

  const toggleItem = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetAll = () => setChecked(new Set());

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-red-700">
            <Shield size={12} />
            AQTA Admin
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AQTA Hazırlıq və Review Paneli</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Gigiyena, sənədləşdirmə və yoxlama intizamını bir yerdə izləyin. Bu ekran operativ review üçündür, public toolkit deyil.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetAll}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <TimerReset size={16} />
            Sıfırla
          </button>
          <Link
            href="/blog/aqta-cerime-checklist"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            <BookOpen size={16} />
            Blog referansı
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">İrəliləyiş</p>
                <h2 className="text-lg font-bold text-gray-900">
                  {completedItems}/{totalItems} maddə tamamlandı
                </h2>
              </div>
              <div className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                {progress}% hazır
              </div>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-red-600">Risk zonası</p>
                <p className="mt-1 text-2xl font-black text-red-700">{totalItems - completedItems}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Hazır maddə</p>
                <p className="mt-1 text-2xl font-black text-emerald-700">{completedItems}</p>
              </div>
              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">İzləmə rejimi</p>
                <p className="mt-1 text-sm font-bold text-slate-900">Sahə + sənəd + tarix</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {SECTIONS.map((section, sectionIndex) => {
              const Icon = section.icon;
              const done = section.items.filter((item) => checked.has(item.id)).length;
              const isOpen = openSection === sectionIndex;

              return (
                <div key={section.title} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <button
                    onClick={() => setOpenSection(isOpen ? -1 : sectionIndex)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                      <Icon size={20} className="text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900">{section.title}</h3>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                          {done}/{section.items.length}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{section.subtitle}</p>
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 py-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {section.items.map((item) => {
                          const isDone = checked.has(item.id);

                          return (
                            <button
                              key={item.id}
                              onClick={() => toggleItem(item.id)}
                              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                                isDone
                                  ? 'border-emerald-200 bg-emerald-50'
                                  : 'border-gray-200 bg-white hover:border-red-200 hover:bg-red-50/40'
                              }`}
                            >
                              <span
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                                  isDone
                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                    : 'border-gray-300 bg-white'
                                }`}
                              >
                                {isDone && <CheckCircle2 size={12} />}
                              </span>
                              <span className={`text-sm font-medium ${isDone ? 'text-emerald-900' : 'text-gray-800'}`}>
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Gauge size={18} className="text-red-600" />
              <h2 className="text-lg font-bold text-gray-900">Gigiyena rejimi</h2>
            </div>
            <div className="mb-4 flex gap-2">
              {(['daily', 'weekly', 'monthly'] as RoutineTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveRoutine(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    activeRoutine === tab ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'daily' ? 'Gündəlik' : tab === 'weekly' ? 'Həftəlik' : 'Aylıq'}
                </button>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {ROUTINES[activeRoutine].map((task) => (
                <div key={task} className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                  <ClipboardCheck size={16} className="mt-0.5 text-red-600" />
                  <p className="text-sm text-gray-700">{task}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-red-600" />
              <h2 className="text-lg font-bold text-gray-900">AQTA nədir?</h2>
            </div>
            <p className="text-sm leading-6 text-gray-600">
              Azərbaycan Qida Təhlükəsizliyi Agentliyi qida təhlükəsizliyi, gigiyena və sənədləşdirmə
              intizamına baxır. Yoxlama qısa, konkret və sənəd əsaslı olur.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" />
              <h2 className="text-lg font-bold text-gray-900">Ən yayğın 10 cərimə səbəbi</h2>
            </div>
            <ol className="space-y-2 text-sm text-gray-700">
              {COMMON_FINES.map((item, index) => (
                <li key={item} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Shield size={18} className="text-red-600" />
              <h2 className="text-lg font-bold text-gray-900">Cross-contamination</h2>
            </div>
            <p className="text-sm leading-6 text-gray-600">
              Çarpaz kontaminasiya çiy məhsuldan hazır yeməyə bakteriya keçməsidir. Ən praktik qorunma
              rəng kodlu taxtalar, ayrıca alətlər və əl dəyişmə intizamıdır.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {CROSS_CONTAMINATION.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                  <span className={`h-3 w-3 rounded-full ${item.color}`} />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-red-600" />
              <h2 className="text-lg font-bold text-gray-900">DK Agency məsləhəti</h2>
            </div>
            <p className="text-sm leading-6 text-gray-700">
              Bu işi cərimə sonrası yox, açılışdan əvvəl sistemləşdirin. Gündəlik temperatur, aylıq sənəd
              təzələnməsi və məsul şəxs üzrə audit xətti yaradın.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <ClipboardCheck size={18} className="text-red-400" />
              <h2 className="text-lg font-bold">OCAQ Panel</h2>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              AQTA, gigiyena və açılış yoxlamalarını bir paneldə izləmək üçün əməliyyat qovşağı.
              Sənəd, foto və məsuliyyət axınını bir yerdə saxla.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 transition-transform hover:scale-[1.01]"
            >
              Panelə bax
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-red-600" />
              <h2 className="text-lg font-bold text-gray-900">Blog referansı</h2>
            </div>
            <p className="text-sm text-gray-600">
              Public izah və müştəri yönümlü versiya üçün əsas yazı ilə sinxron saxla.
            </p>
            <Link
              href="/blog/aqta-cerime-checklist"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700"
            >
              aqta-cerime-checklist
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
