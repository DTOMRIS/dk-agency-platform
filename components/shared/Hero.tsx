'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle2, Users, Star } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-950">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2070" 
          alt="Premium Restaurant Background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40 scale-105 animate-slow-zoom"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950"></div>
        <div className="absolute inset-0 mesh-gradient opacity-30"></div>
      </div>

      {/* Animated Mesh Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-red/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -40, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-blue-600/20 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/90 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-sm">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              Sektörün Lider Əməliyyat Platforması
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-display font-extrabold text-white leading-[1.1] mb-8">
              Restoranını <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-rose-400">sistemlə</span> <br />
              idarə et.
            </h1>
            
            <p className="text-xl text-slate-400 mb-12 max-w-xl leading-relaxed font-medium">
              Açılışdan əməliyyata, analitikadan elanlara qədər bir platforma. FoodByUs/Restaurant365 səviyyəsində panel və tədarük şəbəkəsi.
            </p>

            <div className="flex flex-wrap gap-5">
              <button className="bg-brand-red text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-rose-600 transition-all shadow-2xl shadow-brand-red/40 flex items-center gap-3 group active:scale-95">
                Pulsuz Başla <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white/5 backdrop-blur-xl text-white border border-white/10 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Play size={18} fill="currentColor" className="ml-1" />
                </div>
                Necə işləyir?
              </button>
            </div>

            {/* Features List */}
            <div className="mt-16 flex flex-wrap gap-x-8 gap-y-4">
              {[
                "10+ Hazır Blog Yazısı",
                "P&L və Food Cost Toolkit",
                "TQTA Kadr Pipeline",
                "Sektör Tərəfdaşları"
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 text-slate-400">
                  <div className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative p-2 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-[0_0_100px_rgba(225,29,72,0.15)]">
              <div className="relative bg-slate-950 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden aspect-[4/3.5]">
                {/* Mockup Header */}
                <div className="h-12 bg-slate-900 border-b border-white/5 flex items-center px-6 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                  </div>
                  <div className="ml-6 h-5 w-48 bg-slate-800 rounded-lg border border-white/5"></div>
                </div>
                
                {/* Mockup Content */}
                <div className="p-8 grid grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-6">
                    <div className="h-40 bg-white/5 rounded-2xl border border-white/10 p-5">
                      <div className="flex justify-between items-center mb-6">
                        <div className="h-4 w-28 bg-slate-800 rounded-md"></div>
                        <div className="h-4 w-12 bg-emerald-500/20 rounded-md"></div>
                      </div>
                      <div className="flex items-end gap-3 h-16">
                        {[40, 70, 45, 90, 65, 80, 55, 75, 60, 85].map((h, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 0.5 + i * 0.05, duration: 1 }}
                            className="flex-1 bg-gradient-to-t from-brand-red to-rose-400 rounded-t-sm" 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="h-28 bg-white/5 rounded-2xl border border-white/10 p-5">
                        <div className="h-3 w-16 bg-slate-800 rounded mb-3"></div>
                        <div className="text-2xl font-display font-bold text-white">48,200 ₼</div>
                        <div className="text-[10px] text-emerald-500 font-bold mt-1">↑ 12.5%</div>
                      </div>
                      <div className="h-28 bg-white/5 rounded-2xl border border-white/10 p-5">
                        <div className="h-3 w-16 bg-slate-800 rounded mb-3"></div>
                        <div className="text-2xl font-display font-bold text-white">1,240</div>
                        <div className="text-[10px] text-rose-500 font-bold mt-1">↓ 2.1%</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-full bg-white/5 rounded-2xl border border-white/10 p-5">
                      <div className="h-4 w-20 bg-slate-800 rounded mb-8"></div>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4 mb-5">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5"></div>
                          <div className="space-y-2">
                            <div className="h-2.5 w-20 bg-slate-800 rounded"></div>
                            <div className="h-2 w-12 bg-slate-900 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Stats Card */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 hidden xl:block"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-brand-red shadow-inner">
                  <Users size={28} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Aylıq İstifadəçi</div>
                  <div className="text-3xl font-display font-extrabold text-slate-900">12,400+</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/5 backdrop-blur-3xl border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Aktiv Restoran", value: "150+" },
              { label: "Xərc Azalması", value: "%32" },
              { label: "Aylıq Əməliyyat", value: "48K" },
              { label: "Tərəfdaş Şəbəkəsi", value: "50+" }
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-4xl font-display font-extrabold text-white mb-2 group-hover:scale-110 transition-transform">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
