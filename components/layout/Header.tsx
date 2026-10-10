'use client';

/**
 * Global header. TASK-0520 (owner 2026-10-09, «üst kısmı unutuyorsun»): one v2 header on every width,
 * matching the approved /tanitim nav — cream sticky bar, dark «DK» mark + «DK Agency»
 * (Inter 800), centred Inter 600 links, compact language switcher, «Daxil ol» / member menu, outline
 * «Elan ver» and the red «Pulsuz diaqnostika» pill. The old navy top bar is removed; its KAZAN beta
 * notice is the «Beta» badge on KAZAN AI in the Modullar menu, language and account moved into the bar.
 * Below xl the TASK-0519 drawer carries the full menu.
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, BookOpenText, BriefcaseBusiness, Calculator, FileSpreadsheet, ListChecks, Handshake, Megaphone, Store, Check, ChevronDown, ChevronRight, ClipboardCheck, Flame, Globe, LayoutDashboard, LayoutGrid, LogOut, Menu, MessageCircle, Newspaper, Radar, ShoppingBag, Sparkles, UserRound, Wand2, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import MegaMenu from '@/components/layout/MegaMenu';
import { inter } from '@/components/home/v2/font';
import { clearMemberSession, getGuestSession, readMemberSession, type MemberSession } from '@/lib/member-access';
import { localeLabels, locales, normalizeLocale, switchLocalePath, withLocale, type Locale } from '@/i18n/config';
import DkMark from '@/components/brand/DkMark';

// Inline nav copy — NOT dependent on NextIntlClientProvider (fixes stale locale on client nav)
const NAV_COPY: Record<Locale, Record<string, string>> = {
  az: { frOverviewD:'Françayz vermək və almaq — haradan başlamalı.', frRadarD:'Azərbaycanda hələ olmayan qlobal markalar.', frReadinessD:'Markanız françayz verməyə hazırdırmı? 12 sual.', frRoiD:'İnvestisiya neçə ayda geri qayıdır.', frBuyerD:'Françayz almazdan əvvəl yoxlanılası 9 sahə.', frBookD:'Əl kitabının skeletini AI ilə qurun.', blogD:'Restoran sahibi üçün bələdçilər və analizlər.', newsD:'HoReCa xəbərləri — qısa xülasə və mənbə ilə.', xls:'Excel şablonları', xlsD:'Mənfəət və zərər, anbar, büdcə — üzvlərə pulsuz.', jobsD:'HoReCa vakansiyaları.', mmMarketing:'Marketinq Ocağı', mmMarketingD:'Reklam, sezon, şikayət və müştəri analizi alətləri.', mmFranchiseD:'Hazırlıq testi, ROI, françbuk və Franchise Radar.', mmService:'Xüsusi xidmət', mmServiceD:'Diaqnostikadan sistemin qurulmasına qədər — sizinlə birlikdə.', diag:'Pulsuz diaqnostika', diagShort:'Pulsuz diaqnostika', postShort:'Elan ver', close:'Bağla', home:'Ana səhifə', tools:'Alətlər', franchise:'Françayz', listings:'Elanlar', jobs:'İş elanları', news:'Sektor Nəbzi', blog:'Bloq', resources:'Resurslar', aboutUs:'Haqqımızda', panel:'İdarə Paneli', language:'Dil', login:'Daxil ol', register:'Üzv ol', postListing:'Elan ver', account:'Hesabım', myListings:'Elanlarım', logout:'Çıxış', menu:'Menyu', frOverview:'Azərbaycanda françayz', frReadiness:'Hazırlıq Testi', frRoi:'ROI Kalkulyatoru', frBuyer:'Alıcı Çek-listi', frBook:'AI Françbuk', frRadar:'Franchise Radar', modules:'Həllər', mmRevenue:'Gəlir artımı', mmCost:'İdarəetmə və quruluş', mmMenu:'Menyu Matrisi', mmMenuD:'Hansı yemək qazandırır, hansı yer tutur.', mmKazanD:'Sualınıza cavab və bir addım. Beta.', mmB2b:'B2B elanlar', mmB2bD:'Devir, icarə, avadanlıq və təchizatçı.', mmFoodD:'Hər yeməyi real maya dəyərinə görə qiymətləndirin.', mmDelivery:'Delivery komissiyası', mmDeliveryD:'Wolt, Bolt, Yango: əlinizdə qalan real pul.', mmOcaqD:'Çoxfilialı şəbəkədə gündəlik nəzarət.', mmMore:'Ətraflı →', mmPill:'Xüsusi xidmət', mmBand:'Alətlər pulsuzdur. Sistemi sizinlə birlikdə qururuq — ilk addım pulsuz diaqnostikadır.', mmTalk:'Danışaq →', mmWa:'Salam Doğan bəy, DK Agency pulsuz diaqnostika istəyirəm.' },
  en: { frOverviewD:'Franchising out or buying in — where to start.', frRadarD:'Global brands not yet in Azerbaijan.', frReadinessD:'Is your brand ready to franchise? 12 questions.', frRoiD:'How many months until the investment pays back.', frBuyerD:'9 areas to check before buying a franchise.', frBookD:'Build the outline of your manual with AI.', blogD:'Guides and analysis for restaurant owners.', newsD:'Hospitality news — short summary and source.', xls:'Excel templates', xlsD:'P&L, inventory, budget — free for members.', jobsD:'Hospitality vacancies.', mmMarketing:'Marketinq Ocağı', mmMarketingD:'Ads, seasons, complaints and guest analysis tools.', mmFranchiseD:'Readiness test, ROI, franchbook and Franchise Radar.', mmService:'Dedicated service', mmServiceD:'From the diagnostic to a working system — together with you.', diag:'Free diagnostic', diagShort:'Free diagnostic', postShort:'Post listing', close:'Close', home:'Home', tools:'Tools', franchise:'Franchise', listings:'Listings', jobs:'Jobs', news:'Sector Pulse', blog:'Blog', resources:'Resources', aboutUs:'About Us', panel:'Control Panel', language:'Language', login:'Sign in', register:'Join', postListing:'Post listing', account:'My account', myListings:'My listings', logout:'Log out', menu:'Menu', frOverview:'Franchise in Azerbaijan', frReadiness:'Readiness Test', frRoi:'ROI Calculator', frBuyer:'Buyer Checklist', frBook:'AI Franchbook', frRadar:'Franchise Radar', modules:'Solutions', mmRevenue:'Revenue growth', mmCost:'Control & setup', mmMenu:'Menu Matrix', mmMenuD:'Which dish earns and which just takes up space.', mmKazanD:'An answer to your question and one step. Beta.', mmB2b:'B2B listings', mmB2bD:'Business transfer, lease, equipment and suppliers.', mmFoodD:'Price every dish on its real cost.', mmDelivery:'Delivery commission', mmDeliveryD:'Wolt, Bolt, Yango: the real money you keep.', mmOcaqD:'Daily control across a multi-branch chain.', mmMore:'Learn more →', mmPill:'Dedicated service', mmBand:'The tools are free. We build the system together with you — the first step is a free diagnostic.', mmTalk:'Let\'s talk →', mmWa:'Hello Doğan, I\'d like a free DK Agency diagnostic.' },
  ru: { frOverviewD:'Продать или купить франшизу — с чего начать.', frRadarD:'Мировые бренды, которых ещё нет в Азербайджане.', frReadinessD:'Готов ли бренд к франшизе? 12 вопросов.', frRoiD:'За сколько месяцев окупятся вложения.', frBuyerD:'9 пунктов проверки перед покупкой франшизы.', frBookD:'Каркас руководства с помощью AI.', blogD:'Гайды и аналитика для владельцев ресторанов.', newsD:'Новости HoReCa — кратко и с источником.', xls:'Шаблоны Excel', xlsD:'P&L, склад, бюджет — бесплатно для участников.', jobsD:'Вакансии в HoReCa.', mmMarketing:'Marketinq Ocağı', mmMarketingD:'Инструменты для рекламы, сезона, жалоб и анализа гостей.', mmFranchiseD:'Тест готовности, ROI, франчбук и Franchise Radar.', mmService:'Особый сервис', mmServiceD:'От диагностики до работающей системы — вместе с вами.', diag:'Бесплатная диагностика', diagShort:'Диагностика', postShort:'Подать объявление', close:'Закрыть', home:'Главная', tools:'Инструменты', franchise:'Франшиза', listings:'Объявления', jobs:'Вакансии', news:'Пульс сектора', blog:'Блог', resources:'Ресурсы', aboutUs:'О нас', panel:'Панель управления', language:'Язык', login:'Войти', register:'Стать участником', postListing:'Разместить объявление', account:'Мой аккаунт', myListings:'Мои объявления', logout:'Выйти', menu:'Меню', frOverview:'Франшиза в Азербайджане', frReadiness:'Тест готовности', frRoi:'ROI Калькулятор', frBuyer:'Чек-лист покупателя', frBook:'AI Франчбук', frRadar:'Franchise Radar', modules:'Решения', mmRevenue:'Рост дохода', mmCost:'Контроль и запуск', mmMenu:'Матрица меню', mmMenuD:'Какое блюдо зарабатывает, а какое занимает место.', mmKazanD:'Ответ на ваш вопрос и один шаг. Бета.', mmB2b:'B2B-объявления', mmB2bD:'Передача бизнеса, аренда, оборудование и поставщики.', mmFoodD:'Цените каждое блюдо по его реальной себестоимости.', mmDelivery:'Комиссия доставки', mmDeliveryD:'Wolt, Bolt, Yango: реальные деньги, которые остаются у вас.', mmOcaqD:'Ежедневный контроль в сети с филиалами.', mmMore:'Подробнее →', mmPill:'Особый сервис', mmBand:'Инструменты бесплатны. Систему строим вместе с вами — первый шаг: бесплатная диагностика.', mmTalk:'Поговорим →', mmWa:'Здравствуйте, Доган бей! Хочу бесплатную диагностику DK Agency.' },
  tr: { frOverviewD:'Franchise vermek veya almak — nereden başlamalı.', frRadarD:'Azerbaycan’da henüz olmayan küresel markalar.', frReadinessD:'Markanız franchise vermeye hazır mı? 12 soru.', frRoiD:'Yatırım kaç ayda geri döner.', frBuyerD:'Franchise almadan önce kontrol edilecek 9 alan.', frBookD:'El kitabının iskeletini AI ile kurun.', blogD:'Restoran sahipleri için rehberler ve analizler.', newsD:'HoReCa haberleri — kısa özet ve kaynakla.', xls:'Excel şablonları', xlsD:'Kâr-zarar, stok, bütçe — üyelere ücretsiz.', jobsD:'HoReCa iş ilanları.', mmMarketing:'Marketinq Ocağı', mmMarketingD:'Reklam, sezon, şikâyet ve müşteri analizi araçları.', mmFranchiseD:'Hazırlık testi, ROI, franchise kitabı ve Franchise Radar.', mmService:'Özel hizmet', mmServiceD:'Teşhisten çalışan sisteme — sizinle birlikte.', diag:'Ücretsiz teşhis', diagShort:'Ücretsiz teşhis', postShort:'İlan ver', close:'Kapat', home:'Ana sayfa', tools:'Araçlar', franchise:'Franchise', listings:'İlanlar', jobs:'İş ilanları', news:'Sektör Nabzı', blog:'Blog', resources:'Kaynaklar', aboutUs:'Hakkımızda', panel:'Yönetim Paneli', language:'Dil', login:'Giriş yap', register:'Üye ol', postListing:'İlan ver', account:'Hesabım', myListings:'İlanlarım', logout:'Çıkış', menu:'Menü', frOverview:"Azerbaycan'da Franchise", frReadiness:'Hazırlık Testi', frRoi:'ROI Hesaplayıcı', frBuyer:'Alıcı Kontrol Listesi', frBook:'AI Franchise Kitabı', frRadar:'Franchise Radar', modules:'Çözümler', mmRevenue:'Gelir artışı', mmCost:'Kontrol ve kurulum', mmMenu:'Menü Matrisi', mmMenuD:'Hangi yemek kazandırıyor, hangisi yer kaplıyor.', mmKazanD:'Sorunuza cevap ve bir adım. Beta.', mmB2b:'B2B ilanlar', mmB2bD:'Devir, kira, ekipman ve tedarikçi.', mmFoodD:'Her yemeği gerçek maliyetine göre fiyatlayın.', mmDelivery:'Paket servis komisyonu', mmDeliveryD:'Wolt, Bolt, Yango: elinizde kalan gerçek para.', mmOcaqD:'Çok şubeli zincirde günlük kontrol.', mmMore:'Ayrıntılar →', mmPill:'Özel hizmet', mmBand:'Araçlar ücretsiz. Sistemi sizinle birlikte kuruyoruz — ilk adım ücretsiz teşhis.', mmTalk:'Konuşalım →', mmWa:'Merhaba Doğan Bey, DK Agency ücretsiz teşhis istiyorum.' },
};


// Native language names for the compact «AZ ▾» switcher (TASK-0520).
const LOCALE_NAMES: Record<Locale, string> = { az: 'Azərbaycanca', ru: 'Русский', en: 'English', tr: 'Türkçe' };

function getMemberInitials(session: MemberSession) {
  const source = session.name.trim() || session.email.trim();
  if (!source) return 'M';
  return source.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

/** TASK-0529 (owner 10.10: «logomuz yine yok?»): the real DK logo (public/images/logo-mobil.png) instead of
 *  the dark text square — same mark as footer, panels and login (components/brand/DkMark). Flips on hover. */
function BrandMark({ compact = false }: { compact?: boolean }) {
  return <DkMark size={compact ? 'sm' : 'md'} spin="hover" withName />;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = normalizeLocale(pathname.split('/')[1]);
  const t = (key: string) => NAV_COPY[currentLocale]?.[key] ?? NAV_COPY.az[key] ?? key;

  // TASK-0536 (owner 10.10, reference: Accurate Franchising «Our Resources» menu): line icon + bold title + one
  // line saying what the page gives — the same pattern as the «Həllər» panel.
  const franchiseLinks = [
    // Pillar sehife — naviqasiyadan daxili link SEO ucun vacibdir; anchor metni acar sozdur (TASK-0432).
    { icon: Store, label: t('frOverview'), desc: t('frOverviewD'), href: withLocale(currentLocale, '/franchise') },
    { icon: Radar, label: t('frRadar'), desc: t('frRadarD'), href: withLocale(currentLocale, '/franchise/radar') },
    { icon: ClipboardCheck, label: t('frReadiness'), desc: t('frReadinessD'), href: withLocale(currentLocale, '/franchise/hazirliq-testi') },
    { icon: Calculator, label: t('frRoi'), desc: t('frRoiD'), href: withLocale(currentLocale, '/franchise/roi-kalkulyatoru') },
    { icon: ListChecks, label: t('frBuyer'), desc: t('frBuyerD'), href: withLocale(currentLocale, '/franchise/alici-cheklisti') },
    { icon: Wand2, label: t('frBook'), desc: t('frBookD'), href: withLocale(currentLocale, '/franchise/francbuk-generatoru'), beta: true },
  ] as const;

  // TASK-0520: «Resurslar» = Bloq, Sektor Nəbzi and İş elanları (jobs left the top row to make room).
  // TASK-0536: + Excel şablonları (members download free).
  const resourceLinks = [
    { icon: BookOpenText, label: t('blog'), desc: t('blogD'), href: withLocale(currentLocale, '/blog') },
    { icon: Newspaper, label: t('news'), desc: t('newsD'), href: withLocale(currentLocale, '/haberler') },
    { icon: FileSpreadsheet, label: t('xls'), desc: t('xlsD'), href: withLocale(currentLocale, '/toolkit/excel-sablonlar') },
    { icon: BriefcaseBusiness, label: t('jobs'), desc: t('jobsD'), href: withLocale(currentLocale, '/is-elanlari') },
  ] as const;

  // TASK-0512: «Modullar» mega menu (owner-approved /tanitim design). OCAQ is sold, not self-served:
  // it opens the OCAQ tab of the homepage module section (`/#p-ocaq`), which links to WhatsApp.
  // TASK-0520: KAZAN AI carries the BETA badge (it replaced the old navy top-bar notice).
  // TASK-0533 (owner 10.10 «modul nedir alet nedir» → «olsun»): renamed «Həllər» and only DK's solutions are
  // listed here; the free calculators (food cost, menu matrix, delivery) live in «Alətlər» only.
  const moduleColumns = [
    {
      key: 'revenue', title: t('mmRevenue'), HeadIcon: ArrowUpRight, tone: 'revenue',
      items: [
        { icon: Megaphone, title: t('mmMarketing'), desc: t('mmMarketingD'), href: withLocale(currentLocale, '/marketinq'), hash: false, beta: false },
        { icon: Sparkles, title: 'KAZAN AI', desc: t('mmKazanD'), href: withLocale(currentLocale, '/kazan-ai'), hash: false, beta: true },
        { icon: ShoppingBag, title: t('mmB2b'), desc: t('mmB2bD'), href: withLocale(currentLocale, '/ilanlar'), hash: false, beta: false },
      ],
    },
    {
      key: 'cost', title: t('mmCost'), HeadIcon: ArrowDownLeft, tone: 'cost',
      items: [
        { icon: Flame, title: 'OCAQ', desc: t('mmOcaqD'), href: `${withLocale(currentLocale, '/')}#p-ocaq`, hash: true, beta: false },
        { icon: Store, title: t('franchise'), desc: t('mmFranchiseD'), href: withLocale(currentLocale, '/franchise'), hash: false, beta: false },
        { icon: Handshake, title: t('mmService'), desc: t('mmServiceD'), href: '/tanitim', hash: true, beta: false },
      ],
    },
  ] as const;
  const modulesTalkHref = `/api/leads/whatsapp?text=${encodeURIComponent(t('mmWa'))}`;

  const memberLinks = [
    { label: t('panel'), href: withLocale(currentLocale, '/b2b-panel'), icon: LayoutDashboard },
    { label: t('account'), href: withLocale(currentLocale, '/settings'), icon: UserRound },
    { label: t('myListings'), href: withLocale(currentLocale, '/b2b-panel/ilanlarim'), icon: LayoutGrid },
  ] as const;

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isFranchiseOpen, setIsFranchiseOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isMobileFranchiseOpen, setIsMobileFranchiseOpen] = useState(false);
  const [isMobileResourcesOpen, setIsMobileResourcesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const [memberSession, setMemberSession] = useState<MemberSession>(getGuestSession());
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const modulesRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  // Desktop row (TASK-0520 order): Modullar ▾, Alətlər, Resurslar ▾, Franchise ▾, İlanlar, Haqqımızda.
  // «İdarə Paneli» (members) lives in the avatar menu on desktop and in the drawer list below xl.
  const navItems = [
    { name: t('modules'), href: '#', type: 'modules' },
    { name: t('tools'), href: withLocale(currentLocale, '/toolkit'), type: 'mega' },
    { name: t('resources'), href: '#', type: 'resources' },
    { name: t('franchise'), href: '#', type: 'franchise' },
    { name: t('listings'), href: withLocale(currentLocale, '/ilanlar'), type: 'link' },
    { name: t('aboutUs'), href: withLocale(currentLocale, '/haqqimizda'), type: 'link' },
  ];
  const drawerItems = [
    ...navItems.filter((item) => item.type !== 'modules'),
    ...(memberSession.loggedIn ? [{ name: t('panel'), href: withLocale(currentLocale, '/b2b-panel'), type: 'link' }] : []),
  ];

  const isActivePath = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const resourcesActive = resourceLinks.some((rl) => isActivePath(rl.href));
  const franchiseActive = isActivePath(withLocale(currentLocale, '/franchise'));

  useEffect(() => { const s = () => setMemberSession(readMemberSession()); s(); window.addEventListener('storage', s); window.addEventListener('member-session-updated', s); return () => { window.removeEventListener('storage', s); window.removeEventListener('member-session-updated', s); }; }, []);
  // TASK-0535 (owner 10.10 screenshot: panel open but the header said «Daxil ol»): localStorage is only a fast first
  // guess — the signed JWT cookie is the truth, so the header asks the server once per page and follows it.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/member/session', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { session?: MemberSession } | null) => {
        if (!cancelled && d?.session && typeof d.session.loggedIn === 'boolean') {
          setMemberSession((prev) => (prev.loggedIn === d.session!.loggedIn && prev.email === d.session!.email ? prev : { ...prev, ...d.session! }));
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [pathname]);
  useEffect(() => { const t = window.setTimeout(() => { setIsMobileOpen(false); setIsMegaMenuOpen(false); setIsFranchiseOpen(false); setIsResourcesOpen(false); setIsMobileFranchiseOpen(false); setIsUserMenuOpen(false); setIsLangOpen(false); setIsModulesOpen(false); setIsMobileResourcesOpen(false); }, 0); return () => window.clearTimeout(t); }, [pathname]);
  // Small popovers (avatar menu, language): close on outside click and Esc.
  useEffect(() => {
    if (!isUserMenuOpen && !isLangOpen) return;
    const onDown = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setIsUserMenuOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setIsLangOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setIsUserMenuOpen(false); setIsLangOpen(false); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [isUserMenuOpen, isLangOpen]);
  useEffect(() => {
    if (!isModulesOpen) return;
    const onDown = (e: MouseEvent) => { if (modulesRef.current && !modulesRef.current.contains(e.target as Node)) setIsModulesOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsModulesOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [isModulesOpen]);

  // TASK-0519: mobile drawer — Esc closes, body scroll is locked while open, focus moves to the
  // close button and returns to the menu button afterwards.
  useEffect(() => {
    if (!isMobileOpen) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    const focusT = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    const menuBtn = menuBtnRef.current;
    return () => {
      body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(focusT);
      menuBtn?.focus({ preventScroll: true });
    };
  }, [isMobileOpen]);

  const handleLogout = async () => {
    clearMemberSession();
    await fetch('/api/member/session', { method: 'DELETE' });
    setIsUserMenuOpen(false); setIsMobileOpen(false);
    router.refresh(); router.push(withLocale(currentLocale, '/uzvluk'));
  };

  // v2 nav link: Inter 600, ink-2, pill hover (approved /tanitim `.nav-links`).
  const linkBase = 'inline-flex h-11 items-center gap-1 whitespace-nowrap rounded-full px-2 text-[14.5px] font-semibold transition-colors min-[1440px]:px-3 min-[1440px]:text-[15px]';
  const linkIdle = 'text-[#334155] hover:bg-white/70 hover:text-[#0F172A]';
  const linkOn = 'bg-white/70 text-[#0F172A]';
  const popPanel = 'rounded-[20px] border border-[#E4DCCD] bg-white p-2 shadow-[0_30px_70px_-24px_rgba(15,23,42,0.3)]';
  const betaBadge = 'rounded-full bg-[#FEF3E2] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#B45309]';

  return (
    <>
      {/* ── Header (TASK-0520: v2 = approved /tanitim nav on every width; the old navy top bar is gone) ──
          Cream #F6F1E9, hairline #E4DCCD, 68px below xl / 76px at xl+ (sticky offsets:
          components/inner/inner.module.css --hdr, components/home/v2/homeV2.module.css .tabbar).
          Opaque on purpose: /tanitim's rgba(246,241,233,.86)+blur sits on a cream body, but the app body
          is dark (rgb(10,10,26), app/globals.css), so the same translucency renders grey at the top. */}
      <header className={`${inter.className} sticky top-0 z-50 border-b border-[#E4DCCD] bg-[#F6F1E9]`} data-testid="site-header">
        <div className="relative mx-auto flex h-[68px] max-w-[1360px] items-center justify-between gap-3 px-4 sm:px-6 xl:h-[76px]">
          {/* Brand */}
          <Link href={withLocale(currentLocale, '/')} className="flex shrink-0 items-center gap-2.5" aria-label="DK Agency">
            <BrandMark />
          </Link>

          {/* Desktop nav (lg+; below xl the right side compacts) */}
          <nav aria-label={t('menu')} className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => {
              if (item.type === 'modules') {
                // Not `relative`: the panel is positioned against the header bar and centred on the page.
                return (
                  <div key={item.name} ref={modulesRef}>
                    <button type="button" aria-expanded={isModulesOpen} aria-controls="dk-modules-menu" onClick={() => setIsModulesOpen((p) => !p)}
                      className={`${linkBase} ${isModulesOpen ? 'bg-[#FDECEF] text-[#BE2F47]' : linkIdle}`}>
                      {item.name} <ChevronDown className={`h-[15px] w-[15px] transition-transform ${isModulesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isModulesOpen && (
                      <div id="dk-modules-menu" className="absolute inset-x-0 top-full z-50 mx-auto mt-1 w-[min(940px,92vw)] rounded-[26px] border border-[#E4DCCD] bg-white px-[30px] pb-[18px] pt-[30px] shadow-[0_30px_70px_-24px_rgba(15,23,42,0.3)]">
                        <div className="grid grid-cols-[1fr_1px_1fr] gap-7">
                          {moduleColumns.map((col, ci) => {
                            const HeadIcon = col.HeadIcon;
                            const revenue = col.tone === 'revenue';
                            return (
                              <div key={col.key} className="contents">
                                {ci > 0 && <div className="bg-[#E4DCCD]" aria-hidden="true" />}
                                <div>
                                  <p className={`mb-[18px] flex items-center gap-2.5 text-[12.5px] font-extrabold uppercase tracking-[0.16em] ${revenue ? 'text-[#BE2F47]' : 'text-[#7C5A2A]'}`}>
                                    <span className={`grid h-7 w-7 place-items-center rounded-lg ${revenue ? 'bg-[#FDECEF]' : 'bg-[#F3ECE1]'}`}><HeadIcon className="h-4 w-4" /></span>
                                    {col.title}
                                  </p>
                                  {col.items.map((mi) => {
                                    const Icon = mi.icon;
                                    const inner = (
                                      <>
                                        <span className={`grid h-[52px] w-[52px] place-items-center rounded-[14px] ${revenue ? 'bg-[#FDECEF] text-[#E94560]' : 'bg-[#F3ECE1] text-[#7C5A2A]'}`}><Icon className="h-5 w-5" /></span>
                                        <span>
                                          <span className="flex items-center gap-2 text-[17px] font-extrabold tracking-[-0.01em] text-slate-900">{mi.title}{mi.beta && <span className={betaBadge}>Beta</span>}</span>
                                          <span className="mb-1.5 mt-[3px] block text-[14.5px] text-slate-600">{mi.desc}</span>
                                          <span className="border-b-2 border-[#F4B8C3] text-sm font-bold text-slate-900">{t('mmMore')}</span>
                                        </span>
                                      </>
                                    );
                                    const cls = 'grid grid-cols-[52px_1fr] gap-4 rounded-2xl px-2.5 py-3 transition-colors hover:bg-[#F6F1E9]';
                                    // Hash link: a plain <a> so the homepage tab picks it up via `hashchange`.
                                    return mi.hash ? (
                                      <a key={mi.href} href={mi.href} className={cls} onClick={() => setIsModulesOpen(false)}>{inner}</a>
                                    ) : (
                                      <Link key={mi.href} href={mi.href} className={cls} onClick={() => setIsModulesOpen(false)}>{inner}</Link>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-[18px] flex flex-wrap items-center gap-3.5 rounded-2xl bg-[#F6F1E9] px-[18px] py-3.5">
                          <span className="rounded-full bg-[#FDECEF] px-3 py-1.5 text-[13.5px] font-bold text-[#BE2F47]">{t('mmPill')}</span>
                          <p className="m-0 min-w-[200px] flex-1 text-[15.5px] text-slate-700">{t('mmBand')}</p>
                          <a href={modulesTalkHref} target="_blank" rel="noopener noreferrer" className="text-[15px] font-extrabold text-slate-900 hover:text-[#BE2F47]">{t('mmTalk')}</a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              if (item.type === 'mega') {
                // «Alətlər» is a real link to /toolkit; hovering still shows the tools mega menu.
                return (
                  <div key={item.name} className="relative" onMouseEnter={() => setIsMegaMenuOpen(true)} onMouseLeave={() => setIsMegaMenuOpen(false)}>
                    <Link href={item.href} aria-current={isActivePath(item.href) ? 'page' : undefined} className={`${linkBase} ${isActivePath(item.href) ? linkOn : linkIdle}`}>
                      {item.name}
                    </Link>
                    <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
                  </div>
                );
              }
              if (item.type === 'franchise' || item.type === 'resources') {
                const isFr = item.type === 'franchise';
                const open = isFr ? isFranchiseOpen : isResourcesOpen;
                const setOpen = isFr ? setIsFranchiseOpen : setIsResourcesOpen;
                const active = isFr ? franchiseActive : resourcesActive;
                const links: ReadonlyArray<{ icon: typeof LayoutGrid; label: string; desc: string; href: string; beta?: boolean }> = isFr ? franchiseLinks : resourceLinks;
                return (
                  <div key={item.name} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
                    <button type="button" aria-expanded={open} onClick={() => setOpen((p) => !p)} className={`${linkBase} ${open || active ? linkOn : linkIdle}`}>
                      {item.name} <ChevronDown className={`h-[15px] w-[15px] transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {open && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}
                          className="absolute left-1/2 top-full z-50 w-[380px] -translate-x-1/2 pt-1.5">
                          <div className={popPanel}>
                            {links.map((fl) => {
                              const Icon = fl.icon;
                              const on = isActivePath(fl.href);
                              return (
                                <Link key={fl.href} href={fl.href} onClick={() => setOpen(false)} aria-current={on ? 'page' : undefined}
                                  className={`grid grid-cols-[40px_1fr] items-start gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-[#F6F1E9] ${on ? 'bg-[#F6F1E9]' : ''}`}>
                                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#E4DCCD] bg-white text-[#0F172A]"><Icon className="h-[20px] w-[20px]" strokeWidth={1.6} /></span>
                                  <span className="min-w-0">
                                    <span className="flex items-center gap-2 text-[15px] font-extrabold tracking-[-0.01em] text-[#0F172A]">{fl.label}{fl.beta && <span className={betaBadge}>Beta</span>}</span>
                                    <span className="mt-0.5 block text-[13px] leading-5 text-slate-600">{fl.desc}</span>
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
              return (
                <Link key={item.name} href={item.href} aria-current={isActivePath(item.href) ? 'page' : undefined} className={`${linkBase} ${isActivePath(item.href) ? linkOn : linkIdle}`}>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-1 xl:gap-1.5 min-[1440px]:gap-2">
            {/* Language (md+; the drawer has its own switcher) */}
            <div className="relative hidden md:block" ref={langRef}>
              <button type="button" onClick={() => setIsLangOpen((p) => !p)} aria-haspopup="menu" aria-expanded={isLangOpen} aria-controls="dk-lang-menu"
                aria-label={`${t('language')}: ${LOCALE_NAMES[currentLocale]}`} data-testid="lang-switcher"
                className={`inline-flex h-10 items-center gap-1 rounded-full px-2.5 text-[14px] font-bold transition-colors ${isLangOpen ? 'bg-white text-[#0F172A]' : 'text-[#0F172A] hover:bg-white/70'}`}>
                <Globe className="h-4 w-4 text-[#334155] lg:hidden" aria-hidden="true" />
                {localeLabels[currentLocale]}
                <ChevronDown className={`h-3.5 w-3.5 text-[#334155] transition-transform ${isLangOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {isLangOpen && (
                <div id="dk-lang-menu" role="menu" className={`absolute right-0 top-[calc(100%+8px)] z-50 w-52 ${popPanel}`}>
                  {locales.map((locale) => (
                    <Link key={locale} role="menuitem" href={switchLocalePath(pathname, locale)} hrefLang={locale} lang={locale}
                      aria-current={currentLocale === locale ? 'true' : undefined} onClick={() => setIsLangOpen(false)}
                      className={`flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 text-[14.5px] font-semibold transition-colors hover:bg-[#F6F1E9] ${currentLocale === locale ? 'text-[#0F172A]' : 'text-[#334155]'}`}>
                      <span>{LOCALE_NAMES[locale]}</span>
                      {currentLocale === locale ? <Check className="h-4 w-4 text-[#BE2F47]" aria-hidden="true" /> : <span className="text-[12px] font-bold text-slate-500">{localeLabels[locale]}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Account (md+): guest «Daxil ol ▾» menu (Daxil ol / Üzv ol — TASK-0521), or the member avatar menu */}
            {memberSession.loggedIn ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button type="button" onClick={() => setIsUserMenuOpen((p) => !p)} aria-haspopup="menu" aria-expanded={isUserMenuOpen} aria-label={t('account')} data-testid="member-menu-button"
                  className="flex h-10 items-center gap-1 rounded-full pl-0.5 pr-2 text-[#0F172A] transition-colors hover:bg-white/70">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0F172A] text-[12px] font-black text-white">{getMemberInitials(memberSession)}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-[#334155] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isUserMenuOpen && (
                  <div role="menu" className={`absolute right-0 top-[calc(100%+8px)] z-50 w-64 ${popPanel}`}>
                    <p className="truncate px-3 pb-2 pt-1.5 text-[13px] font-semibold text-slate-600">{memberSession.name || memberSession.email}</p>
                    {memberLinks.map((item) => { const Icon = item.icon; return (
                      <Link key={item.href} role="menuitem" href={item.href} onClick={() => setIsUserMenuOpen(false)}
                        className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[14.5px] font-semibold text-[#334155] transition-colors hover:bg-[#F6F1E9] hover:text-[#0F172A]">
                        <Icon className="h-4 w-4 text-slate-500" />{item.label}
                      </Link>
                    ); })}
                    <div className="my-1.5 h-px bg-[#EEE6D8]" />
                    <button type="button" role="menuitem" onClick={handleLogout}
                      className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[14.5px] font-semibold text-[#BE2F47] transition-colors hover:bg-[#FDECEF]">
                      <LogOut className="h-4 w-4" />{t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // TASK-0521 (owner 2026-10-09): guest account menu — user icon + «Daxil ol» ▾ opens a small
              // v2 dropdown with «Daxil ol» and «Üzv ol». Shares userMenuRef/isUserMenuOpen with the
              // member menu (only one renders), so outside-click and Esc already close it.
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button type="button" onClick={() => setIsUserMenuOpen((p) => !p)} aria-haspopup="menu" aria-expanded={isUserMenuOpen} aria-controls="dk-account-menu" data-testid="account-menu-button"
                  className={`inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[15px] font-semibold transition-colors ${isUserMenuOpen ? 'bg-white text-[#0F172A]' : 'text-[#334155] hover:bg-white/70 hover:text-[#0F172A]'}`}>
                  {/* RU at 1280–1439: «Войти ▾» without the icon — with it the row overflowed by 3px
                      (measured: 1283 vs 1280); AZ/EN/TR keep the icon on every width. */}
                  <UserRound className={`h-[18px] w-[18px] ${currentLocale === 'ru' ? 'xl:max-[1439px]:hidden' : ''}`} aria-hidden="true" />
                  {t('login')}
                  <ChevronDown className={`h-3.5 w-3.5 text-[#334155] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {isUserMenuOpen && (
                  <div id="dk-account-menu" role="menu" className={`absolute right-0 top-[calc(100%+8px)] z-50 w-56 ${popPanel}`}>
                    <Link role="menuitem" href="/auth/login" onClick={() => setIsUserMenuOpen(false)} data-testid="account-menu-login"
                      className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[14.5px] font-semibold text-[#334155] transition-colors hover:bg-[#F6F1E9] hover:text-[#0F172A]">
                      <UserRound className="h-4 w-4 text-slate-500" aria-hidden="true" />{t('login')}
                    </Link>
                    <Link role="menuitem" href="/auth/register" onClick={() => setIsUserMenuOpen(false)} data-testid="account-menu-register"
                      className="mt-1 flex min-h-11 items-center justify-center rounded-full bg-[#0F172A] px-3 text-[14.5px] font-bold text-white transition-colors hover:bg-[#1E293B]">
                      {t('register')}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* «Elan ver» — secondary outline pill on desktop (also in the drawer) */}
            <Link href={withLocale(currentLocale, '/ilan-ver')}
              className="hidden h-10 items-center whitespace-nowrap rounded-full border border-[#E4DCCD] bg-white px-4 text-[14px] font-bold text-[#0F172A] transition-colors hover:bg-[#EEE6D8] xl:inline-flex">
              {t('postShort')}
            </Link>

            {/* «Pulsuz diaqnostika» — the one red action (white on red = dk-red-strong) */}
            <a href={modulesTalkHref} target="_blank" rel="noopener noreferrer" data-testid="header-diag" title={t('diag')} aria-label={t('diag')}
              className="hidden h-10 items-center gap-2 whitespace-nowrap rounded-full bg-dk-red-strong px-4 text-[14px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(233,69,96,0.6)] transition-colors hover:bg-dk-red-deep sm:inline-flex lg:max-xl:w-10 lg:max-xl:justify-center lg:max-xl:px-0">
              <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
              {/* < lg: full label · lg–xl: icon only (the 6 nav links take the room) · xl+: compact label (RU «Бесплатная диагностика» does not fit) */}
              <span className="lg:hidden">{t('diag')}</span>
              <span className="hidden xl:inline">{t('diagShort')}</span>
            </a>

            {/* TASK-0519: v2 menu button (44px), opens the drawer below. */}
            <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#E4DCCD] bg-white text-[#0F172A] transition-colors hover:bg-[#EEE6D8] lg:hidden"
              onClick={() => setIsMobileOpen((p) => !p)} aria-label={t('menu')} aria-expanded={isMobileOpen} aria-controls="dk-mobile-menu" ref={menuBtnRef}>
              {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer (TASK-0519, < xl) ──────────────────
          Outside <header>: its backdrop-filter would turn `fixed` children into header-relative boxes.
          v2 language: cream sheet, ink type, one red action. Closes on route change, Esc, backdrop. */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-[90] lg:hidden">
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 bg-[#0F172A]/45"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              onClick={() => setIsMobileOpen(false)}
              data-testid="mobile-menu-backdrop"
            />
            <motion.aside
              id="dk-mobile-menu" role="dialog" aria-modal="true" aria-label={t('menu')}
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: [0.2, 0.8, 0.2, 1], duration: reduceMotion ? 0 : 0.28 }}
              className={`${inter.className} absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-[#F6F1E9] text-[#0F172A] shadow-[0_30px_70px_-24px_rgba(15,23,42,0.45)]`}
            >
              <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-[#E4DCCD] px-4">
                <Link href={withLocale(currentLocale, '/')} onClick={() => setIsMobileOpen(false)} className="flex min-h-11 items-center gap-2.5">
                  <BrandMark compact />
                </Link>
                <button type="button" ref={closeBtnRef} onClick={() => setIsMobileOpen(false)} aria-label={t('close')}
                  className="grid h-11 w-11 place-items-center rounded-full border border-[#E4DCCD] bg-white text-[#0F172A] transition-colors hover:bg-[#EEE6D8]">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-5 pt-4">
                {/* Həllər (was «Modullar») — same two groups and items as the desktop mega menu */}
                <p className="mb-2 px-1 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#334155]">{t('modules')}</p>
                <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
                  {moduleColumns.map((col) => {
                    const HeadIcon = col.HeadIcon;
                    const revenue = col.tone === 'revenue';
                    return (
                      <section key={col.key} className="min-w-0 rounded-[20px] border border-[#E4DCCD] bg-white p-2">
                        <p className={`flex items-center gap-2 px-2 pb-1 pt-1.5 text-[12px] font-extrabold uppercase tracking-[0.14em] ${revenue ? 'text-[#B8283F]' : 'text-[#7C5A2A]'}`}>
                          <span className={`grid h-6 w-6 place-items-center rounded-md ${revenue ? 'bg-[#FDECEF]' : 'bg-[#F3ECE1]'}`}><HeadIcon className="h-3.5 w-3.5" /></span>
                          {col.title}
                        </p>
                        {col.items.map((mi) => {
                          const Icon = mi.icon;
                          const inner = (
                            <>
                              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${revenue ? 'bg-[#FDECEF] text-[#D63B54]' : 'bg-[#F3ECE1] text-[#7C5A2A]'}`}><Icon className="h-[18px] w-[18px]" /></span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2 text-[15.5px] font-extrabold leading-tight tracking-[-0.01em] text-[#0F172A]">{mi.title}{mi.beta && <span className={betaBadge}>Beta</span>}</span>
                                <span className="mt-0.5 block truncate text-[13px] text-slate-600">{mi.desc}</span>
                              </span>
                              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                            </>
                          );
                          const cls = 'flex min-h-14 items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-[#F6F1E9] active:bg-[#F6F1E9]';
                          return mi.hash ? (
                            <a key={mi.href} href={mi.href} className={cls} onClick={() => setIsMobileOpen(false)}>{inner}</a>
                          ) : (
                            <Link key={mi.href} href={mi.href} className={cls} onClick={() => setIsMobileOpen(false)}>{inner}</Link>
                          );
                        })}
                      </section>
                    );
                  })}
                </div>

                {/* Existing nav items */}
                <nav aria-label={t('menu')} className="mt-4 overflow-hidden rounded-[20px] border border-[#E4DCCD] bg-white">
                  {drawerItems.map((item, idx) => {
                    const rowBase = `flex min-h-[52px] w-full items-center justify-between gap-3 px-4 text-left text-[16px] font-bold transition-colors hover:bg-[#F6F1E9] ${idx > 0 ? 'border-t border-[#EEE6D8]' : ''}`;
                    if (item.type === 'franchise' || item.type === 'resources') {
                      const isFr = item.type === 'franchise';
                      const open = isFr ? isMobileFranchiseOpen : isMobileResourcesOpen;
                      const active = isFr ? franchiseActive : resourcesActive;
                      const subs: Array<{ href: string; label: string; icon: typeof LayoutGrid | null; beta: boolean }> = isFr
                        ? franchiseLinks.map((fl) => ({ href: fl.href, label: fl.label, icon: fl.icon, beta: 'beta' in fl && fl.beta }))
                        : resourceLinks.map((rl) => ({ href: rl.href, label: rl.label, icon: rl.icon, beta: false }));
                      return (
                        <div key={item.name}>
                          <button type="button" aria-expanded={open}
                            className={`${rowBase} ${active ? 'text-[#D63B54]' : 'text-[#0F172A]'}`}
                            onClick={() => (isFr ? setIsMobileFranchiseOpen((p) => !p) : setIsMobileResourcesOpen((p) => !p))}>
                            {item.name}
                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                          </button>
                          {open && (
                            <div className="flex flex-col bg-[#FBF8F3] px-2 pb-2">
                              {subs.map((sub) => {
                                const SubIcon = sub.icon;
                                return (
                                  <Link key={sub.href} href={sub.href} onClick={() => setIsMobileOpen(false)}
                                    className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold text-slate-700 transition-colors hover:bg-white hover:text-[#0F172A]">
                                    {SubIcon && <SubIcon className="h-4 w-4 text-[#7C5A2A]" />}
                                    <span className="flex-1">{sub.label}</span>
                                    {sub.beta && <span className={betaBadge}>Beta</span>}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }
                    const href = item.href;
                    const active = isActivePath(href);
                    return (
                      <Link key={item.name} href={href} onClick={() => setIsMobileOpen(false)} aria-current={active ? 'page' : undefined}
                        className={`${rowBase} ${active ? 'text-[#D63B54]' : 'text-[#0F172A]'}`}>
                        {item.name}
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </Link>
                    );
                  })}
                </nav>

                {/* Language */}
                <div className="mt-4 flex items-center gap-3">
                  <Globe className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                  <div className="grid flex-1 grid-cols-4 gap-1 rounded-full border border-[#E4DCCD] bg-white p-1">
                    {locales.map((locale) => (
                      <Link key={locale} href={switchLocalePath(pathname, locale)} onClick={() => setIsMobileOpen(false)}
                        aria-current={currentLocale === locale ? 'true' : undefined}
                        className={`grid h-11 place-items-center rounded-full text-sm font-bold transition-colors ${currentLocale === locale ? 'bg-[#0F172A] text-white' : 'text-slate-700 hover:bg-[#F6F1E9]'}`}>
                        {localeLabels[locale]}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Account (Daxil ol / Üzv ol, or the member card) */}
                {memberSession.loggedIn ? (
                  <div className="mt-4 overflow-hidden rounded-[20px] border border-[#E4DCCD] bg-white">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0F172A] text-xs font-black text-white">{getMemberInitials(memberSession)}</span>
                      <span className="min-w-0 truncate text-[15px] font-bold text-[#0F172A]">{memberSession.name || memberSession.email}</span>
                    </div>
                    {memberLinks.map((item) => { const Icon = item.icon; return (
                      <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}
                        className="flex min-h-12 items-center gap-3 border-t border-[#EEE6D8] px-4 text-[15px] font-semibold text-slate-700 transition hover:bg-[#F6F1E9]">
                        <Icon className="h-4 w-4 text-slate-500" />{item.label}
                      </Link>
                    ); })}
                    <button type="button" onClick={handleLogout}
                      className="flex min-h-12 w-full items-center gap-3 border-t border-[#EEE6D8] px-4 text-left text-[15px] font-semibold text-[#B8283F] transition hover:bg-[#FDECEF]">
                      <LogOut className="h-4 w-4" />{t('logout')}
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link href="/auth/login" onClick={() => setIsMobileOpen(false)}
                      className="grid h-12 place-items-center rounded-full border border-[#E4DCCD] bg-white text-[15px] font-bold text-[#0F172A] transition hover:bg-[#EEE6D8]">{t('login')}</Link>
                    <Link href="/auth/register" onClick={() => setIsMobileOpen(false)}
                      className="grid h-12 place-items-center rounded-full bg-[#0F172A] text-[15px] font-bold text-white transition hover:bg-[#1E293B]">{t('register')}</Link>
                  </div>
                )}
              </div>

              {/* Actions: «Elan ver» only — TASK-0521 (owner 2026-10-09) removed «Pulsuz diaqnostika» from
                  the drawer footer; the red pill stays in the phone bar itself. */}
              <div className="grid gap-2 border-t border-[#E4DCCD] bg-[#F6F1E9] px-4 pb-[calc(12px+env(safe-area-inset-bottom,0px))] pt-3">
                <Link href={withLocale(currentLocale, '/ilan-ver')} onClick={() => setIsMobileOpen(false)}
                  className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#E4DCCD] bg-white px-5 text-[15px] font-bold text-[#0F172A] transition hover:bg-[#EEE6D8]">
                  {t('postListing')} <ArrowRight size={16} />
                </Link>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
