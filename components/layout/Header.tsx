'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Bike, ChevronDown, ClipboardCheck, FileText, Flame, Globe, LayoutGrid, LogOut, Menu, PieChart, Radar, ShoppingBag, Sparkles, UserRound, Wand2, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import MegaMenu from '@/components/layout/MegaMenu';
import { clearMemberSession, getGuestSession, readMemberSession, type MemberSession } from '@/lib/member-access';
import { localeLabels, locales, normalizeLocale, switchLocalePath, withLocale, type Locale } from '@/i18n/config';

// Inline nav copy — NOT dependent on NextIntlClientProvider (fixes stale locale on client nav)
const NAV_COPY: Record<Locale, Record<string, string>> = {
  az: { home:'Ana səhifə', tools:'Alətlər', franchise:'Franchise', listings:'İlanlar', jobs:'İş elanları', news:'Sektor Nəbzi', blog:'Bloq', resources:'Resurslar', aboutUs:'Haqqımızda', panel:'İdarə Paneli', topBadge:'YENİ:', topText:'KAZAN AI sektorun AI məsləhətçisi kimi beta mərhələsindədir.', login:'Daxil ol', register:'Üzv ol', postListing:'Elan ver', account:'Hesabım', myListings:'Elanlarım', logout:'Çıxış', menu:'Menyu', frOverview:'Azərbaycanda Franchise', frReadiness:'Hazırlıq Testi', frRoi:'ROI Kalkulyatoru', frBuyer:'Alıcı Çek-listi', frBook:'AI Françbuk', frRadar:'Franchise Radar', modules:'Modullar', mmRevenue:'Gəlir artımı', mmCost:'Xərc nəzarəti', mmMenu:'Menyu Matrisi', mmMenuD:'Hansı yemək qazandırır, hansı yer tutur.', mmKazanD:'Sualınıza cavab və bir addım. Beta.', mmB2b:'B2B elanlar', mmB2bD:'Devir, icarə, avadanlıq və təchizatçı.', mmFoodD:'Hər yeməyi real maya dəyərinə görə qiymətləndirin.', mmDelivery:'Delivery komissiyası', mmDeliveryD:'Wolt, Bolt, Yango: əlinizdə qalan real pul.', mmOcaqD:'Çoxfilialı şəbəkədə gündəlik nəzarət.', mmMore:'Ətraflı →', mmPill:'Xüsusi xidmət', mmBand:'Alətlər pulsuzdur. Sistemi sizinlə birlikdə qururuq.', mmTalk:'Danışaq →', mmWa:'Salam Doğan bəy, DK Agency pulsuz diaqnostika istəyirəm.' },
  en: { home:'Home', tools:'Tools', franchise:'Franchise', listings:'Listings', jobs:'Jobs', news:'Sector Pulse', blog:'Blog', resources:'Resources', aboutUs:'About Us', panel:'Control Panel', topBadge:'NEW:', topText:'KAZAN AI is in beta as the sector AI advisor.', login:'Sign in', register:'Join', postListing:'Post listing', account:'My account', myListings:'My listings', logout:'Log out', menu:'Menu', frOverview:'Franchise in Azerbaijan', frReadiness:'Readiness Test', frRoi:'ROI Calculator', frBuyer:'Buyer Checklist', frBook:'AI Franchbook', frRadar:'Franchise Radar', modules:'Modules', mmRevenue:'Revenue growth', mmCost:'Cost control', mmMenu:'Menu Matrix', mmMenuD:'Which dish earns and which just takes up space.', mmKazanD:'An answer to your question and one step. Beta.', mmB2b:'B2B listings', mmB2bD:'Business transfer, lease, equipment and suppliers.', mmFoodD:'Price every dish on its real cost.', mmDelivery:'Delivery commission', mmDeliveryD:'Wolt, Bolt, Yango: the real money you keep.', mmOcaqD:'Daily control across a multi-branch chain.', mmMore:'Learn more →', mmPill:'Dedicated service', mmBand:'The tools are free. We build the system together with you.', mmTalk:'Let\'s talk →', mmWa:'Hello Doğan, I\'d like a free DK Agency diagnostic.' },
  ru: { home:'Главная', tools:'Инструменты', franchise:'Франшиза', listings:'Объявления', jobs:'Вакансии', news:'Пульс сектора', blog:'Блог', resources:'Ресурсы', aboutUs:'О нас', panel:'Панель управления', topBadge:'НОВОЕ:', topText:'KAZAN AI находится в бета-режиме как отраслевой AI-консультант.', login:'Войти', register:'Стать участником', postListing:'Разместить объявление', account:'Мой аккаунт', myListings:'Мои объявления', logout:'Выйти', menu:'Меню', frOverview:'Франшиза в Азербайджане', frReadiness:'Тест готовности', frRoi:'ROI Калькулятор', frBuyer:'Чек-лист покупателя', frBook:'AI Франчбук', frRadar:'Franchise Radar', modules:'Модули', mmRevenue:'Рост дохода', mmCost:'Контроль расходов', mmMenu:'Матрица меню', mmMenuD:'Какое блюдо зарабатывает, а какое занимает место.', mmKazanD:'Ответ на ваш вопрос и один шаг. Бета.', mmB2b:'B2B-объявления', mmB2bD:'Передача бизнеса, аренда, оборудование и поставщики.', mmFoodD:'Цените каждое блюдо по его реальной себестоимости.', mmDelivery:'Комиссия доставки', mmDeliveryD:'Wolt, Bolt, Yango: реальные деньги, которые остаются у вас.', mmOcaqD:'Ежедневный контроль в сети с филиалами.', mmMore:'Подробнее →', mmPill:'Особый сервис', mmBand:'Инструменты бесплатны. Систему строим вместе с вами.', mmTalk:'Поговорим →', mmWa:'Здравствуйте, Доган бей! Хочу бесплатную диагностику DK Agency.' },
  tr: { home:'Ana sayfa', tools:'Araçlar', franchise:'Franchise', listings:'İlanlar', jobs:'İş ilanları', news:'Sektör Nabzı', blog:'Blog', resources:'Kaynaklar', aboutUs:'Hakkımızda', panel:'Yönetim Paneli', topBadge:'YENİ:', topText:'KAZAN AI sektörün AI danışmanı olarak beta aşamasındadır.', login:'Giriş yap', register:'Üye ol', postListing:'İlan ver', account:'Hesabım', myListings:'İlanlarım', logout:'Çıkış', menu:'Menü', frOverview:"Azerbaycan'da Franchise", frReadiness:'Hazırlık Testi', frRoi:'ROI Hesaplayıcı', frBuyer:'Alıcı Kontrol Listesi', frBook:'AI Franchise Kitabı', frRadar:'Franchise Radar', modules:'Modüller', mmRevenue:'Gelir artışı', mmCost:'Maliyet kontrolü', mmMenu:'Menü Matrisi', mmMenuD:'Hangi yemek kazandırıyor, hangisi yer kaplıyor.', mmKazanD:'Sorunuza cevap ve bir adım. Beta.', mmB2b:'B2B ilanlar', mmB2bD:'Devir, kira, ekipman ve tedarikçi.', mmFoodD:'Her yemeği gerçek maliyetine göre fiyatlayın.', mmDelivery:'Paket servis komisyonu', mmDeliveryD:'Wolt, Bolt, Yango: elinizde kalan gerçek para.', mmOcaqD:'Çok şubeli zincirde günlük kontrol.', mmMore:'Ayrıntılar →', mmPill:'Özel hizmet', mmBand:'Araçlar ücretsiz. Sistemi sizinle birlikte kuruyoruz.', mmTalk:'Konuşalım →', mmWa:'Merhaba Doğan Bey, DK Agency ücretsiz teşhis istiyorum.' },
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
  const [isMobileModulesOpen, setIsMobileModulesOpen] = useState(false);
  const [memberSession, setMemberSession] = useState<MemberSession>(getGuestSession());
  const userMenuRef = useRef<HTMLDivElement>(null);
  const modulesRef = useRef<HTMLDivElement>(null);

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
  useEffect(() => { const t = window.setTimeout(() => { setIsMobileOpen(false); setIsMegaMenuOpen(false); setIsFranchiseOpen(false); setIsMobileFranchiseOpen(false); setIsUserMenuOpen(false); setIsModulesOpen(false); setIsMobileModulesOpen(false); }, 0); return () => window.clearTimeout(t); }, [pathname]);
  useEffect(() => { const h = (e: MouseEvent) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setIsUserMenuOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
  useEffect(() => {
    if (!isModulesOpen) return;
    const onDown = (e: MouseEvent) => { if (modulesRef.current && !modulesRef.current.contains(e.target as Node)) setIsModulesOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsModulesOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [isModulesOpen]);

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
                  {i > 0 && <span className="text-slate-500">|</span>}
                  <Link href={switchLocalePath(pathname, locale)} className={currentLocale === locale ? 'font-bold text-white' : 'hover:text-white'}>
                    {localeLabels[locale]}
                  </Link>
                </span>
              ))}
            </div>
            <span className="text-slate-500">|</span>
            {memberSession.loggedIn ? (
              <span className="text-white">{memberSession.name || memberSession.email}</span>
            ) : (
              <>
                <Link href="/auth/login" className="hover:text-white">{t('login')}</Link>
                <span className="text-slate-500">|</span>
                <Link href="/auth/register" className="hover:text-white">{t('register')}</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main header ────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${isScrolled ? 'border-b border-slate-200/80 shadow-sm' : ''}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link href={withLocale(currentLocale, '/')} className="group flex items-center gap-2.5">
            <img src="/images/logo-mobil.png" alt="DK Agency Logo" className="h-9 w-9 shrink-0 object-contain" />
            <div className="flex flex-col">
              <span className="text-base font-bold text-[var(--dk-navy)]">DK Agency</span>
              <span className="hidden text-[9px] font-medium tracking-wider text-[var(--dk-gold)] sm:block">USTALIĞIN NİŞANI</span>
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
                                {'beta' in fl && fl.beta && <span className="rounded-full bg-[var(--dk-gold)]/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[var(--dk-gold)]">BETA</span>}
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

            <button className="rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 xl:hidden" onClick={() => setIsMobileOpen((p) => !p)} aria-label={t('menu')}>
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ──────────────────────────────────── */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
              className="absolute left-3 right-3 top-full z-50 mt-2 max-h-[calc(100vh-88px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:left-4 sm:right-4 sm:p-6 xl:hidden">
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  if (item.type === 'modules') {
                    return (
                      <div key={item.name}>
                        <button type="button" aria-expanded={isMobileModulesOpen}
                          className="flex w-full items-center justify-between rounded-xl p-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50"
                          onClick={() => setIsMobileModulesOpen((p) => !p)}>
                          {item.name}
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isMobileModulesOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isMobileModulesOpen && (
                          <div className="ml-3 flex flex-col gap-0.5 border-l-2 border-[#F4B8C3] pb-2 pl-3">
                            {moduleColumns.flatMap((col) => col.items).map((mi) => {
                              const Icon = mi.icon;
                              const cls = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)]';
                              return mi.hash ? (
                                <a key={mi.href} href={mi.href} className={cls} onClick={() => setIsMobileOpen(false)}><Icon className="h-4 w-4 text-[var(--dk-red)]" />{mi.title}</a>
                              ) : (
                                <Link key={mi.href} href={mi.href} className={cls} onClick={() => setIsMobileOpen(false)}><Icon className="h-4 w-4 text-[var(--dk-red)]" />{mi.title}</Link>
                              );
                            })}
                            <a href={modulesTalkHref} target="_blank" rel="noopener noreferrer" className="rounded-lg px-3 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-50">{t('mmPill')} · {t('mmTalk')}</a>
                          </div>
                        )}
                      </div>
                    );
                  }
                  if (item.type === 'franchise') {
                    return (
                      <div key={item.name}>
                        <button type="button"
                          className={`flex w-full items-center justify-between rounded-xl p-3 text-base font-medium transition-colors hover:bg-slate-50 ${pathname.includes('/franchise') ? 'text-[var(--dk-navy)] font-bold' : 'text-slate-700'}`}
                          onClick={() => setIsMobileFranchiseOpen((p) => !p)}>
                          {item.name}
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isMobileFranchiseOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isMobileFranchiseOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                              className="overflow-hidden">
                              <div className="ml-3 flex flex-col gap-0.5 border-l-2 border-[var(--dk-gold)]/30 pl-3 pb-2">
                                {franchiseLinks.map((fl) => {
                                  const Icon = fl.icon;
                                  return (
                                    <Link key={fl.href} href={fl.href}
                                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)]"
                                      onClick={() => setIsMobileOpen(false)}>
                                      <Icon className="h-4 w-4 text-[var(--dk-gold)]" />
                                      <span className="flex-1">{fl.label}</span>
                                      {'beta' in fl && fl.beta && <span className="rounded-full bg-[var(--dk-gold)]/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[var(--dk-gold)]">BETA</span>}
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
                  if (item.type === 'resources') {
                    return (
                      <div key={item.name}>
                        <button type="button"
                          className={`flex w-full items-center justify-between rounded-xl p-3 text-base font-medium transition-colors hover:bg-slate-50 ${pathname.includes('/blog') || pathname.includes('/haberler') ? 'text-[var(--dk-navy)] font-bold' : 'text-slate-700'}`}
                          onClick={() => setIsMobileResourcesOpen((p) => !p)}>
                          {item.name}
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isMobileResourcesOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isMobileResourcesOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                              className="overflow-hidden">
                              <div className="ml-3 flex flex-col gap-0.5 border-l-2 border-slate-200 pl-3 pb-2">
                                {resourceLinks.map((rl) => (
                                  <Link key={rl.href} href={rl.href}
                                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                    onClick={() => setIsMobileOpen(false)}>
                                    {rl.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }
                  return (
                    <Link key={item.name} href={item.type === 'mega' ? withLocale(currentLocale, '/toolkit') : item.href}
                      className="rounded-xl p-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)]"
                      onClick={() => setIsMobileOpen(false)}>
                      {item.name}
                    </Link>
                  );
                })}
                <Link href={withLocale(currentLocale, '/blog')}
                  className="rounded-xl p-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[var(--dk-navy)]"
                  onClick={() => setIsMobileOpen(false)}>
                  {t('blog')}
                </Link>
                <Link href={withLocale(currentLocale, '/ilan-ver')}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-gold)] py-3 font-bold text-[var(--dk-navy)]"
                  onClick={() => setIsMobileOpen(false)}>
                  {t('postListing')} <ArrowRight size={16} />
                </Link>
                <div className="my-3 h-px bg-slate-100" />
                <div className="flex items-center gap-2 px-3 py-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <div className="flex items-center gap-1">
                    {locales.map((locale, i) => (
                      <span key={locale} className="flex items-center gap-1">
                        {i > 0 && <span className="text-slate-300">|</span>}
                        <Link href={switchLocalePath(pathname, locale)}
                          className={`rounded-md px-2 py-1 text-sm font-medium transition-colors ${currentLocale === locale ? 'bg-[var(--dk-navy)] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                          onClick={() => setIsMobileOpen(false)}>
                          {localeLabels[locale]}
                        </Link>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="my-3 h-px bg-slate-100" />
                {memberSession.loggedIn ? (
                  <>
                    {memberLinks.map((item) => { const Icon = item.icon; return (
                      <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl p-3 text-base font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setIsMobileOpen(false)}>
                        <Icon className="h-4 w-4 text-slate-400" />{item.label}
                      </Link>
                    ); })}
                    <button type="button" onClick={handleLogout} className="flex items-center gap-3 rounded-xl p-3 text-left text-base font-medium text-[var(--dk-red)] transition hover:bg-red-50">
                      <LogOut className="h-4 w-4" />{t('logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="rounded-xl p-3 text-base font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setIsMobileOpen(false)}>{t('login')}</Link>
                    <Link href="/auth/register" className="rounded-xl p-3 text-base font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setIsMobileOpen(false)}>{t('register')}</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
