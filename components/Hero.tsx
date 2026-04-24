'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Award, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--dk-paper)] pb-20 pt-32">
      <div className="pointer-events-none absolute right-0 top-0 h-[60%] w-[60%] bg-[radial-gradient(ellipse_at_top_right,rgba(233,69,96,0.10)_0%,transparent_70%)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200/50 bg-white px-4 py-1.5">
              <Award size={14} className="text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">
                Azərbaycanın ilk AI-dəstəkli HoReCa platforması
              </span>
            </div>

            <h1
              className="mb-5 font-display font-extrabold leading-[1.06] tracking-tight text-slate-900"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)' }}
            >
              Restoranın niyə
              <br />
              <span className="text-[var(--dk-red)]">pul itirdiyini</span>
              <br />
              bilmirsən?
            </h1>

            <p className="mb-2 max-w-lg text-lg leading-relaxed text-slate-700">
              Biz tapırıq, düzəldirik. Pulsuz alətlər, ekspert bilikləri və AI dəstəyi
              bir platformada.
            </p>
            <p className="mb-8 text-sm italic text-amber-700">
              Bu sektorda duz-çörək haqqını qoruyan sistem qururuq.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--dk-red)] px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-red-500/25 transition-shadow hover:shadow-xl"
              >
                İndi başla
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#toolkit"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-900 transition-colors hover:bg-gray-50"
              >
                <Play size={16} fill="currentColor" />
                Alətləri kəşf et
              </Link>
            </div>

            <div className="mt-12 flex gap-8">
              <div>
                <div className="text-2xl font-extrabold text-slate-900">BETA</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-gray-500">
                  Pilot proqram açıqdır
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">10+</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-gray-500">
                  Pulsuz alət
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">AI</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-gray-500">
                  KAZAN dəstəyi
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <Image
              src="/images/dk-hero-illustration.png"
              alt="DK Agency HoReCa idarəetmə illüstrasiyası"
              width={720}
              height={520}
              priority
              className="ml-auto max-h-[400px] w-full object-contain"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
