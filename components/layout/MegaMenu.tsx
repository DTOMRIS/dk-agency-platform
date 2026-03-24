'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ClipboardList,
  FileText,
  MapPin,
  Palette,
  UtensilsCrossed,
  Megaphone,
  Wrench,
  Paintbrush,
  BarChart3,
  Calculator,
  Scale,
  TrendingUp,
  CheckSquare,
  Bot,
  Building2,
  Package,
  Network,
  UserSearch,
  Stethoscope,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MenuItemData {
  icon: LucideIcon;
  label: string;
  desc: string;
  href: string;
  badge?: string;
}

const baslaItems: MenuItemData[] = [
  { icon: ClipboardList, label: 'Acilis Checklist', desc: 'Addim-addim acilis plani', href: '/basla/checklist' },
  { icon: FileText, label: 'Resmi Isler', desc: 'ASAN, AQTA, vergi', href: '/basla/resmi-isler' },
  { icon: MapPin, label: 'Mekan Secimi', desc: 'Lokasiya, icare', href: '/basla/mekan' },
  { icon: Palette, label: 'Konsept Hazirlama', desc: 'Hedef kutle, brend', href: '/basla/konsept' },
  { icon: UtensilsCrossed, label: 'Menyu Muhendisliyi', desc: 'Qiymetlendirme, star analiz', href: '/basla/menu' },
  { icon: Megaphone, label: 'Marketing', desc: 'Acilis kampaniyasi', href: '/basla/marketing' },
  { icon: Wrench, label: 'Ekipman Kataloqu', desc: '500+ pesekar avadanliq', href: '/basla/ekipman' },
  { icon: Paintbrush, label: 'Kurumsal Kimlik', desc: 'Logo, reng, numuneler', href: '/basla/kurumsal-kimlik' },
];

const boyutItems: MenuItemData[] = [
  { icon: BarChart3, label: 'Menfeet-Zerer (P&L)', desc: 'Gelir-xerc analizi', href: '/b2b-panel/toolkit/pnl-simulator' },
  { icon: Calculator, label: 'Erzaq Maya Deyeri', desc: 'Porsiya maya hesabla', href: '/b2b-panel/toolkit/food-cost' },
  { icon: Scale, label: 'Basabas Analizi', desc: 'Break-even noqtesi', href: '/b2b-panel/toolkit/basabas' },
  { icon: TrendingUp, label: 'Bazar Qiymetleri', desc: 'Heftelik erzaq qiymetleri', href: '/b2b-panel/toolkit/qiymetler' },
  { icon: CheckSquare, label: 'Emeliyyat Checklist', desc: 'Gundelik, heftelik', href: '/b2b-panel/toolkit/checklist' },
  { icon: Bot, label: 'KAZAN AI', desc: 'AI konsultant', href: '/kazan-ai', badge: 'TEZLIKLE' },
];

const devirItems: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: Building2, label: 'Restoran Devri', href: '/b2b-panel/ilanlarim?tur=devir' },
  { icon: Package, label: 'Ekipman Satisi', href: '/b2b-panel/ilanlarim?tur=ekipman' },
  { icon: Network, label: 'Franchise', href: '/b2b-panel/ilanlarim?tur=franchise' },
  { icon: UserSearch, label: 'Isletmeci Tap', href: '/b2b-panel/ilanlarim?tur=isletmeci' },
];

const popularItems = [
  { label: 'P&L Hesablama', href: '/b2b-panel/toolkit/pnl-simulator' },
  { label: 'Acilis Checklist', href: '/basla/checklist' },
  { label: 'Food Cost', href: '/b2b-panel/toolkit/food-cost' },
];

export default function MegaMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-1/2 -translate-x-1/2 bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 max-w-[880px] w-[90vw] z-50"
          onMouseLeave={onClose}
        >
          {/* Top section */}
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-gray-900">DK Agency Platformasi</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Restoranini planla, idare et, boyut — bir platformada.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/b2b-panel/toolkit"
                className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Wrench size={14} />
                Butun aletler
              </Link>
              <Link
                href="/test"
                className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Stethoscope size={14} />
                Saglamliq testi
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 my-6" />

          {/* Two column grid */}
          <div className="grid grid-cols-2 gap-8">
            {/* BASLA column */}
            <div>
              <div className="mb-3">
                <p className="text-xs font-extrabold text-[#E94560] uppercase tracking-widest">
                  BASLA
                </p>
                <div className="w-6 h-0.5 bg-[#E94560] mt-1" />
              </div>
              <div className="flex flex-col gap-0.5">
                {baslaItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-start gap-3 p-2 rounded-lg hover:bg-red-50/50 transition-colors"
                  >
                    <item.icon
                      size={18}
                      className="text-gray-400 group-hover:text-[#E94560] transition-colors mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#E94560] transition-colors">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* BOYUT column */}
            <div>
              <div className="mb-3">
                <p className="text-xs font-extrabold text-[#C5A022] uppercase tracking-widest">
                  BOYUT
                </p>
                <div className="w-6 h-0.5 bg-[#C5A022] mt-1" />
              </div>
              <div className="flex flex-col gap-0.5">
                {boyutItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50/50 transition-colors"
                  >
                    <item.icon
                      size={18}
                      className="text-gray-400 group-hover:text-[#C5A022] transition-colors mt-0.5 shrink-0"
                    />
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-[#C5A022] transition-colors">
                          {item.label}
                          {item.badge && (
                            <span className="ml-2 inline-block bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full px-2 align-middle">
                              {item.badge}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 my-6" />

          {/* DEVIR & SATIS */}
          <div>
            <p className="text-xs font-extrabold text-[#8B5CF6] uppercase tracking-widest mb-3">
              DEVIR & SATIS
            </p>
            <div className="flex flex-wrap gap-1">
              {devirItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#8B5CF6] hover:bg-purple-50/50 px-3 py-2 rounded-lg transition-colors"
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 my-4" />

          {/* Popular */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#E94560] font-bold">Populyar:</span>
            {popularItems.map((item, idx) => (
              <span key={item.href} className="flex items-center gap-2">
                {idx > 0 && <span className="text-gray-300">&middot;</span>}
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-[#E94560] transition-colors"
                >
                  {item.label}
                </Link>
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
