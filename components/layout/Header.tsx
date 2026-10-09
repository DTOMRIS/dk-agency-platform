'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Bike, ChevronDown, ChevronRight, ClipboardCheck, FileText, Flame, Globe, LayoutGrid, LogOut, Menu, PieChart, Radar, ShoppingBag, Sparkles, UserRound, Wand2, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import MegaMenu from '@/components/layout/MegaMenu';
import { clearMemberSession, getGuestSession, readMemberSession, type MemberSession } from '@/lib/member-access';
import { localeLabels, locales, normalizeLocale, switchLocalePath, withLocale, type Locale } from '@/i18n/config';

// Inline nav copy — NOT dependent on NextIntlClientProvider (fixes stale locale on client nav)
const NAV_COPY: Record<Locale, Record<string, string>> = {
  az: { diag:'Pulsuz diaqnostika', close:'Bağla', home:'Ana səhifə', tools:'Alətlər', franchise:'Franchise', listings:'İlanlar', jobs:'İş elanları', news:'Sektor Nəbzi', blog:'Bloq', resources:'Resurslar', aboutUs:'Haqqımızda', panel:'İdarə Paneli', topBadge:'YENİ:', topText:'KAZAN AI sektorun AI məsləhətçisi kimi beta mərhələsindədir.', login:'Daxil ol', register:'Üzv ol', postListing:'Elan ver', account:'Hesabım', myListings:'Elanlarım', logout:'Çıxış', menu:'Menyu', frOverview:'Azərbaycanda Franchise', frReadiness:'Hazırlıq Testi', frRoi:'ROI Kalkulyatoru', frBuyer:'Alıcı Çek-listi', frBook:'AI Françbuk', frRadar:'Franchise Radar', modules:'Modullar', mmRevenue:'Gəlir artımı', mmCost:'Xərc nəzarəti', mmMenu:'Menyu Matrisi', mmMenuD:'Hansı yemək qazandırır, hansı yer tutur.', mmKazanD:'Sualınıza cavab və bir addım. Beta.', mmB2b:'B2B elanlar', mmB2bD:'Devir, icarə, avadanlıq və təchizatçı.', mmFoodD:'Hər yeməyi real maya dəyərinə görə qiymətləndirin.', mmDelivery:'Delivery komissiyası', mmDeliveryD:'Wolt, Bolt, Yango: əlinizdə qalan real pul.', mmOcaqD:'Çoxfilialı şəbəkədə gündəlik nəzarət.', mmMore:'Ətraflı →', mmPill:'Xüsusi xidmət', mmBand:'Alətlər pulsuzdur. Sistemi sizinlə birlikdə qururuq.', mmTalk:'Danışaq →', mmWa:'Salam Doğan bəy, DK Agency pulsuz diaqnostika istəyirəm.' },
  en: { diag:'Free diagnostic', close:'Close', home:'Home', tools:'Tools', franchise:'Franchise', listings:'Listings', jobs:'Jobs', news:'Sector Pulse', blog:'Blog', resources:'Resources', aboutUs:'About Us', panel:'Control Panel', topBadge:'NEW:', topText:'KAZAN AI is in beta as the sector AI advisor.', login:'Sign in', register:'Join', postListing:'Post listing', account:'My account', myListings:'My listings', logout:'Log out', menu:'Menu', frOverview:'Franchise in Azerbaijan', frReadiness:'Readiness Test', frRoi:'ROI Calculator', frBuyer:'Buyer Checklist', frBook:'AI Franchbook', frRadar:'Franchise Radar', modules:'Modules', mmRevenue:'Revenue growth', mmCost:'Cost control', mmMenu:'Menu Matrix', mmMenuD:'Which dish earns and which just takes up space.', mmKazanD:'An answer to your question and one step. Beta.', mmB2b:'B2B listings', mmB2bD:'Business transfer, lease, equipment and suppliers.', mmFoodD:'Price every dish on its real cost.', mmDelivery:'Delivery commission', mmDeliveryD:'Wolt, Bolt, Yango: the real money you keep.', mmOcaqD:'Daily control across a multi-branch chain.', mmMore:'Learn more →', mmPill:'Dedicated service', mmBand:'The tools are free. We build the system together with you.', mmTalk:'Let\'s talk →', mmWa:'Hello Doğan, I\'d like a free DK Agency diagnostic.' },
  ru: { diag:'Бесплатная диагностика', close:'Закрыть', home:'Главная', tools:'Инструменты', franchise:'Франшиза', listings:'Объявления', jobs:'Вакансии', news:'Пульс сектора', blog:'Блог', resources:'Ресурсы', aboutUs:'О нас', panel:'Панель управления', topBadge:'НОВОЕ:', topText:'KAZAN AI находится в бета-режиме как отраслевой AI-консультант.', login:'Войти', register:'Стать участником', postListing:'Разместить объявление', account:'Мой аккаунт', myListings:'Мои объявления', logout:'Выйти', menu:'Меню', frOverview:'Франшиза в Азербайджане', frReadiness:'Тест готовности', frRoi:'ROI Калькулятор', frBuyer:'Чек-лист покупателя', frBook:'AI Франчбук', frRadar:'Franchise Radar', modules:'Модули', mmRevenue:'Рост дохода', mmCost:'Контроль расходов', mmMenu:'Матрица меню', mmMenuD:'Какое блюдо зарабатывает, а какое занимает место.', mmKazanD:'Ответ на ваш вопрос и один шаг. Бета.', mmB2b:'B2B-объявления', mmB2bD:'Передача бизнеса, аренда, оборудование и поставщики.', mmFoodD:'Цените каждое блюдо по его реальной себестоимости.', mmDelivery:'Комиссия доставки', mmDeliveryD:'Wolt, Bolt, Yango: реальные деньги, которые остаются у вас.', mmOcaqD:'Ежедневный контроль в сети с филиалами.', mmMore:'Подробнее →', mmPill:'Особый сервис', mmBand:'Инструменты бесплатны. Систему строим вместе с вами.', mmTalk:'Поговорим →', mmWa:'Здравствуйте, Доган бей! Хочу бесплатную диагностику DK Agency.' },
  tr: { diag:'Ücretsiz teşhis', close:'Kapat', home:'Ana sayfa', tools:'Araçlar', franchise:'Franchise', listings:'İlanlar', jobs:'İş ilanları', news:'Sektör Nabzı', blog:'Blog', resources:'Kaynaklar', aboutUs:'Hakkımızda', panel:'Yönetim Paneli', topBadge:'YENİ:', topText:'KAZAN AI sektörün AI danışmanı olarak beta aşamasındadır.', login:'Giriş yap', register:'Üye ol', postListing:'İlan ver', account:'Hesabım', myListings:'İlanlarım', logout:'Çıkış', menu:'Menü', frOverview:"Azerbaycan'da Franchise", frReadiness:'Hazırlık Testi', frRoi:'ROI Hesaplayıcı', frBuyer:'Alıcı Kontrol Listesi', frBook:'AI Franchise Kitabı', frRadar:'Franchise Radar', modules:'Modüller', mmRevenue:'Gelir artışı', mmCost:'Maliyet kontrolü', mmMenu:'Menü Matrisi', mmMenuD:'Hangi yemek kazandırıyor, hangisi yer kaplıyor.', mmKazanD:'Sorunuza cevap ve bir adım. Beta.', mmB2b:'B2B ilanlar', mmB2bD:'Devir, kira, ekipman ve tedarikçi.', mmFoodD:'Her yemeği gerçek maliyetine göre fiyatlayın.', mmDelivery:'Paket servis komisyonu', mmDeliveryD:'Wolt, Bolt, Yango: elinizde kalan gerçek para.', mmOcaqD:'Çok şubeli zincirde günlük kontrol.', mmMore:'Ayrıntılar →', mmPill:'Özel hizmet', mmBand:'Araçlar ücretsiz. Sistemi sizinle birlikte kuruyoruz.', mmTalk:'Konuşalım →', mmWa:'Merhaba Doğan Bey, DK Agency ücretsiz teşhis istiyorum.' },
};

function getMemberInitials(session: MemberSession) {
  const source = session.name.trim() || session.email.trim();
  if (!source) return 'M';
  return source.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = normalizeLocale(pathname.split('/')[1]);
  const t = (key: string) => NAV_COPY[currentLocale]?.[key] ?? NAV_COPY.az[key] ?? key;

  const franchiseLinks = [
    // Pillar sehife — naviqasiyadan daxili link SEO ucun vacibdir; anchor metni acar sozdur (TASK-0432).
    { icon: LayoutGrid, label: t('frOverview'), href: withLocale(currentLocale, '/franchise') },
    { icon: Radar, label: t('frRadar'), href: withLocale(currentLocale, '/franchise/radar') },
    { icon: ClipboardCheck, label: t('frReadiness'), href: withLocale(currentLocale, '/franchise/hazirliq-testi') },
    { icon: PieChart, label: t('frRoi'), href: withLocale(currentLocale, '/franchise/roi-kalkulyatoru') },
    { icon: FileText, label: t('frBuyer'), href: withLocale(currentLocale, '/franchise/alici-cheklisti') },
    { icon: Wand2, label: t('frBook'), href: withLocale(currentLocale, '/franchise/francbuk-generatoru'), beta: true },
  ] as const;

  const resourceLinks = [
    { label: t('blog'), href: withLocale(currentLocale, '/blog') },
    { label: t('news'), href: withLocale(currentLocale, '/haberler') },
  ] as const;

  // TASK-0512: «Modullar» mega menu (owner-approved /tanitim design). OCAQ is sold, not self-served:
  // it opens the OCAQ tab of the homepage module section (`/#p-ocaq`), which links to WhatsApp.
  const moduleColumns = [
    {
      key: 'revenue', title: t('mmRevenue'), HeadIcon: ArrowUpRight, tone: 'revenue',
      items: [
        { icon: LayoutGrid, title: t('mmMenu'), desc: t('mmMenuD'), href: withLocale(currentLocale, '/toolkit/menu-matrix'), hash: false },
        { icon: Sparkles, title: 'KAZAN AI', desc: t('mmKazanD'), href: withLocale(currentLocale, '/kazan-ai'), hash: false },
        { icon: ShoppingBag, title: t('mmB2b'), desc: t('mmB2bD'), href: withLocale(currentLocale, '/ilanlar'), hash: false },
      ],
    },
    {
      key: 'cost', title: t('mmCost'), HeadIcon: ArrowDownLeft, tone: 'cost',
      items: [
        { icon: PieChart, title: 'Food Cost', desc: t('mmFoodD'), href: withLocale(currentLocale, '/toolkit/food-cost'), hash: false },
        { icon: Bike, title: t('mmDelivery'), desc: t('mmDeliveryD'), href: withLocale(currentLocale, '/toolkit/delivery-calc'), hash: false },
        { icon: Flame, title: 'OCAQ', desc: t('mmOcaqD'), href: `${withLocale(currentLocale, '/')}#p-ocaq`, hash: true },
      ],
    },
  ] as const;
  const modulesTalkHref = `/api/leads/whatsapp?text=${encodeURIComponent(t('mmWa'))}`;

  const memberLinks = [
    { label: t('account'), href: withLocale(currentLocale, '/settings'), icon: UserRound },
    { label: t('myListings'), href: withLocale(currentLocale, '/b2b-panel/ilanlarim'), icon: LayoutGrid },
  ] as const;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isFranchiseOpen, setIsFranchiseOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isMobileFranchiseOpen, setIsMobileFranchiseOpen] = useState(false);
  const [isMobileResourcesOpen, setIsMobileResourcesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const [memberSession, setMemberSession] = useState<MemberSession>(getGuestSession());
  const userMenuRef = useRef<HTMLDivElement>(null);
  const modulesRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  const navItems = [
    { name: t('modules'), href: '#', type: 'modules' },
    { name: t('tools'), href: '#', type: 'mega' },
    { name: t('franchise'), href: '#', type: 'franchise' },
    { name: t('listings'), href: withLocale(currentLocale, '/ilanlar'), type: 'link' },
    // TASK-0496: TQTA-powered jobs page (owner approved Header change 2026-10-06).
    // Desktop nav now starts at xl (1280px): with 6 items RU/EN labels wrapped at 1024px.
    { name: t('jobs'), href: withLocale(currentLocale, '/is-elanlari'), type: 'link' },
    { name: t('resources'), href: '#', type: 'resources' },
    { name: t('aboutUs'), href: withLocale(currentLocale, '/haqqimizda'), type: 'link' },
    ...(memberSession.loggedIn ? [{ name: t('panel'), href: withLocale(currentLocale, '/b2b-panel'), type: 'link' }] : []),
  ];

  useEffect(() => { const h = () => setIsScrolled(window.scrollY > 10); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);
  useEffect(() => { const s = () => setMemberSession(readMemberSession()); s(); window.addEventListener('storage', s); window.addEventListener('member-session-updated', s); return () => { window.removeEventListener('storage', s); window.removeEventListener('member-session-updated', s); }; }, []);
  useEffect(() => { const t = window.setTimeout(() => { setIsMobileOpen(false); setIsMegaMenuOpen(false); setIsFranchiseOpen(false); setIsMobileFranchiseOpen(false); setIsUserMenuOpen(false); setIsModulesOpen(false); setIsMobileResourcesOpen(false); }, 0); return () => window.clearTimeout(t); }, [pathname]);
  useEffect(() => { const h = (e: MouseEvent) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setIsUserMenuOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
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

  return (
    <>
      {/* ── Top bar ────────────────────────────────────────── */}
      <div className="hidden bg-[var(--dk-navy)] md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[var(--dk-gold)]">{t('topBadge')}</span>
            <span className="text-slate-300">{t('topText')}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1">
              {locales.map((locale, i) => (
                <span key={locale} className="flex items-center gap-1">
                  {i > 0 && <span className="text-slate-400" aria-hidden="true">|</span>}
                  <Link href={switchLocalePath(pathname, locale)} className={`inline-flex min-h-6 items-center px-1 ${currentLocale === locale ? 'font-bold text-white' : 'hover:text-white'}`}>
                    {localeLabels[locale]}
                  </Link>
                </span>
              ))}
            </div>
            <span className="text-slate-400" aria-hidden="true">|</span>
            {memberSession.loggedIn ? (
              <span className="text-white">{memberSession.name || memberSession.email}</span>
            ) : (
              <>
                <Link href="/auth/login" className="inline-flex min-h-6 items-center px-1 hover:text-white">{t('login')}</Link>
                <span className="text-slate-400" aria-hidden="true">|</span>
                <Link href="/auth/register" className="inline-flex min-h-6 items-center px-1 hover:text-white">{t('register')}</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main header ────────────────────────────────────── */}
      {/* TASK-0519: below xl the bar matches the v2 page (cream + hairline); desktop stays white. */}
      <header className={`sticky top-0 z-50 border-b border-[#E4DCCD] bg-[#F6F1E9] transition-all duration-300 xl:bg-white ${isScrolled ? 'xl:border-slate-200/80 xl:shadow-sm' : 'xl:border-transparent'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link href={withLocale(currentLocale, '/')} className="group flex items-center gap-2.5">
            <img src="/images/logo-mobil.png" alt="DK Agency Logo" className="h-9 w-9 shrink-0 object-contain" />
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-[-0.01em] text-[#0F172A] xl:font-bold xl:tracking-normal xl:text-[var(--dk-navy)]">DK Agency</span>
              <span className="hidden text-[10px] font-semibold tracking-wider text-dk-gold-text sm:block">USTALIĞIN NİŞANI</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 xl:flex xl:gap-0.5 2xl:gap-1">
            {navItems.map((item) => {
              if (item.type === 'modules') {
                // Not `relative`: the panel is positioned against the sticky <header> and centred on the page.
                return (
                  <div key={item.name} ref={modulesRef}>
                    <button type="button" aria-expanded={isModulesOpen} aria-controls="dk-modules-menu" onClick={() => setIsModulesOpen((p) => !p)}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-2 text-sm font-semibold transition-colors whitespace-nowrap xl:px-2 2xl:px-3 ${isModulesOpen ? 'bg-[#FDECEF] text-[#B8283F]' : 'text-slate-700 hover:bg-slate-50 hover:text-[var(--dk-navy)]'}`}>
                      {item.name} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isModulesOpen ? 'rotate-180' : ''}`} />
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
                                  <p className={`mb-[18px] flex items-center gap-2.5 text-[12.5px] font-extrabold uppercase tracking-[0.16em] ${revenue ? 'text-[#B8283F]' : 'text-[#7C5A2A]'}`}>
                                    <span className={`grid h-7 w-7 place-items-center rounded-lg ${revenue ? 'bg-[#FDECEF]' : 'bg-[#F3ECE1]'}`}><HeadIcon className="h-4 w-4" /></span>
                                    {col.title}
                                  </p>
                                  {col.items.map((mi) => {
                                    const Icon = mi.icon;
                                    const inner = (
                                      <>
                                        <span className={`grid h-[52px] w-[52px] place-items-center rounded-[14px] ${revenue ? 'bg-[#FDECEF] text-[#E94560]' : 'bg-[#F3ECE1] text-[#7C5A2A]'}`}><Icon className="h-5 w-5" /></span>
                                        <span>
                                          <span className="block text-[17px] font-extrabold tracking-[-0.01em] text-slate-900">{mi.title}</span>
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
                          <span className="rounded-full bg-[#FDECEF] px-3 py-1.5 text-[13.5px] font-bold text-[#B8283F]">{t('mmPill')}</span>
                          <p className="m-0 min-w-[200px] flex-1 text-[15.5px] text-slate-700">{t('mmBand')}</p>
                          <a href={modulesTalkHref} target="_blank" rel="noopener noreferrer" className="text-[15px] font-extrabold text-slate-900 hover:text-[var(--dk-red)]">{t('mmTalk')}</a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              if (item.type === 'mega') {
                return (
                  <div key={item.name} className="relative" onMouseEnter={() => setIsMegaMenuOpen(true)} onMouseLeave={() => setIsMegaMenuOpen(false)}>
                    <button type="button" onClick={() => setIsMegaMenuOpen((p) => !p)} className="inline-block rounded-lg px-2 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)] whitespace-nowrap xl:px-2 2xl:px-3">
                      {item.name}
                    </button>
                    <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
                  </div>
                );
              }
              if (item.type === 'franchise') {
                return (
                  <div key={item.name} className="relative" onMouseEnter={() => setIsFranchiseOpen(true)} onMouseLeave={() => setIsFranchiseOpen(false)}>
                    <button type="button" onClick={() => setIsFranchiseOpen((p) => !p)} className={`inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)] whitespace-nowrap xl:px-2 2xl:px-3 ${pathname.includes('/franchise') ? 'text-[var(--dk-navy)] font-bold' : 'text-slate-500'}`}>
                      {item.name} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isFranchiseOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isFranchiseOpen && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                          className="absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 rounded-2xl border border-[var(--dk-border-soft)] bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                          {franchiseLinks.map((fl) => {
                            const Icon = fl.icon;
                            const isActive = pathname.includes(fl.href.split('/').pop() || '');
                            return (
                              <Link key={fl.href} href={fl.href} onClick={() => setIsFranchiseOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-slate-50 ${isActive ? 'bg-slate-50 font-bold text-[var(--dk-navy)]' : 'text-slate-600'}`}>
                                <Icon className="h-4 w-4 text-[var(--dk-gold)]" />
                                <span className="flex-1">{fl.label}</span>
                                {'beta' in fl && fl.beta && <span className="rounded-full bg-[var(--dk-gold)]/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-dk-gold-text">BETA</span>}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
              if (item.type === 'resources') {
                return (
                  <div key={item.name} className="relative" onMouseEnter={() => setIsResourcesOpen(true)} onMouseLeave={() => setIsResourcesOpen(false)}>
                    <button type="button" onClick={() => setIsResourcesOpen((p) => !p)} className={`inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)] whitespace-nowrap xl:px-2 2xl:px-3 ${pathname.includes('/blog') || pathname.includes('/haberler') ? 'text-[var(--dk-navy)] font-bold' : 'text-slate-500'}`}>
                      {item.name} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isResourcesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isResourcesOpen && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                          className="absolute left-1/2 top-full z-50 w-52 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                          {resourceLinks.map((rl) => (
                            <Link key={rl.href} href={rl.href} onClick={() => setIsResourcesOpen(false)}
                              className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-[var(--dk-navy)]">
                              {rl.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
              return (
                <Link key={item.name} href={item.href} className="rounded-lg px-2 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)] whitespace-nowrap xl:px-2 2xl:px-3">
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link href={withLocale(currentLocale, '/ilan-ver')}
              className="hidden items-center gap-2 rounded-xl bg-[var(--dk-gold)] px-4 py-2.5 text-sm font-bold text-[var(--dk-navy)] transition-all hover:opacity-90 active:scale-95 whitespace-nowrap xl:inline-flex xl:px-4 2xl:px-5">
              {t('postListing')} <ArrowRight size={16} className="hidden 2xl:block" />
            </Link>

            {memberSession.loggedIn ? (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button type="button" onClick={() => setIsUserMenuOpen((p) => !p)}
                  className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[var(--dk-navy)] shadow-sm transition hover:border-[var(--dk-gold)]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--dk-navy)] text-xs font-black text-white">{getMemberInitials(memberSession)}</span>
                  <span className="max-w-[140px] truncate">{memberSession.name || memberSession.email}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    {memberLinks.map((item) => { const Icon = item.icon; return (
                      <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-[var(--dk-navy)]">
                        <Icon className="h-4 w-4 text-slate-400" />{item.label}
                      </Link>
                    ); })}
                    <div className="my-2 h-px bg-slate-100" />
                    <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[var(--dk-red)] transition hover:bg-red-50">
                      <LogOut className="h-4 w-4" />{t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="hidden text-sm text-slate-500 transition-colors hover:text-[var(--dk-navy)] sm:inline-block">{t('login')}</Link>
                <Link href="/auth/register" className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)] sm:inline-block">{t('register')}</Link>
              </>
            )}

            {/* TASK-0519: v2 menu button (44px), opens the drawer below. */}
            <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-[#E4DCCD] bg-white text-[#0F172A] transition-colors hover:bg-[#EEE6D8] xl:hidden"
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
          <div className="fixed inset-0 z-[90] xl:hidden">
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
              className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-[#F6F1E9] text-[#0F172A] shadow-[0_30px_70px_-24px_rgba(15,23,42,0.45)]"
            >
              <div className="flex items-center justify-between border-b border-[#E4DCCD] px-4 py-3">
                <Link href={withLocale(currentLocale, '/')} onClick={() => setIsMobileOpen(false)} className="flex min-h-11 items-center gap-2.5">
                  <img src="/images/logo-mobil.png" alt="DK Agency Logo" className="h-9 w-9 shrink-0 object-contain" />
                  <span className="text-base font-extrabold tracking-[-0.01em] text-[#0F172A]">DK Agency</span>
                </Link>
                <button type="button" ref={closeBtnRef} onClick={() => setIsMobileOpen(false)} aria-label={t('close')}
                  className="grid h-11 w-11 place-items-center rounded-full border border-[#E4DCCD] bg-white text-[#0F172A] transition-colors hover:bg-[#EEE6D8]">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-5 pt-4">
                {/* Modullar — same two groups and items as the desktop mega menu */}
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
                                <span className="block text-[15.5px] font-extrabold leading-tight tracking-[-0.01em] text-[#0F172A]">{mi.title}</span>
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
                  {navItems.filter((item) => item.type !== 'modules').map((item, idx) => {
                    const rowBase = `flex min-h-[52px] w-full items-center justify-between gap-3 px-4 text-left text-[16px] font-bold transition-colors hover:bg-[#F6F1E9] ${idx > 0 ? 'border-t border-[#EEE6D8]' : ''}`;
                    if (item.type === 'franchise' || item.type === 'resources') {
                      const isFr = item.type === 'franchise';
                      const open = isFr ? isMobileFranchiseOpen : isMobileResourcesOpen;
                      const active = isFr ? pathname.includes('/franchise') : pathname.includes('/blog') || pathname.includes('/haberler');
                      const subs: Array<{ href: string; label: string; icon: typeof LayoutGrid | null; beta: boolean }> = isFr
                        ? franchiseLinks.map((fl) => ({ href: fl.href, label: fl.label, icon: fl.icon, beta: 'beta' in fl && fl.beta }))
                        : resourceLinks.map((rl) => ({ href: rl.href, label: rl.label, icon: null, beta: false }));
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
                                    {sub.beta && <span className="rounded-full bg-[#F3ECE1] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#7C5A2A]">BETA</span>}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }
                    const href = item.type === 'mega' ? withLocale(currentLocale, '/toolkit') : item.href;
                    const active = pathname === href || pathname.startsWith(`${href}/`);
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

                {/* Account */}
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

              {/* Actions: one red (white-on-red = dk-red-strong) + Elan ver */}
              <div className="grid gap-2 border-t border-[#E4DCCD] bg-[#F6F1E9] px-4 pb-[calc(12px+env(safe-area-inset-bottom,0px))] pt-3">
                <a href={modulesTalkHref} target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileOpen(false)}
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-dk-red-strong px-5 text-[15px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(233,69,96,0.6)] transition hover:bg-dk-red-deep">
                  {t('diag')} <ArrowRight size={16} />
                </a>
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
