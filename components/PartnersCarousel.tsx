'use client';

import { motion } from 'framer-motion';
import { PARTNERS } from '@/components/constants';

export default function PartnersCarousel() {
  const extendedPartners = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section id="partners" className="overflow-hidden bg-white py-24">
      <div className="mx-auto mb-12 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-red-600">TƏRƏFDAŞLARIMIZ</h2>
        <h3 className="text-3xl font-bold text-gray-900">Sektorun güclü tərəfdaşları</h3>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-white to-transparent" />
        <div className="absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-white to-transparent" />

        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-12 whitespace-nowrap"
        >
          {extendedPartners.map((partner, index) => (
            <div
              key={`${partner.id}-${index}`}
              className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-8 py-6 transition-all duration-500 hover:grayscale-0"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-bold text-gray-900 transition-colors group-hover:text-red-600">
                  {partner.name}
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  {partner.category}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-red-600 p-10 text-white md:flex-row">
          <div className="max-w-xl text-center md:text-left">
            <h4 className="mb-2 text-2xl font-bold">Tədarükçü kimi qoşulun</h4>
            <p className="text-red-100">
              Məhsul və xidmətlərinizi 150+ aktiv restoran sahibinə təqdim edin. Şəbəkəmizin bir hissəsi olun.
            </p>
          </div>
          <button className="whitespace-nowrap rounded-full bg-white px-8 py-4 font-bold text-red-600 transition-all hover:bg-red-50">
            Tərəfdaşlıq üçün müraciət
          </button>
        </div>
      </div>
    </section>
  );
}
