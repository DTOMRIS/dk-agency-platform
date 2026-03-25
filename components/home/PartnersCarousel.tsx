'use client';

import { motion } from 'framer-motion';
import { PARTNERS } from '@/components/constants';

export default function PartnersCarousel() {
  // Duplicate partners for infinite scroll effect
  const extendedPartners = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section id="partners" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <h2 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-3">TƏRƏFDAŞLARIMIZ</h2>
        <h3 className="text-3xl font-bold text-gray-900">Sektörün ən güclü tədarükçüləri</h3>
      </div>

      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>

        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="flex gap-12 items-center whitespace-nowrap"
        >
          {extendedPartners.map((partner, index) => (
            <div
              key={`${partner.id}-${index}`}
              className="flex items-center gap-4 bg-gray-50 px-8 py-6 rounded-2xl border border-gray-100 grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer group"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                  {partner.name}
                </div>
                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                  {partner.category}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-red-600 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <h4 className="text-2xl font-bold mb-2">Tədarükçü kimi qoşulun</h4>
            <p className="text-red-100">
              Məhsul və xidmətlərinizi 150+ aktiv restoran sahibinə təqdim edin. Şəbəkəmizin bir hissəsi olun.
            </p>
          </div>
          <button className="bg-white text-red-600 px-8 py-4 rounded-full font-bold hover:bg-red-50 transition-all whitespace-nowrap">
            Tərəfdaşlıq üçün müraciət
          </button>
        </div>
      </div>
    </section>
  );
}
