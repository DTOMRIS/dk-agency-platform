'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, Award, Flame, Star, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-[#FAFAF8] pt-32 pb-20 overflow-hidden">
      {/* Subtle radial gradient accent */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_top_right,_rgba(217,179,16,0.08)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* SOL TARAF */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-amber-200/40 rounded-full px-4 py-1.5 mb-6">
              <Award size={14} className="text-amber-600" />
              <span className="text-xs font-semibold text-amber-600">
                Azərbaycanın ilk AI-dəstəkli HoReCa platforması
              </span>
            </div>

            {/* Başlıq */}
            <h1
              className="font-display font-extrabold leading-[1.1] tracking-tight text-slate-900 mb-5"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)' }}
            >
              Restoranın niyə
              <br />
              <span className="text-[#E94560]">pul itirdiyin</span>i
              <br />
              bilmirsən?
            </h1>

            {/* Alt mesaj */}
            <p className="text-lg text-gray-500 leading-relaxed max-w-lg mb-2">
              Biz tapırıq, düzəldirik. Pulsuz alətlər, ekspert bilgi, AI
              dəstəyi — hamısı bir platformada.
            </p>
            <p className="text-sm text-amber-600 italic mb-8">
              Dijital loncanın ustaları — duz-çörək haqqını qoruyuruq.
            </p>

            {/* CTA butonları */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-[#E94560] text-white px-7 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-red-500/25 hover:shadow-xl transition-shadow"
              >
                İndi başla
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#toolkit"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-7 py-3.5 rounded-xl font-semibold text-base border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Play size={16} fill="currentColor" />
                Alətləri kəşf et
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12">
              <div>
                <div className="text-2xl font-extrabold text-slate-900">150+</div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">
                  AKTİV RESTORAN
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">9</div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">
                  PULSUZ ALƏT
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">32%</div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">
                  XƏRC AZALMASI
                </div>
              </div>
            </div>
          </motion.div>

          {/* SAĞ TARAF — OCAQ Panel Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-200">
              {/* Üst kısım */}
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-red-500" />
                  <span className="text-sm font-bold text-slate-900">OCAQ Panel</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full">
                  Aktiv
                </span>
              </div>

              {/* 3 metrik kartı */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-gray-50 rounded-xl p-3.5">
                  <div className="text-[11px] text-gray-400 mb-1.5">Aylıq gəlir</div>
                  <div className="text-lg font-bold text-slate-900">24.500 ₼</div>
                  <div className="text-[11px] font-semibold text-emerald-600 mt-1">+12%</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3.5">
                  <div className="text-[11px] text-gray-400 mb-1.5">Food cost</div>
                  <div className="text-lg font-bold text-slate-900">31.2%</div>
                  <div className="text-[11px] font-semibold text-emerald-600 mt-1">-3.1%</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3.5">
                  <div className="text-[11px] text-gray-400 mb-1.5">Net mənfəət</div>
                  <div className="text-lg font-bold text-slate-900">4.200 ₼</div>
                  <div className="text-[11px] font-semibold text-emerald-600 mt-1">+8%</div>
                </div>
              </div>

              {/* Menyu Matrisi mini */}
              <div className="bg-gray-50 rounded-xl p-3.5 mb-4">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-amber-500" />
                  <span className="text-xs font-semibold text-slate-900">Menyu Matrisi</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2.5">
                  <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-2.5 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-xs font-semibold text-slate-700">Ulduz</span>
                    <span className="text-xs text-gray-400 ml-auto">8</span>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-50 rounded-lg px-2.5 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span className="text-xs font-semibold text-slate-700">At</span>
                    <span className="text-xs text-gray-400 ml-auto">5</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-2.5 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-xs font-semibold text-slate-700">Puzzle</span>
                    <span className="text-xs text-gray-400 ml-auto">6</span>
                  </div>
                  <div className="flex items-center gap-2 bg-red-50 rounded-lg px-2.5 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-xs font-semibold text-slate-700">İt</span>
                    <span className="text-xs text-gray-400 ml-auto">3</span>
                  </div>
                </div>
              </div>

              {/* Şədd Rozeti */}
              <div className="flex items-center gap-2 bg-amber-50 rounded-xl p-3 border border-amber-200/30">
                <Shield size={16} className="text-amber-600" />
                <span className="text-xs font-semibold text-amber-600">Şədd Rozeti</span>
                <span className="text-[11px] text-gray-400">— DK Agency audit keçib</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
