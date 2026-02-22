'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, Megaphone, User } from 'lucide-react';

const items = [
  { href: '/', label: 'Ana', icon: Home },
  { href: '/haberler', label: 'Xeberler', icon: Newspaper },
  { href: '/b2b-panel', label: 'Ilanlar', icon: Megaphone },
  { href: '/auth/login', label: 'Hesab', icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#8892B020] bg-[#0A0A1A]/95 backdrop-blur-md">
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] ${
                  active ? 'text-[#C5A022]' : 'text-[#B0B8C8]'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
