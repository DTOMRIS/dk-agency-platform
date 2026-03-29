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
  HardHat,
  Lightbulb,
  Paintbrush,
  PartyPopper,
  RotateCcw,
  Video,
  Wrench,
  X,
} from 'lucide-react';
import { isVideo, resizeImage, validateFile } from '@/lib/utils/image-resize';

type PhaseKey = 'prep' | 'rough' | 'finish' | 'equipment' | 'opening';

interface ChecklistItem {
  id: number;
  text: string;
  detail: string;
}

interface Phase {
  key: PhaseKey;
  title: string;
  subtitle: string;
  duration: string;
  icon: typeof HardHat;
  accent: string;
  bg: string;
  items: ChecklistItem[];
}

interface MediaItem {
  name: string;
  url: string;
  type: 'image' | 'video';
}

const STORAGE_KEY = 'insaat-checklist-progress-v1';
const MEDIA_KEY = 'insaat-checklist-media-v1';

const phases: Phase[] = [
  {
    key: 'prep',
    title: 'Ön hazırlıq',
    subtitle: 'İnşaata başlamadan əvvəl texniki və hüquqi baza',
    duration: '2-4 həftə',
    icon: AlertTriangle,
    accent: 'text-amber-600',
    bg: 'bg-amber-50',
    items: [
      { id: 1, text: '3 faza elektrik yoxlaması', detail: 'Azərişıq texniki baxışı olmadan layihəyə başlama.' },
      { id: 2, text: 'Qaz bağlantısı və xətt yoxlanışı', detail: 'Yeni xətt çəkiləcəksə büdcəyə əvvəlcədən daxil et.' },
      { id: 3, text: 'Su və kanalizasiya giriş nöqtələri', detail: 'Mətbəx planına uyğunluğunu təsdiqlə.' },
      { id: 4, text: 'Baca çıxışı və qonşu riski', detail: 'Şikayət və bələdiyyə riskini öncədən ölç.' },
      { id: 5, text: 'Tavan hündürlüyü ölçümü', detail: 'Minimum 3 metr asma tavan və havalandırma üçün rahatdır.' },
      { id: 6, text: 'Obyekt kodu və əvvəlki borclar', detail: 'Vergi və DSMF borcu sonradan problem yaratmasın.' },
      { id: 7, text: 'İnşaat planı hazırlandı', detail: 'Mətbəx, zal, anbar və tualet axına uyğun planlandı.' },
      { id: 8, text: 'Büdcə + 15% ehtiyat fond', detail: 'Gizli xərc üçün bufer ayırmadan başlama.' },
      { id: 9, text: 'Usta və podratçı müqayisəsi', detail: 'Minimum 3 təklif topla.' },
      { id: 10, text: 'Yazılı müqavilə', detail: 'Vaxt, qiymət, material və gecikmə maddələri sənəddə olsun.' },
      { id: 11, text: 'AQTA qeydiyyatı', detail: 'Qida təhlükəsizliyi tərəfi paralel hazır getsin.' },
      { id: 12, text: 'FHN müraciəti', detail: 'Yanğın təhlükəsizliyi planını son günə saxlamamaq.' },
    ],
  },
  {
    key: 'rough',
    title: 'Kaba işlər',
    subtitle: 'Skelet, xətt və texniki əsas',
    duration: '3-6 həftə',
    icon: HardHat,
    accent: 'text-orange-600',
    bg: 'bg-orange-50',
    items: [
      { id: 13, text: 'Sökmə işləri tamamlandı', detail: 'Köhnə divar, döşəmə və asma tavan təmizləndi.' },
      { id: 14, text: 'Yeni bölücü divarlar quruldu', detail: 'Mətbəx, zal, anbar və tualet düzgün ayrıldı.' },
      { id: 15, text: 'Su xətləri çəkildi', detail: 'Lavabo, qabyuyan və təmizlik nöqtələri hazırdır.' },
      { id: 16, text: 'Kanalizasiya və grease trap', detail: 'Yağ tutucu sistemi ayrıca həll olundu.' },
      { id: 17, text: 'Elektrik xətləri çəkildi', detail: 'Mətbəx, zal və işıq üçün ayrıca xətt ayrıldı.' },
      { id: 18, text: 'Qaz xətti tamamlandı', detail: 'Qaz təhlükəsizliyi protokolu yazılıdır.' },
      { id: 19, text: 'Havalandırma kanalları quruldu', detail: 'Mətbəx və zal zonaları ayrıdır.' },
      { id: 20, text: 'Baca sistemi quraşdırıldı', detail: 'Filtr və yanğın qoruması unudulmadı.' },
      { id: 21, text: 'Sürüşməyən mətbəx döşəməsi', detail: 'Yuyula bilən və gigiyenik material seçildi.' },
      { id: 22, text: 'Tavan konstruksiyası hazırdır', detail: 'İşıq və havalandırma nöqtələri ilə uyğundur.' },
      { id: 23, text: 'Yanğın söndürmə sistemi', detail: 'FHN tələbləri ilə uyğunluq yoxlandı.' },
      { id: 24, text: 'Səs və istilik izolyasiyası', detail: 'Qonşu şikayəti riskini azaldır.' },
    ],
  },
  {
    key: 'finish',
    title: 'İncə işlər',
    subtitle: 'Müştərinin gördüyü hissə',
    duration: '3-5 həftə',
    icon: Paintbrush,
    accent: 'text-rose-600',
    bg: 'bg-rose-50',
    items: [
      { id: 25, text: 'Divar boya və örtükləri', detail: 'Konsept rəngləri qərarla uyğundur.' },
      { id: 26, text: 'Döşəmə örtüyü seçildi', detail: 'Zal və mətbəx üçün material ayrıdır.' },
      { id: 27, text: 'Asma tavan quraşdırıldı', detail: 'İşıq nöqtələri əvvəlcədən planlandı.' },
      { id: 28, text: 'İşıqlandırma sistemi tamamlandı', detail: 'Gündüz və axşam üçün fərqli ssenari düşün.' },
      { id: 29, text: 'Kondisioner və zonalama', detail: 'Zal, anbar və mətbəx istiliyi ayrı izlənir.' },
      { id: 30, text: 'Tualet remontu tamamlandı', detail: 'Müştəri və işçi zonaları ayrıdır.' },
      { id: 31, text: 'Bar və kassa sahəsi hazırdır', detail: 'POS və elektrik çıxışları yoxlanıb.' },
      { id: 32, text: 'Giriş və vitrin dizaynı', detail: 'İlk təəssürat satışa işləyir.' },
      { id: 33, text: 'Tabela və icazələr', detail: 'Lokal icazə prosesi bağlandı.' },
      { id: 34, text: 'Mebel quraşdırıldı', detail: 'Rahatlıq və dönüş sürəti balanslandı.' },
      { id: 35, text: 'Dekor elementləri yerləşdirildi', detail: 'Foto çəkdirən vizual anlar yaradıldı.' },
      { id: 36, text: 'Musiqi sistemi hazırdır', detail: 'Playlist və lisenziya tərəfi düşünülüb.' },
    ],
  },
  {
    key: 'equipment',
    title: 'Avadanlıq və texnologiya',
    subtitle: 'Mətbəxin işləyən beyni',
    duration: '1-2 həftə',
    icon: Wrench,
    accent: 'text-sky-600',
    bg: 'bg-sky-50',
    items: [
      { id: 37, text: 'Sənaye sobası və ocaq', detail: 'Qaz və ya 3 fazaya təhlükəsiz qoşulub.' },
      { id: 38, text: 'Soyuducular test edildi', detail: '24 saat temperatur stabil qaldı.' },
      { id: 39, text: 'Dondurucu test edildi', detail: '-18°C performansı təsdiqləndi.' },
      { id: 40, text: 'Qabyuyan quraşdırıldı', detail: 'Su və drenaj axını problemsizdir.' },
      { id: 41, text: 'Stainless iş masaları', detail: 'Gigiyena və axın üçün düzgün hündürlük seçildi.' },
      { id: 42, text: 'POS sistemi quruldu', detail: 'Printer, planşet və kassa test edildi.' },
      { id: 43, text: 'Sabit internet və Wi-Fi', detail: 'POS üçün ayrıca etibarlı xətt olsun.' },
      { id: 44, text: 'Kamera sistemi', detail: 'Mətbəx, kassa və giriş minimum izlənir.' },
      { id: 45, text: 'Siqnalizasiya sistemi', detail: 'Bağlanış sonrası təhlükəsizlik hazırdır.' },
    ],
  },
  {
    key: 'opening',
    title: 'Açılış hazırlığı',
    subtitle: 'İnşaat bitdi, indi risksiz start',
    duration: '1-2 həftə',
    icon: PartyPopper,
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50',
    items: [
      { id: 46, text: 'AQTA son yoxlaması', detail: 'Gigiyena və sənədləşmə açılışa hazırdır.' },
      { id: 47, text: 'FHN son yoxlaması', detail: 'Yanğın avadanlığı və çıxış planı təsdiqləndi.' },
      { id: 48, text: 'İşçi qəbulu və tibbi arayışlar', detail: 'Komanda hüquqi baxımdan tam hazırdır.' },
      { id: 49, text: '1-2 həftəlik təlim dövrü', detail: 'Menyu, POS, xidmət və gigiyena birlikdə məşq edilir.' },
      { id: 50, text: 'Soft opening', detail: 'Dost və tanışlarla real test xidməti apar.' },
      { id: 51, text: 'Menyu və qiymət son yoxlaması', detail: 'Food cost və satış dili final haldadır.' },
      { id: 52, text: 'Grand opening planı', detail: 'Marketinq, dəvətlilər və sosial media planı hazırdır.' },
    ],
  },
];

const budgetCards = [
  { label: 'Ön hazırlıq', range: '2.000-5.000 ₼', pct: '3-5%', bg: 'bg-amber-50', ring: 'ring-amber-200/60', text: 'text-amber-700' },
  { label: 'Kaba işlər', range: '20.000-40.000 ₼', pct: '30-35%', bg: 'bg-orange-50', ring: 'ring-orange-200/60', text: 'text-orange-700' },
  { label: 'İncə işlər', range: '15.000-30.000 ₼', pct: '20-25%', bg: 'bg-rose-50', ring: 'ring-rose-200/60', text: 'text-rose-700' },
  { label: 'Avadanlıq', range: '25.000-50.000 ₼', pct: '30-35%', bg: 'bg-sky-50', ring: 'ring-sky-200/60', text: 'text-sky-700' },
  { label: 'Açılış hazırlığı', range: '3.000-5.000 ₼', pct: '3-5%', bg: 'bg-emerald-50', ring: 'ring-emerald-200/60', text: 'text-emerald-700' },
  { label: 'Ehtiyat fond', range: '10.000-20.000 ₼', pct: '15%', bg: 'bg-slate-100', ring: 'ring-slate-200/60', text: 'text-slate-800' },
];

const initialOpenState = phases.reduce<Record<PhaseKey, boolean>>((acc, phase, index) => {
  acc[phase.key] = index === 0;
  return acc;
}, {} as Record<PhaseKey, boolean>);

export default function InsaatChecklistPage() {
  const [checked, setChecked] = useState<number[]>([]);
  const [openPhases, setOpenPhases] = useState<Record<PhaseKey, boolean>>(initialOpenState);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [media, setMedia] = useState<Record<number, MediaItem[]>>({});
  const [uploadTarget, setUploadTarget] = useState<number | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const savedChecked = window.localStorage.getItem(STORAGE_KEY);
    const savedMedia = window.localStorage.getItem(MEDIA_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedChecked) setChecked(JSON.parse(savedChecked));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedMedia) setMedia(JSON.parse(savedMedia));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  useEffect(() => {
    window.localStorage.setItem(MEDIA_KEY, JSON.stringify(media));
  }, [media]);

  const totalItems = phases.reduce((sum, phase) => sum + phase.items.length, 0);
  const progress = Math.round((checked.length / totalItems) * 100);

  const phaseProgress = useMemo(
    () =>
      phases.map((phase) => ({
        key: phase.key,
        done: phase.items.filter((item) => checked.includes(item.id)).length,
        total: phase.items.length,
      })),
    [checked],
  );

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !uploadTarget) return;

    const validation = validateFile(file, { maxSizeMB: 20, allowVideo: true });
    if (!validation.valid) {
      setError(validation.error || 'Fayl yüklənmədi.');
      return;
    }

    const resolved = isVideo(file)
      ? ({ name: file.name, url: URL.createObjectURL(file), type: 'video' as const })
      : await resizeImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 }).then((image) => ({
          name: file.name,
          url: image.url,
          type: 'image' as const,
        }));

    setMedia((current) => ({
      ...current,
      [uploadTarget]: [...(current[uploadTarget] || []), resolved],
    }));
    setUploadTarget(null);
    setError('');
    event.target.value = '';
  }

  function toggleItem(id: number) {
    setChecked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function togglePhase(key: PhaseKey) {
    setOpenPhases((current) => ({ ...current, [key]: !current[key] }));
  }

  function removeMedia(itemId: number, url: string) {
    setMedia((current) => ({
      ...current,
      [itemId]: (current[itemId] || []).filter((entry) => entry.url !== url),
    }));
    URL.revokeObjectURL(url);
  }

  function resetChecklist() {
    setChecked([]);
    setNotes({});
    Object.values(media).flat().forEach((entry) => URL.revokeObjectURL(entry.url));
    setMedia({});
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(MEDIA_KEY);
  }

  return (
    <div className="min-h-screen bg-[var(--dk-paper)] pb-16">
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="border-b border-orange-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/toolkit" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-orange-600">
            <ChevronLeft size={16} />
            Toolkit-ə qayıt
          </Link>
          <button
            onClick={resetChecklist}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-orange-200 hover:text-orange-600"
          >
            <RotateCcw size={14} />
            Sıfırla
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_360px]">
        <section>
          <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 px-6 py-8 text-white shadow-xl sm:px-8">
            <span className="inline-flex rounded-full bg-orange-500/20 px-3 py-1 text-[11px] font-black uppercase tracking-[0.3em] text-orange-200">
              Tikinti Sprinti
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">İnşaatdan Açılışa Checklist</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-orange-100/80 sm:text-base">
              52 maddəlik praktiki plan: elektrikdən FHN-ə, soft opening-dən grand opening-ə qədər hər addımı sıraya sal.
            </p>

            <div className="mt-6 rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
              <div className="flex items-center justify-between text-sm font-semibold text-white">
                <span>Ümumi progress</span>
                <span>{checked.length}/{totalItems}</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-2 text-xs text-orange-100/70">%{progress} tamamlandı</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {phases.map((phase) => {
              const stat = phaseProgress.find((item) => item.key === phase.key)!;
              return (
                <div key={phase.key} className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm">
                  <button onClick={() => togglePhase(phase.key)} className="flex w-full items-center justify-between px-5 py-5 text-left sm:px-6">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 flex h-12 w-12 items-center justify-center rounded-2xl ${phase.bg}`}>
                        <phase.icon size={22} className={phase.accent} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-black text-slate-900">{phase.title}</h2>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            {phase.duration}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{phase.subtitle}</p>
                        <p className="mt-2 text-xs font-semibold text-slate-400">{stat.done}/{stat.total} tamamlandı</p>
                      </div>
                    </div>
                    {openPhases[phase.key] ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                  </button>

                  {openPhases[phase.key] && (
                    <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                      <div className="space-y-3">
                        {phase.items.map((item) => {
                          const done = checked.includes(item.id);
                          return (
                            <div key={item.id} className={`rounded-2xl border p-4 transition-all ${done ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-slate-50/70'}`}>
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => toggleItem(item.id)}
                                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-transparent'}`}
                                >
                                  <Check size={14} />
                                </button>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-bold text-slate-900">{item.id}. {item.text}</div>
                                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.detail}</p>
                                  <textarea
                                    value={notes[item.id] || ''}
                                    onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                                    placeholder="Qısa qeyd yaz..."
                                    className="mt-3 min-h-[76px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-300"
                                  />

                                  {!!media[item.id]?.length && (
                                    <div className="mt-3 flex flex-wrap gap-3">
                                      {media[item.id].map((entry) => (
                                        <div key={entry.url} className="group relative">
                                          {entry.type === 'image' ? (
                                            <img src={entry.url} alt={entry.name} className="h-20 w-20 rounded-xl object-cover ring-1 ring-slate-200 sm:h-24 sm:w-24" />
                                          ) : (
                                            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-slate-200 sm:h-24 sm:w-24">
                                              <Video size={20} className="text-slate-400" />
                                            </div>
                                          )}
                                          <button
                                            onClick={() => removeMedia(item.id, entry.url)}
                                            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                          >
                                            <X size={12} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  <button
                                    onClick={() => {
                                      setUploadTarget(item.id);
                                      fileRef.current?.click();
                                    }}
                                    className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition-colors hover:text-orange-600"
                                  >
                                    <Camera size={13} />
                                    Şəkil və ya video əlavə et
                                  </button>
                                </div>
                              </div>
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

          {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="mt-10">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Büdcə planlaması</h2>
              <p className="mt-2 text-sm text-slate-500">50-80 m², 30-40 nəfərlik restoran üçün təxmini bölgü.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {budgetCards.map((card) => (
                <div key={card.label} className={`${card.bg} rounded-2xl p-5 ring-1 ${card.ring}`}>
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">{card.label}</div>
                  <div className={`mt-2 text-2xl font-black ${card.text}`}>{card.range}</div>
                  <div className="mt-1 text-xs text-slate-400">Büdcənin {card.pct}-i</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-3xl bg-slate-950 px-6 py-6 text-center text-white">
              <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">Toplam təxmini büdcə</div>
              <div className="mt-2 text-4xl font-black">75.000 - 150.000 ₼</div>
              <p className="mt-2 text-sm text-slate-400">Lokasiya, obyektin vəziyyəti və konsept bu aralığı dəyişir.</p>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-[1.6rem] border border-orange-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100">
                <Lightbulb size={20} className="text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">DK Agency məsləhəti</div>
                <div className="text-xs text-slate-500">Tikinti ən bahalı səhvlərin yeridir</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Tikintidə ucuz usta, plansız faza və yazısız razılaşma birbaşa vaxt və pul itkisinə çevrilir. Ən kritik trio:
              3 faza elektrik, qaz və baca. Bunlar bağlanmadan divar sökmə.
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-slate-900">
              <BookOpen size={18} className="text-orange-600" />
              <h3 className="text-base font-black">Ən yayğın səhvlər</h3>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-slate-600">
              <li>3 fazanı yoxlamadan başlamaq və sonradan 15-20 min ₼ əlavə xərcə düşmək.</li>
              <li>Ucuz ustanı seçib su və elektrik xəttini ikinci dəfə etdirmək.</li>
              <li>Mətbəx planını aşpazsız çəkmək və avadanlığı sonradan sığışdıra bilməmək.</li>
              <li>Ehtiyat fond ayırmamaq və son mərhələdə nağd axın probleminə düşmək.</li>
            </ul>
          </div>

          <div className="rounded-[1.6rem] bg-gradient-to-br from-[var(--dk-red)] to-[var(--dk-red-strong)] p-6 text-white shadow-xl shadow-red-500/15">
            <h3 className="text-xl font-black">OCAQ Panel</h3>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Faza progressini, podratçı statusunu və büdcə sürüşməsini bir paneldə izləmək istəyirsənsə, bunu OCAQ Panel üzərindən avtomatlaşdır.
            </p>
            <Link href="/auth/register" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[var(--dk-red)]">
              Pulsuz başla
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900">Əlaqəli yazılar</h3>
            <div className="mt-4 space-y-3">
              {[
                { title: 'Açılış Checklist', href: '/toolkit/checklist', tag: 'Alət' },
                { title: 'Food Cost hesablaması', href: '/blog/1-porsiya-food-cost-hesablama', tag: 'Bloq' },
                { title: 'Başabaş nöqtəsi hesablama', href: '/toolkit/basabas', tag: 'Alət' },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="group block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-orange-200 hover:bg-orange-50">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-600">{item.tag}</div>
                  <div className="mt-2 text-sm font-bold text-slate-900 group-hover:text-orange-700">{item.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
