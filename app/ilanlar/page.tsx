'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeftRight,
  Crown,
  ShoppingBag,
  Users,
  TrendingUp,
  Building,
  Package,
  ChevronRight,
} from 'lucide-react';
import { LISTING_CATEGORIES } from '@/lib/data/listingCategories';

const iconMap: Record<string, React.ElementType> = {
  ArrowLeftRight,
  Crown,
  ShoppingBag,
  Users,
  TrendingUp,
  Building,
  Package,
};

export default function IlanlarPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <h1 className="text-4xl font-display font-extrabold text-slate-900 mb-3">
              HORECA B2B Elanlar
            </h1>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">
              Restoran devri, franchise, ortaq axtarisi, investisiya ve daha coxu — bir yerde.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LISTING_CATEGORIES.map((cat, index) => {
              const Icon = iconMap[cat.icon] || Package;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                >
                  <Link
                    href="/auth/register"
                    className="block bg-white rounded-2xl border border-gray-200 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-gray-300"
                  >
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${cat.color} text-white mb-4`}
                    >
                      <Icon size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      {cat.titleAz}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      {cat.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-400">
                      Elan vermek ucun qeydiyyatdan kec <ChevronRight size={14} />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
