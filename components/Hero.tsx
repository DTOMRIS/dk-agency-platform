'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, Award, Flame, Shield, Star } from 'lucide-react';
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
                <div className="text-2xl font-extrabold text-slate-900">150+</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-gray-500">
                  AKTİV RESTORAN
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">10</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-gray-500">
                  PULSUZ ALƏT
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">32%</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-gray-500">
                  XƏRC AZALMASI
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-red-500" />
                  <span className="text-sm font-bold text-slate-900">OCAQ Panel</span>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600">
                  Aktiv
                </span>
              </div>

              <div className="mb-5 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-gray-50 p-3.5">
                  <div className="mb-1.5 text-[11px] text-gray-400">Aylıq gəlir</div>
                  <div className="text-lg font-bold text-slate-900">24.500 ₼</div>
                  <div className="mt-1 text-[11px] font-semibold text-emerald-600">+12%</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-3.5">
                  <div className="mb-1.5 text-[11px] text-gray-400">Food cost</div>
                  <div className="text-lg font-bold text-slate-900">31.2%</div>
                  <div className="mt-1 text-[11px] font-semibold text-emerald-600">-3.1%</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-3.5">
                  <div className="mb-1.5 text-[11px] text-gray-400">Net mənfəət</div>
                  <div className="text-lg font-bold text-slate-900">4.200 ₼</div>
                  <div className="mt-1 text-[11px] font-semibold text-emerald-600">+8%</div>
                </div>
              </div>

              <div className="mb-4 rounded-xl bg-gray-50 p-3.5">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-amber-500" />
                  <span className="text-xs font-semibold text-slate-900">Menyu Matrisi</span>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-2.5 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span className="text-xs font-semibold text-slate-700">Ulduz</span>
                    <span className="ml-auto text-xs text-gray-400">8</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-purple-50 px-2.5 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span className="text-xs font-semibold text-slate-700">At</span>
                    <span className="ml-auto text-xs text-gray-400">5</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-2.5 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span className="text-xs font-semibold text-slate-700">Puzzle</span>
                    <span className="ml-auto text-xs text-gray-400">6</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 px-2.5 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span className="text-xs font-semibold text-slate-700">İt</span>
                    <span className="ml-auto text-xs text-gray-400">3</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-amber-200/30 bg-amber-50 p-3">
                <Shield size={16} className="text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">Sədd Rozeti</span>
                <span className="text-[11px] text-gray-500">— DK Agency auditindən keçib</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
