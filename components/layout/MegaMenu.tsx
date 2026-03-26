'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import {
  BarChart3,
  Bot,
  Building2,
  Calculator,
  CheckSquare,
  ClipboardList,
  FileText,
  HardHat,
  MapPin,
  Megaphone,
  Network,
  Package,
  Paintbrush,
  Palette,
  Scale,
  TrendingUp,
  UserSearch,
  UtensilsCrossed,
  Wrench,
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
  { icon: ClipboardList, label: 'Açılış Checklist', desc: 'Addım-addım açılış planı', href: '/toolkit/checklist' },
  { icon: HardHat, label: 'İnşaatdan Açılışa', desc: '52 maddəlik tikinti sprinti', href: '/toolkit/insaat-checklist' },
  { icon: FileText, label: 'Rəsmi işlər', desc: 'AQTA və uyğunluq yoxlaması', href: '/toolkit/aqta-checklist' },
  { icon: MapPin, label: 'Məkan seçimi', desc: 'Checklist daxilində lokasiya qərarları', href: '/toolkit/checklist' },
  { icon: Palette, label: 'Konsept hazırlama', desc: 'Brend və mövqe seçimi', href: '/toolkit/branding-guide' },
  { icon: UtensilsCrossed, label: 'Menyu mühəndisliyi', desc: 'Qiymətləndirmə və star analiz', href: '/toolkit/menu-matrix' },
  { icon: Megaphone, label: 'Marketinq', desc: 'Brend dili və tanıtım planı', href: '/toolkit/branding-guide' },
  { icon: Wrench, label: 'Ekipman kataloqu', desc: 'Ekipman kateqoriyalarına bax', href: '/ilanlar' },
  { icon: Paintbrush, label: 'Korporativ kimlik', desc: 'Loqo, rəng və vizual dil', href: '/toolkit/branding-guide' },
];

const boyutItems: MenuItemData[] = [
  { icon: BarChart3, label: 'Mənfəət-zərər (P&L)', desc: 'Gəlir-xərc analizi', href: '/toolkit/pnl' },
  { icon: Calculator, label: 'Ərzaq maya dəyəri', desc: 'Porsiya maya hesabla', href: '/toolkit/food-cost' },
  { icon: Scale, label: 'Başabaş analizi', desc: 'Break-even nöqtəsi', href: '/toolkit/basabas' },
  { icon: TrendingUp, label: 'Bazar qiymətləri', desc: 'Food cost daxilində bazar məntiqi', href: '/toolkit/food-cost' },
  { icon: CheckSquare, label: 'Əməliyyat checklist', desc: 'Gigiyena və gündəlik nəzarət', href: '/toolkit/aqta-checklist' },
  { icon: Bot, label: 'KAZAN AI', desc: 'AI konsultant', href: '/kazan-ai', badge: 'TEZLİKLƏ' },
];

const devirItems: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: Building2, label: 'Restoran devri', href: '/ilanlar' },
  { icon: Package, label: 'Ekipman satışı', href: '/ilanlar' },
  { icon: Network, label: 'Franchise', href: '/ilanlar' },
  { icon: UserSearch, label: 'İşlətmeci tap', href: '/ilanlar' },
];

const popularItems = [
  { label: 'P&L hesablama', href: '/toolkit/pnl' },
  { label: 'Açılış checklist', href: '/toolkit/checklist' },
  { label: 'Food Cost', href: '/toolkit/food-cost' },
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
          className="absolute top-full left-1/2 z-50 w-[90vw] max-w-[880px] -translate-x-1/2 rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
          onMouseLeave={onClose}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-gray-900">DK Agency Platforması</p>
              <p className="mt-0.5 text-sm text-gray-500">
                Restoranını planla, idarə et, böyüt, bir platformada.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/toolkit"
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Wrench size={14} />
                Bütün alətlər
              </Link>
            </div>
          </div>

          <div className="my-6 h-px bg-gray-100" />

          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="mb-3">
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#E94560]">Başla</p>
                <div className="mt-1 h-0.5 w-6 bg-[#E94560]" />
              </div>
              <div className="flex flex-col gap-0.5">
                {baslaItems.map((item) => (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-red-50/50"
                  >
                    <item.icon
                      size={18}
                      className="mt-0.5 shrink-0 text-gray-400 transition-colors group-hover:text-[#E94560]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#E94560]">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3">
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#C5A022]">Böyüt</p>
                <div className="mt-1 h-0.5 w-6 bg-[#C5A022]" />
              </div>
              <div className="flex flex-col gap-0.5">
                {boyutItems.map((item) => (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-amber-50/50"
                  >
                    <item.icon
                      size={18}
                      className="mt-0.5 shrink-0 text-gray-400 transition-colors group-hover:text-[#C5A022]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#C5A022]">
                        {item.label}
                        {item.badge && (
                          <span className="ml-2 inline-block rounded-full bg-amber-100 px-2 align-middle text-[10px] font-bold text-amber-800">
                            {item.badge}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="my-6 h-px bg-gray-100" />

          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-[#8B5CF6]">Devir & Satış</p>
            <div className="flex flex-wrap gap-1">
              {devirItems.map((item) => (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-purple-50/50 hover:text-[#8B5CF6]"
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="my-4 h-px bg-gray-100" />

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#E94560]">Populyar:</span>
            {popularItems.map((item, index) => (
              <span key={item.href} className="flex items-center gap-2">
                {index > 0 && <span className="text-gray-300">&middot;</span>}
                <Link href={item.href} className="text-gray-500 transition-colors hover:text-[#E94560]">
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
