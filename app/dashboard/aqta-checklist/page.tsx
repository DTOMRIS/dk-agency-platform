'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { normalizeLocale, type Locale } from '@/i18n/config';

type TabKey = 'daily' | 'weekly' | 'monthly';

type AdminSection = {
  id: string;
  title: string;
  owner: string;
  icon: typeof ShieldAlert;
  items: string[];
};

const pageCopy: Record<
  Locale,
  {
    badge: string;
    pageTitle: string;
    pageSubtitle: string;
    resetBtn: string;
    openToolBtn: string;
    auditProgressLabel: string;
    auditProgressItems: string;
    openRiskLabel: string;
    openRiskSub: string;
    rhythmLabel: string;
    rhythmSub: string;
    rhythmReview: string;
    sectionOwnerLabel: string;
    hygieneRhythmTitle: string;
    hygieneRhythmSub: string;
    tabDaily: string;
    tabWeekly: string;
    tabMonthly: string;
    commonFinesTitle: string;
    crossContamTitle: string;
    crossContamItems: string[];
    upsellTitle: string;
    upsellDesc: string;
    upsellLink: string;
    sections: {
      storage: { title: string; items: string[] };
      hygiene: { title: string; items: string[] };
      kitchen: { title: string; items: string[] };
      water: { title: string; items: string[] };
      prep: { title: string; items: string[] };
      docs: { title: string; items: string[] };
      hall: { title: string; items: string[] };
      allergen: { title: string; items: string[] };
    };
    routines: Record<TabKey, string[]>;
    riskReasons: string[];
  }
> = {
  az: {
    badge: 'Compliance Control',
    pageTitle: 'AQTA Hazırlıq Paneli',
    pageSubtitle: 'Admin üçün operativ gigiyena və sənədləşdirmə nəzarəti. Mock state ilə işləyir.',
    resetBtn: 'Sıfırla',
    openToolBtn: 'Public aləti aç',
    auditProgressLabel: 'Audit progress',
    auditProgressItems: 'nəzarət maddəsi tamamdır',
    openRiskLabel: 'Açıq risk',
    openRiskSub: 'Ən çox cərimə doğuran başlıq',
    rhythmLabel: 'Ritm',
    rhythmSub: 'Daily, weekly, monthly review',
    rhythmReview: 'Daily, weekly, monthly review',
    sectionOwnerLabel: 'Owner',
    hygieneRhythmTitle: 'Gigiyena ritmi',
    hygieneRhythmSub: 'Admin checklist görünüşü ilə komanda təkrarı.',
    tabDaily: 'Gündəlik',
    tabWeekly: 'Həftəlik',
    tabMonthly: 'Aylıq',
    commonFinesTitle: 'Ən yayğın cərimə səbəbləri',
    crossContamTitle: 'Cross-contamination',
    crossContamItems: ['Qırmızı: çiy ət', 'Sarı: toyuq', 'Mavi: balıq', 'Yaşıl: tərəvəz', 'Ağ: çörək və servis'],
    upsellTitle: 'OCAQ Panel upsell',
    upsellDesc:
      'Bu kontrol siyahısını field-by-field işçi bazasında tapşırıq, deadline və tarixçə ilə izləmək üçün OCAQ panel workflow-u açılmalıdır.',
    upsellLink: 'Panel setup planı',
    sections: {
      storage: {
        title: 'Ərzaq saxlama',
        items: [
          'Soyuducu +2°C ilə +6°C arasındadır',
          'Dondurucu -18°C və aşağıdır',
          'Çiy və hazır ərzaq ayrı saxlanır',
          'FIFO və tarix etiketi görünür',
        ],
      },
      hygiene: {
        title: 'Şəxsi gigiyena',
        items: [
          'Tibbi arayışlar aktualdır',
          'İş geyimi və bone standartdadır',
          'Əl yuma stansiyası işləkdir',
          'Aksesuar və siqaret qaydası tətbiq olunur',
        ],
      },
      kitchen: {
        title: 'Mətbəx gigiyenası',
        items: [
          'İş səthləri dezinfeksiya edilir',
          'Rəng kodlu taxtalar istifadə olunur',
          'Zibil qutuları qapaqlıdır',
          'Zərərverici izi görünmür',
        ],
      },
      water: {
        title: 'Su keyfiyyəti',
        items: [
          'İçməli su sistemi təhlükəsizdir',
          'Buz maşını təmizdir',
          'Buz servis qaydası pozulmur',
        ],
      },
      prep: {
        title: 'Yemək hazırlama',
        items: [
          'Toyuq 74°C daxili temperaturu keçir',
          'Hazır yemək 2 saatdan çox kənarda qalmır',
          'Yenidən qızdırma 74°C üzərinə çıxır',
          'Əlcək qaydası qorunur',
        ],
      },
      docs: {
        title: 'Sənədləşdirmə',
        items: [
          'AQTA qeydiyyatı tamdır',
          'Temperatur jurnalı doldurulur',
          'Fakturalar arxivlənir',
          'Tibbi arayış tarixləri izlənir',
        ],
      },
      hall: {
        title: 'Zal və ümumi sahələr',
        items: [
          'Tualet təmiz və tam təchizatlıdır',
          'Mətbəx qoxusu zala keçmir',
          'Ümumi sanitariya uyğun görünür',
        ],
      },
      allergen: {
        title: 'Allergen',
        items: [
          'Menyuda allergen qeyd olunub',
          'Servis heyəti allergen cavabını bilir',
          'Allergen üçün ayrıca hazırlıq qaydası var',
        ],
      },
    },
    routines: {
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
    },
    riskReasons: [
      'Tibbi arayış yoxdur',
      'Vaxtı keçmiş məhsul var',
      'Soyuducu norma xaricindədir',
      'Çiy və hazır məhsul qarışır',
      'Jurnal boşdur',
    ],
  },
  ru: {
    badge: 'Контроль соответствия',
    pageTitle: 'Панель готовности AQTA',
    pageSubtitle: 'Оперативный контроль гигиены и документации для администратора.',
    resetBtn: 'Сбросить',
    openToolBtn: 'Открыть публичный инструмент',
    auditProgressLabel: 'Прогресс аудита',
    auditProgressItems: 'пунктов выполнено',
    openRiskLabel: 'Открытый риск',
    openRiskSub: 'Наиболее частые причины штрафов',
    rhythmLabel: 'Ритм',
    rhythmSub: 'Ежедневный, еженедельный, ежемесячный',
    rhythmReview: 'Daily, weekly, monthly review',
    sectionOwnerLabel: 'Ответственный',
    hygieneRhythmTitle: 'Ритм гигиены',
    hygieneRhythmSub: 'Повторение команды с просмотром чек-листа администратора.',
    tabDaily: 'Ежедневно',
    tabWeekly: 'Еженедельно',
    tabMonthly: 'Ежемесячно',
    commonFinesTitle: 'Частые причины штрафов',
    crossContamTitle: 'Перекрёстное загрязнение',
    crossContamItems: [
      'Красный: сырое мясо',
      'Жёлтый: курица',
      'Синий: рыба',
      'Зелёный: овощи',
      'Белый: хлеб и сервировка',
    ],
    upsellTitle: 'Апсейл панели OCAQ',
    upsellDesc:
      'Для отслеживания этого чек-листа по полям с заданиями, дедлайнами и историей необходимо открыть workflow панели OCAQ.',
    upsellLink: 'План настройки панели',
    sections: {
      storage: {
        title: 'Хранение продуктов',
        items: [
          'Холодильник между +2°C и +6°C',
          'Морозильник -18°C и ниже',
          'Сырые и готовые продукты хранятся отдельно',
          'Видна маркировка FIFO и сроков',
        ],
      },
      hygiene: {
        title: 'Личная гигиена',
        items: [
          'Медицинские справки актуальны',
          'Рабочая одежда и головной убор соответствуют стандартам',
          'Станция мытья рук работает',
          'Соблюдаются правила об аксессуарах и курении',
        ],
      },
      kitchen: {
        title: 'Гигиена кухни',
        items: [
          'Рабочие поверхности дезинфицированы',
          'Используются цветные разделочные доски',
          'Мусорные баки закрыты крышками',
          'Следов вредителей нет',
        ],
      },
      water: {
        title: 'Качество воды',
        items: [
          'Система питьевой воды безопасна',
          'Льдогенератор чист',
          'Правила подачи льда соблюдаются',
        ],
      },
      prep: {
        title: 'Приготовление пищи',
        items: [
          'Курица достигает внутренней температуры 74°C',
          'Готовая еда не остаётся снаружи более 2 часов',
          'Повторный разогрев выше 74°C',
          'Правила использования перчаток соблюдаются',
        ],
      },
      docs: {
        title: 'Документация',
        items: [
          'Регистрация AQTA завершена',
          'Журнал температур заполняется',
          'Счета архивируются',
          'Даты медицинских справок отслеживаются',
        ],
      },
      hall: {
        title: 'Зал и общие зоны',
        items: [
          'Туалет чистый и полностью оснащён',
          'Запах кухни не проникает в зал',
          'Общая санитария соответствует нормам',
        ],
      },
      allergen: {
        title: 'Аллергены',
        items: [
          'Аллергены указаны в меню',
          'Персонал знает ответы об аллергенах',
          'Есть отдельный протокол приготовления для аллергенов',
        ],
      },
    },
    routines: {
      daily: [
        'Заполнить журнал температур',
        'Проверить станции мытья рук и мыла',
        'Сканировать FIFO и сроки годности',
        'Проверить поверхности и мусор при закрытии',
      ],
      weekly: [
        'Глубокая чистка холодильников',
        'Проверить разделочные доски и фильтры вентиляции',
        'Проверить точки риска по вредителям',
      ],
      monthly: [
        'Обновить медицинские справки и документы',
        'Провести 15-минутный гигиенический инструктаж',
        'Выбрать тестовые документы отслеживаемости из архива',
      ],
    },
    riskReasons: [
      'Нет медицинской справки',
      'Просроченные продукты',
      'Холодильник вне нормы',
      'Смешение сырых и готовых продуктов',
      'Журнал пустой',
    ],
  },
  en: {
    badge: 'Compliance Control',
    pageTitle: 'AQTA Readiness Dashboard',
    pageSubtitle: 'Operative hygiene and documentation control for admins. Works with mock state.',
    resetBtn: 'Reset',
    openToolBtn: 'Open Public Tool',
    auditProgressLabel: 'Audit progress',
    auditProgressItems: 'control items completed',
    openRiskLabel: 'Open risk',
    openRiskSub: 'Most common penalty-triggering items',
    rhythmLabel: 'Rhythm',
    rhythmSub: 'Daily, weekly, monthly review',
    rhythmReview: 'Daily, weekly, monthly review',
    sectionOwnerLabel: 'Owner',
    hygieneRhythmTitle: 'Hygiene rhythm',
    hygieneRhythmSub: 'Team repetition with admin checklist view.',
    tabDaily: 'Daily',
    tabWeekly: 'Weekly',
    tabMonthly: 'Monthly',
    commonFinesTitle: 'Most common penalty reasons',
    crossContamTitle: 'Cross-contamination',
    crossContamItems: [
      'Red: raw meat',
      'Yellow: poultry',
      'Blue: fish',
      'Green: vegetables',
      'White: bread and service',
    ],
    upsellTitle: 'OCAQ Panel upsell',
    upsellDesc:
      'To track this checklist field-by-field with tasks, deadlines, and history in the staff base, the OCAQ panel workflow must be activated.',
    upsellLink: 'Panel setup plan',
    sections: {
      storage: {
        title: 'Food storage',
        items: [
          'Refrigerator between +2°C and +6°C',
          'Freezer at -18°C or below',
          'Raw and ready food stored separately',
          'FIFO and date labels visible',
        ],
      },
      hygiene: {
        title: 'Personal hygiene',
        items: [
          'Medical certificates are up to date',
          'Work uniform and hairnet meet standards',
          'Handwashing station is operational',
          'Accessory and smoking rules are enforced',
        ],
      },
      kitchen: {
        title: 'Kitchen hygiene',
        items: [
          'Work surfaces are disinfected',
          'Color-coded cutting boards in use',
          'Trash bins have lids',
          'No signs of pests',
        ],
      },
      water: {
        title: 'Water quality',
        items: [
          'Drinking water system is safe',
          'Ice machine is clean',
          'Ice service rules are followed',
        ],
      },
      prep: {
        title: 'Food preparation',
        items: [
          'Chicken reaches internal temperature of 74°C',
          'Ready food not left out for more than 2 hours',
          'Reheating above 74°C',
          'Glove rules are observed',
        ],
      },
      docs: {
        title: 'Documentation',
        items: [
          'AQTA registration is complete',
          'Temperature log is filled',
          'Invoices are archived',
          'Medical certificate dates are tracked',
        ],
      },
      hall: {
        title: 'Hall and common areas',
        items: [
          'Restroom is clean and fully equipped',
          'Kitchen smell does not enter the hall',
          'General sanitation appears compliant',
        ],
      },
      allergen: {
        title: 'Allergens',
        items: [
          'Allergens noted in menu',
          'Service staff knows allergen responses',
          'Separate preparation protocol for allergens',
        ],
      },
    },
    routines: {
      daily: [
        'Fill the temperature log',
        'Check handwashing and soap stations',
        'Scan FIFO and expiry dates',
        'Audit surfaces and trash at closing',
      ],
      weekly: [
        'Deep clean refrigerators',
        'Check cutting boards and ventilation filters',
        'Audit pest risk points',
      ],
      monthly: [
        'Update medical certificates and document dates',
        'Run a 15-minute hygiene refresher for the team',
        'Test-pull traceability documents from archive',
      ],
    },
    riskReasons: [
      'No medical certificate',
      'Expired products',
      'Refrigerator out of range',
      'Raw and ready products mixed',
      'Log is empty',
    ],
  },
  tr: {
    badge: 'Uyumluluk Kontrolü',
    pageTitle: 'AQTA Hazırlık Paneli',
    pageSubtitle: 'Yönetici için operatif hijyen ve belgelendirme denetimi. Mock state ile çalışır.',
    resetBtn: 'Sıfırla',
    openToolBtn: 'Genel aracı aç',
    auditProgressLabel: 'Denetim ilerlemesi',
    auditProgressItems: 'denetim maddesi tamamlandı',
    openRiskLabel: 'Açık risk',
    openRiskSub: 'En çok ceza gerektiren başlık',
    rhythmLabel: 'Ritim',
    rhythmSub: 'Günlük, haftalık, aylık inceleme',
    rhythmReview: 'Günlük, haftalık, aylık inceleme',
    sectionOwnerLabel: 'Sorumlu',
    hygieneRhythmTitle: 'Hijyen ritmi',
    hygieneRhythmSub: 'Yönetici kontrol listesi görünümüyle ekip tekrarı.',
    tabDaily: 'Günlük',
    tabWeekly: 'Haftalık',
    tabMonthly: 'Aylık',
    commonFinesTitle: 'En yaygın ceza nedenleri',
    crossContamTitle: 'Çapraz bulaşma',
    crossContamItems: ['Kırmızı: çiğ et', 'Sarı: tavuk', 'Mavi: balık', 'Yeşil: sebze', 'Beyaz: ekmek ve servis'],
    upsellTitle: 'OCAQ Panel üst satış',
    upsellDesc:
      'Bu kontrol listesini çalışan bazında alan alan görevler, son tarihler ve geçmişle izlemek için OCAQ panel iş akışı açılmalıdır.',
    upsellLink: 'Panel kurulum planı',
    sections: {
      storage: {
        title: 'Gıda depolama',
        items: [
          'Buzdolabı +2°C ile +6°C arasında',
          'Dondurucu -18°C ve altında',
          'Çiğ ve hazır gıda ayrı saklanıyor',
          'FIFO ve tarih etiketi görünür',
        ],
      },
      hygiene: {
        title: 'Kişisel hijyen',
        items: [
          'Sağlık sertifikaları güncel',
          'İş kıyafeti ve bone standartlarda',
          'El yıkama istasyonu çalışıyor',
          'Aksesuar ve sigara kuralı uygulanıyor',
        ],
      },
      kitchen: {
        title: 'Mutfak hijyeni',
        items: [
          'Çalışma yüzeyleri dezenfekte ediliyor',
          'Renk kodlu kesme tahtaları kullanılıyor',
          'Çöp kutuları kapaklı',
          'Haşere izi görünmüyor',
        ],
      },
      water: {
        title: 'Su kalitesi',
        items: [
          'İçme suyu sistemi güvenli',
          'Buz makinesi temiz',
          'Buz servis kuralı uygulanıyor',
        ],
      },
      prep: {
        title: 'Yemek hazırlama',
        items: [
          'Tavuk 74°C iç sıcaklığına ulaşıyor',
          'Hazır yemek 2 saatten fazla dışarıda kalmıyor',
          'Yeniden ısıtma 74°C üzerine çıkıyor',
          'Eldiven kuralı uygulanıyor',
        ],
      },
      docs: {
        title: 'Belgelendirme',
        items: [
          'AQTA kaydı tamamlandı',
          'Sıcaklık günlüğü dolduruluyor',
          'Faturalar arşivleniyor',
          'Sağlık sertifikası tarihleri takip ediliyor',
        ],
      },
      hall: {
        title: 'Salon ve ortak alanlar',
        items: [
          'Tuvalet temiz ve tam donanımlı',
          'Mutfak kokusu salona geçmiyor',
          'Genel sanitasyon uygun görünüyor',
        ],
      },
      allergen: {
        title: 'Alerjen',
        items: [
          'Menüde alerjen belirtilmiş',
          'Servis ekibi alerjen sorularını biliyor',
          'Alerjen için ayrı hazırlık protokolü var',
        ],
      },
    },
    routines: {
      daily: [
        'Sıcaklık günlüğünü doldur',
        'El yıkama ve sabun istasyonlarını kontrol et',
        'FIFO ve son tarihleri tara',
        'Kapanışta yüzeyleri ve çöpü denetle',
      ],
      weekly: [
        'Buzdolaplarını derin temizle',
        'Kesme tahtalarını ve havalandırma filtrelerini kontrol et',
        'Haşere risk noktalarını denetle',
      ],
      monthly: [
        'Sağlık sertifikası ve belge tarihlerini güncelle',
        'Ekibe 15 dakikalık hijyen tazeleme yap',
        'Arşivden izlenebilirlik belgelerini test olarak çıkar',
      ],
    },
    riskReasons: [
      'Sağlık sertifikası yok',
      'Süresi geçmiş ürün var',
      'Buzdolabı norm dışında',
      'Çiğ ve hazır ürün karışıyor',
      'Günlük boş',
    ],
  },
};

const SECTION_IDS = ['storage', 'hygiene', 'kitchen', 'water', 'prep', 'docs', 'hall', 'allergen'] as const;
type SectionId = (typeof SECTION_IDS)[number];

const SECTION_OWNERS: Record<SectionId, string> = {
  storage: 'Sous chef',
  hygiene: 'Shift manager',
  kitchen: 'Kitchen lead',
  water: 'Operations',
  prep: 'Chef',
  docs: 'Admin',
  hall: 'Front-of-house',
  allergen: 'Service lead',
};

const SECTION_ICONS: Record<SectionId, typeof ShieldAlert> = {
  storage: Soup,
  hygiene: Users,
  kitchen: Utensils,
  water: Droplets,
  prep: Flame,
  docs: WalletCards,
  hall: Waves,
  allergen: ShieldAlert,
};

export default function DashboardAqtaChecklistPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const sections: AdminSection[] = SECTION_IDS.map((id) => ({
    id,
    title: copy.sections[id].title,
    owner: SECTION_OWNERS[id],
    icon: SECTION_ICONS[id],
    items: copy.sections[id].items,
  }));

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [openSection, setOpenSection] = useState<string>(sections[0].id);
  const [tab, setTab] = useState<TabKey>('daily');

  const totalItems = useMemo(
    () => sections.reduce((sum, section) => sum + section.items.length, 0),
    [sections]
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
            {copy.badge}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{copy.pageTitle}</h1>
          <p className="mt-1 text-sm text-gray-500">{copy.pageSubtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RefreshCcw size={16} />
            {copy.resetBtn}
          </button>
          <Link
            href="/toolkit/aqta-checklist"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            {copy.openToolBtn}
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:col-span-2">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            {copy.auditProgressLabel}
          </div>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-black text-red-600">{progress}%</div>
            <div className="pb-1 text-sm text-gray-500">
              {checked.size}/{totalItems} {copy.auditProgressItems}
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
            {copy.openRiskLabel}
          </div>
          <div className="text-3xl font-black text-red-600">{copy.riskReasons.length}</div>
          <div className="mt-1 text-xs text-gray-500">{copy.openRiskSub}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            {copy.rhythmLabel}
          </div>
          <div className="text-3xl font-black text-gray-900">3</div>
          <div className="mt-1 text-xs text-gray-500">{copy.rhythmSub}</div>
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
                        <p className="mt-1 text-xs text-gray-500">{copy.sectionOwnerLabel}: {section.owner}</p>
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
                <h2 className="text-lg font-bold text-gray-900">{copy.hygieneRhythmTitle}</h2>
                <p className="text-sm text-gray-500">{copy.hygieneRhythmSub}</p>
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
                  {item === 'daily' ? copy.tabDaily : item === 'weekly' ? copy.tabWeekly : copy.tabMonthly}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {copy.routines[tab].map((item, index) => (
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
              <h2 className="font-bold text-gray-900">{copy.commonFinesTitle}</h2>
            </div>
            <div className="space-y-3">
              {copy.riskReasons.map((reason) => (
                <div key={reason} className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900">
                  {reason}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardCheck size={18} className="text-red-600" />
              <h2 className="font-bold text-gray-900">{copy.crossContamTitle}</h2>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              {copy.crossContamItems.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-6 text-white">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-red-300" />
              <h2 className="font-bold">{copy.upsellTitle}</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{copy.upsellDesc}</p>
            <Link
              href="/auth/register"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-300 hover:text-red-200"
            >
              {copy.upsellLink} <ArrowRight size={14} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
