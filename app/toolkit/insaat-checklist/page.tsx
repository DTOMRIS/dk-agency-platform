'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Cpu,
  HardHat,
  Lightbulb,
  Paintbrush,
  PartyPopper,
  RotateCcw,
  Video,
} from 'lucide-react';
import { isVideo, resizeImage, validateFile } from '@/lib/utils/image-resize';

type Item = {
  id: number;
  text: string;
  detail: string;
};

type Phase = {
  key: string;
  title: string;
  subtitle: string;
  duration: string;
  icon: typeof HardHat;
  accent: string;
  bg: string;
  items: Item[];
};

type MediaItem = {
  itemId: number;
  name: string;
  type: 'image' | 'video';
  url: string;
};

const STORAGE_KEY = 'dk-insaat-checklist-v2';

const PHASES: Phase[] = [
  {
    key: 'prep',
    title: 'Ön Hazırlıq',
    subtitle: 'İnşaata başlamadan əvvəl sənəd və texniki riskləri bağla',
    duration: '2-4 həftə',
    icon: AlertTriangle,
    accent: 'text-amber-600',
    bg: 'bg-amber-50',
    items: [
      { id: 1, text: '3 faza elektrik yoxlaması', detail: 'Azərişıq texniki yoxlaması alınmadan tikintiyə başlama.' },
      { id: 2, text: 'Qaz xətti uyğunluğu', detail: 'Təbii qaz xətti və güc tələbi büdcəyə daxil edilsin.' },
      { id: 3, text: 'Su və kanalizasiya nöqtələri', detail: 'Mətbəx planı ilə uyğun olub-olmadığını təsdiqlə.' },
      { id: 4, text: 'Baca çıxış nöqtəsi', detail: 'Komşu və bina riski yoxlanmadan qərar vermə.' },
      { id: 5, text: 'Tavan hündürlüyü ölçüsü', detail: 'Asma tavan və havalandırma üçün minimum boşluq qalmalıdır.' },
      { id: 6, text: 'Obyekt kodu və köhnə borclar', detail: 'Vergi və DSMF riski əvvəlcədən aydınlaşdırılsın.' },
      { id: 7, text: 'Texniki layihə planı', detail: 'Zal, mətbəx, anbar və tualet zonaları dəqiq çəkilsin.' },
      { id: 8, text: 'İnşaat büdcəsi + 15% ehtiyat fond', detail: 'Kaba, incə işlər və gözlənilməz xərclər ayrı göstərilsin.' },
      { id: 9, text: 'Podratçı seçimi', detail: 'Minimum 3 təklif müqayisə olunmadan seçim etmə.' },
      { id: 10, text: 'Yazılı müqavilə', detail: 'Vaxt, material, cərimə və təhvil şərtləri qeyd edilsin.' },
      { id: 11, text: 'AQTA qeydiyyat hazırlığı', detail: 'Sənədlər paralel yığılsın, sona saxlanmasın.' },
      { id: 12, text: 'FHN müraciəti', detail: 'Yanğın təhlükəsizliyi tələbləri layihəyə erkən daxil edilsin.' },
    ],
  },
  {
    key: 'rough',
    title: 'Kaba İşlər',
    subtitle: 'Skelet yanlış qurularsa sonrakı hər şey bahalaşır',
    duration: '3-6 həftə',
    icon: HardHat,
    accent: 'text-sky-600',
    bg: 'bg-sky-50',
    items: [
      { id: 13, text: 'Sökmə işləri', detail: 'Köhnə divar, döşəmə və asma tavan tam təmizlənsin.' },
      { id: 14, text: 'Yeni divar bölgüsü', detail: 'Mətbəx, zal, anbar və tualet axınına uyğun tikilsin.' },
      { id: 15, text: 'Su xəttinin çəkilməsi', detail: 'Lavabo, qabyuyan və istehsal stansiyaları üçün ayrıca nöqtələr qur.' },
      { id: 16, text: 'Kanalizasiya və yağ tutucu', detail: 'Grease trap mətbəx yükünə uyğun seçilsin.' },
      { id: 17, text: 'Elektrik xətləri', detail: 'Mətbəx, zal və işıq üçün ayrılmış xətt planı olsun.' },
      { id: 18, text: 'Qaz xətti montajı', detail: 'Propan deyil, mümkün olduqda təbii qaz üstün tutulur.' },
      { id: 19, text: 'Havalandırma kanalları', detail: 'Mətbəx və zal sistemi bir-birindən ayrılmalıdır.' },
      { id: 20, text: 'Baca və filtr sistemi', detail: 'Baca çıxışı və yağ filtri FHN tələbinə uyğun olsun.' },
      { id: 21, text: 'Mətbəx döşəməsi bazası', detail: 'Sürüşməyən, yuyula bilən material seç.' },
      { id: 22, text: 'Tavan konstruksiyası', detail: 'İşıq və vent xəritəsi əvvəlcədən ölçülsün.' },
      { id: 23, text: 'Yanğın söndürmə sistemi', detail: 'Sprinkler və ya uyğun həll əvvəlcədən quraşdırılsın.' },
      { id: 24, text: 'Səs və istilik izolyasiyası', detail: 'Komşu şikayəti sonradan ən bahalı problemdir.' },
    ],
  },
  {
    key: 'finish',
    title: 'İncə İşlər',
    subtitle: 'Müştərinin gördüyü hissə burada formalaşır',
    duration: '3-5 həftə',
    icon: Paintbrush,
    accent: 'text-violet-600',
    bg: 'bg-violet-50',
    items: [
      { id: 25, text: 'Divar boyası və örtük', detail: 'Konsept və işıqla uyğun palitranı seç.' },
      { id: 26, text: 'Zal və mətbəx döşəmə örtüyü', detail: 'Mətbəxdə anti-slip, zalda təcrübəyə uyğun material istifadə et.' },
      { id: 27, text: 'Asma tavan montajı', detail: 'Servis nöqtələri və texniki baxım çıxışları unudulmasın.' },
      { id: 28, text: 'İşıqlandırma ssenarisi', detail: 'Gündüz və axşam üçün dimmer planı qur.' },
      { id: 29, text: 'Kondisioner zonaları', detail: 'Zal, mətbəx və anbar ayrıca idarə olunsun.' },
      { id: 30, text: 'Tualet remontu', detail: 'Müştəri və işçi axını mümkün qədər ayrı saxlanılsın.' },
      { id: 31, text: 'Bar və kassa nöqtəsi', detail: 'POS, printer və pul axını üçün praktik yerləşim seç.' },
      { id: 32, text: 'Giriş və vitrin dizaynı', detail: 'İlk 3 saniyəlik təəssürat burada yaranır.' },
      { id: 33, text: 'Tabela planı', detail: 'ADRA icazəsi və görünürlük birlikdə nəzərə alınsın.' },
      { id: 34, text: 'Mebel yerləşimi', detail: 'Keçid sahələri daralmadan oturma sayı optimallaşdırılsın.' },
      { id: 35, text: 'Dekor və aksentlər', detail: 'Konseptə xidmət etməyən hər detalı çıxar.' },
      { id: 36, text: 'Musiqi sistemi', detail: 'Zona səsi və lisenziya xərci əvvəlcədən planlansın.' },
    ],
  },
  {
    key: 'equipment',
    title: 'Avadanlıq və Texnologiya',
    subtitle: 'Bütün xərci bir gündə etmə, amma test etmədən də qəbul etmə',
    duration: '1-2 həftə',
    icon: Cpu,
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50',
    items: [
      { id: 37, text: 'Sənaye sobası və ocaq', detail: 'Qaz və ya elektrik gücü testlə təsdiqlənsin.' },
      { id: 38, text: 'Soyuducu quraşdırılması', detail: '24 saat sınaq aparmadan təhvil alma.' },
      { id: 39, text: 'Dondurucu testi', detail: '-18°C stabil işləməsi təsdiqlənsin.' },
      { id: 40, text: 'Qabyuyan maşın', detail: 'Su, drenaj və servis çıxışı rahat olsun.' },
      { id: 41, text: 'Paslanmaz hazırlıq masaları', detail: 'Gigiyena və iş axını üçün ölçü uyğun seçilsin.' },
      { id: 42, text: 'POS sistemi', detail: 'Kassa, printer və planşetlər açılışdan əvvəl canlı test edilsin.' },
      { id: 43, text: 'Sabit internet və Wi-Fi', detail: 'POS üçün ayrıca stabil xətt vacibdir.' },
      { id: 44, text: 'Kamera sistemi', detail: 'Kassa, giriş və mətbəx ən azı 4 nöqtə ilə izlənilsin.' },
      { id: 45, text: 'Siqnalizasiya', detail: 'Bağlanış proseduru ilə birlikdə yoxlanılsın.' },
    ],
  },
  {
    key: 'launch',
    title: 'Açılış Hazırlığı',
    subtitle: 'Soft opening etməyən restoran problemi canlı müştəridə görür',
    duration: '1-2 həftə',
    icon: PartyPopper,
    accent: 'text-rose-600',
    bg: 'bg-rose-50',
    items: [
      { id: 46, text: 'AQTA son yoxlaması', detail: 'Gigiyena, jurnal və saxlama standartları tamam olsun.' },
      { id: 47, text: 'FHN son yoxlaması', detail: 'Çıxışlar və yanğın avadanlığı son dəfə təsdiqlənsin.' },
      { id: 48, text: 'Komandanın işə qəbulu', detail: 'Tibbi arayışlar və sənədlər tam yığılsın.' },
      { id: 49, text: 'Təlim dövrü', detail: 'Menyu, servis, POS və gigiyena üçün minimum 1 həftə ayır.' },
      { id: 50, text: 'Soft opening', detail: 'Dostlar və ailə ilə 3-5 günlük real test et.' },
      { id: 51, text: 'Menyu son yoxlaması', detail: 'Qiymət, food cost və çap dizaynı bağlansın.' },
      { id: 52, text: 'Grand opening planı', detail: 'Marketinq, dəvətlilər və əməliyyat komandası eyni təqvimdə olsun.' },
    ],
  },
];

const BUDGET_CARDS = [
  { label: 'Ön hazırlıq', range: '2.000-5.000₼', pct: '3-5%', tone: 'bg-amber-50 text-amber-700' },
  { label: 'Kaba işlər', range: '20.000-40.000₼', pct: '30-35%', tone: 'bg-sky-50 text-sky-700' },
  { label: 'İncə işlər', range: '15.000-30.000₼', pct: '20-25%', tone: 'bg-violet-50 text-violet-700' },
  { label: 'Avadanlıq', range: '25.000-50.000₼', pct: '30-35%', tone: 'bg-emerald-50 text-emerald-700' },
  { label: 'Açılış hazırlığı', range: '3.000-5.000₼', pct: '3-5%', tone: 'bg-rose-50 text-rose-700' },
  { label: 'Ehtiyat fond', range: '10.000-20.000₼', pct: '15%', tone: 'bg-slate-100 text-slate-700' },
] as const;

const COMMON_MISTAKES = [
  '3 faza və baca yoxlamadan tikintiyə başlamaq',
  'Ucuz podratçı ilə sonradan iki dəfə xərc çəkmək',
  'Aşpazı layihə planına gec qoşmaq',
  'Yazılı müqavilə və cərimə şərtlərini boş buraxmaq',
  'Ehtiyat fond ayırmadan büdcəni sıfıra bağlamaq',
];

export default function InsaatChecklistPage() {
  const [checked, setChecked] = useState<number[]>([]);
  const [openPhase, setOpenPhase] = useState<string>(PHASES[0].key);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as number[];
      setChecked(parsed);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const completed = checked.length;
  const progress = Math.round((completed / 52) * 100);

  const currentPhaseCount = useMemo(() => {
    return PHASES.map((phase) => ({
      key: phase.key,
      done: phase.items.filter((item) => checked.includes(item.id)).length,
      total: phase.items.length,
    }));
  }, [checked]);

  const toggleItem = (id: number) => {
    setChecked((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  };

  const resetChecklist = () => {
    setChecked([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleFileSelect = async (itemId: number, file?: File) => {
    if (!file) return;

    const validation = validateFile(file, { maxSizeMB: 20, allowVideo: true });
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    if (isVideo(file)) {
      const url = URL.createObjectURL(file);
      setMedia((prev) => [...prev.filter((entry) => entry.itemId !== itemId), { itemId, name: file.name, type: 'video', url }]);
      return;
    }

    try {
      const resized = await resizeImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
      setMedia((prev) => [...prev.filter((entry) => entry.itemId !== itemId), { itemId, name: file.name, type: 'image', url: resized.url }]);
    } catch {
      alert('Şəkil emal edilə bilmədi.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-20">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/toolkit" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
          <ChevronLeft size={16} />
          Toolkit-ə qayıt
        </Link>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:px-8">
        <section className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-gradient-to-r from-orange-50 via-white to-rose-50 px-6 py-6 sm:px-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-orange-700">
                İnşaat Sprinti
              </div>
              <h1 className="text-3xl font-display font-black tracking-tight text-slate-900 sm:text-4xl">
                İnşaatdan Açılışa Checklist
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                52 maddəlik fazalı plan. Tikinti, avadanlıq, sənəd və açılış hazırlığını eyni səhifədə izləyin.
              </p>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-500">Progress</div>
                  <div className="mt-1 text-3xl font-black text-slate-900">
                    {completed}
                    <span className="text-lg font-bold text-slate-400"> / 52</span>
                  </div>
                </div>
                <button
                  onClick={resetChecklist}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <RotateCcw size={16} />
                  Sıfırla
                </button>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all" style={{ width: `${progress}%` }} />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {currentPhaseCount.map((phase) => (
                  <div key={phase.key} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{phase.key}</div>
                    <div className="mt-1 text-sm font-bold text-slate-900">
                      {phase.done}/{phase.total} tamamlandı
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {PHASES.map((phase) => {
              const Icon = phase.icon;
              const isOpen = openPhase === phase.key;

              return (
                <div key={phase.key} className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm">
                  <button
                    onClick={() => setOpenPhase(isOpen ? '' : phase.key)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left sm:px-8"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${phase.bg}`}>
                        <Icon className={phase.accent} size={22} />
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{phase.duration}</div>
                        <h2 className="mt-1 text-xl font-black text-slate-900">{phase.title}</h2>
                        <p className="mt-1 text-sm text-slate-600">{phase.subtitle}</p>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-200 px-6 py-5 sm:px-8">
                      <div className="space-y-3">
                        {phase.items.map((item) => {
                          const done = checked.includes(item.id);
                          const itemMedia = media.find((entry) => entry.itemId === item.id);

                          return (
                            <div key={item.id} className={`rounded-2xl border p-4 transition-colors ${done ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-white'}`}>
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <label className="flex cursor-pointer gap-3">
                                  <input type="checkbox" checked={done} onChange={() => toggleItem(item.id)} className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">#{item.id}</span>
                                      {done && <Check size={16} className="text-emerald-600" />}
                                    </div>
                                    <div className="mt-1 text-sm font-bold text-slate-900 sm:text-base">{item.text}</div>
                                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                                  </div>
                                </label>

                                <div className="flex shrink-0 items-center gap-2">
                                  <input
                                    ref={(node) => {
                                      inputRefs.current[item.id] = node;
                                    }}
                                    type="file"
                                    accept="image/*,video/mp4,video/webm,video/quicktime"
                                    className="hidden"
                                    onChange={(event) => {
                                      void handleFileSelect(item.id, event.target.files?.[0]);
                                    }}
                                  />
                                  <button
                                    onClick={() => inputRefs.current[item.id]?.click()}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                                  >
                                    <Camera size={14} />
                                    Foto
                                  </button>
                                  <button
                                    onClick={() => inputRefs.current[item.id]?.click()}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                                  >
                                    <Video size={14} />
                                    Video
                                  </button>
                                </div>
                              </div>

                              {itemMedia && (
                                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                  <div className="mb-2 text-xs font-semibold text-slate-500">{itemMedia.name}</div>
                                  {itemMedia.type === 'image' ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={itemMedia.url} alt={itemMedia.name} className="max-h-56 w-full rounded-xl object-cover" />
                                  ) : (
                                    <video src={itemMedia.url} controls className="max-h-56 w-full rounded-xl bg-black" />
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-orange-600">
              <Lightbulb size={18} />
              <h3 className="text-sm font-black uppercase tracking-[0.18em]">5 Faza Məntiqi</h3>
            </div>
            <div className="space-y-3 text-sm leading-6 text-slate-600">
              <p><strong className="text-slate-900">1.</strong> Ön hazırlıqda sənəd və texniki riskləri bağla.</p>
              <p><strong className="text-slate-900">2.</strong> Kaba işdə ucuz qərar vermək sonradan ikiqat xərc yaradır.</p>
              <p><strong className="text-slate-900">3.</strong> İncə işlər konsept və satış təcrübəsinə xidmət etməlidir.</p>
              <p><strong className="text-slate-900">4.</strong> Avadanlıq test olunmadan təhvil alınmamalıdır.</p>
              <p><strong className="text-slate-900">5.</strong> Soft opening açılışdan əvvəl problemləri ucuz həll edir.</p>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-rose-600">
              <BookOpen size={18} />
              <h3 className="text-sm font-black uppercase tracking-[0.18em]">Büdcə Çərçivəsi</h3>
            </div>
            <div className="space-y-3">
              {BUDGET_CARDS.map((card) => (
                <div key={card.label} className={`rounded-2xl px-4 py-3 ${card.tone}`}>
                  <div className="text-sm font-black">{card.label}</div>
                  <div className="mt-1 text-sm">{card.range}</div>
                  <div className="text-xs font-semibold opacity-80">{card.pct}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-slate-800">
              <AlertTriangle size={18} />
              <h3 className="text-sm font-black uppercase tracking-[0.18em]">Ən Yayğın Səhvlər</h3>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-slate-600">
              {COMMON_MISTAKES.map((mistake) => (
                <li key={mistake} className="rounded-2xl bg-slate-50 px-4 py-3">
                  {mistake}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.6rem] border border-orange-200 bg-orange-50 p-6 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">DK Məsləhəti</div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Tikintidə ən bahalı səhv sürətlə deyil, plansızlıqla edilir. Podratçı, aşpaz və sahibkar eyni plana baxmırsa büdcə dağılır.
            </p>
            <Link href="/elaqe" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-orange-700 transition-colors hover:text-orange-800">
              Layihə nəzarəti danışmanlığı
              <ArrowRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
