'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, PieChart, BarChart3, TrendingUp, CheckCircle2, Zap } from 'lucide-react';

export default function ToolkitShowcase() {
  const [activeTab, setActiveTab] = useState('pnl');

  const toolkits = [
    {
      id: 'pnl',
      title: 'P&L Hesablama',
      subtitle: 'Mənfəət və Zərər Hesabatı',
      description: 'Restoranınızın maliyyə sağlamlığını real vaxtda izləyin. Gəlirlər, xərclər və xalis mənfəət bir baxışda.',
      icon: <Calculator className="w-5 h-5" />,
      image: 'https://picsum.photos/seed/pnl-mock/1200/800',
      features: ['Avtomatik hesablama', 'Aylıq müqayisə', 'Xərc analizi'],
      accent: 'bg-blue-600'
    },
    {
      id: 'foodcost',
      title: 'Food Cost Kalkulyator',
      subtitle: 'Maya Dəyəri Analizi',
      description: 'Hər bir yeməyin maya dəyərini dəqiqliklə hesablayın. Menü mühəndisliyi ilə mənfəətinizi artırın.',
      icon: <PieChart className="w-5 h-5" />,
      image: 'https://picsum.photos/seed/foodcost-mock/1200/800',
      features: ['Resept idarəetməsi', 'İnqrediyent qiymətləri', 'Mənfəət marjası'],
      accent: 'bg-brand-red'
    },
    {
      id: 'market',
      title: 'Bazar Qiymətləri',
      subtitle: 'Real Vaxtda İzləmə',
      description: 'Ət, tərəvəz və digər əsas məhsulların bazar qiymətlərini izləyin. Ən sərfəli tədarükçünü tapın.',
      icon: <BarChart3 className="w-5 h-5" />,
      image: 'https://picsum.photos/seed/market-mock/1200/800',
      features: ['Gündəlik yenilənmə', 'Tədarükçü müqayisəsi', 'Qiymət xəbərdarlığı'],
      accent: 'bg-emerald-600'
    }
  ];

  const activeToolkit = toolkits.find(t => t.id === activeTab)!;

  return (
    <section id="toolkit" className="py-32 bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-100/50 -skew-x-12 translate-x-1/4"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
          {/* Left Side: Content */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-brand-red text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
                <Zap size={12} fill="currentColor" />
                Toolkit Showcase
              </div>
              <h3 className="text-5xl lg:text-6xl font-display font-extrabold text-slate-900 mb-8">
                Biznesinizi <br />
                <span className="text-slate-400">rəqəmlərlə</span> idarə edin
              </h3>
              
              {/* Tab Switcher */}
              <div className="inline-flex p-1.5 bg-white rounded-2xl border border-slate-200 mb-12 shadow-sm">
                {toolkits.map((toolkit) => (
                  <button
                    key={toolkit.id}
                    onClick={() => setActiveTab(toolkit.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeTab === toolkit.id
                        ? `${toolkit.accent} text-white shadow-lg`
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {toolkit.icon}
                    {toolkit.title}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <h4 className="text-3xl font-display font-bold text-slate-900 mb-4">{activeToolkit.subtitle}</h4>
                  <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">
                    {activeToolkit.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                    {activeToolkit.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-4 group">
                        <div className={`w-12 h-12 ${activeToolkit.accent} bg-opacity-10 rounded-2xl flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform`}>
                          <CheckCircle2 size={20} className={activeToolkit.accent.replace('bg-', 'text-')} />
                        </div>
                        <span className="font-bold text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-3 group active:scale-95 shadow-xl shadow-slate-900/10">
                    İndi İstifadə Et <TrendingUp size={22} className="group-hover:translate-y-[-2px] transition-transform" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Side: Mockup Image */}
          <div className="lg:w-1/2 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.1, rotate: 2 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                <div className="bg-white p-3 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100">
                  <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 aspect-[4/3]">
                    <img
                      src={activeToolkit.image}
                      alt={activeToolkit.title}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    {/* Overlay Mockup UI */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-white/20 rounded-full backdrop-blur-md"></div>
                        <div className="h-8 w-48 bg-white/40 rounded-full backdrop-blur-md"></div>
                      </div>
                      <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center text-white">
                        <Zap size={32} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Decorative Elements */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className={`absolute -top-10 -right-10 w-32 h-32 ${activeToolkit.accent} rounded-full opacity-10 blur-3xl`}
                ></motion.div>
                <motion.div 
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className={`absolute -bottom-10 -left-10 w-48 h-48 ${activeToolkit.accent} rounded-full opacity-5 blur-3xl`}
                ></motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
