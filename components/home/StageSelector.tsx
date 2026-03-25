'use client';

import { motion } from 'framer-motion';
import { Rocket, TrendingUp, RefreshCcw, ChevronRight, Sparkles } from 'lucide-react';

export default function StageSelector() {
  const stages = [
    {
      id: 'start',
      title: '🏗 BAŞLA',
      subtitle: 'Restoran açanlar üçün',
      description: 'Açılış checklisti, rəsmi işlər bələdçisi, mekan seçimi və konsept hazırlama.',
      icon: <Rocket className="w-8 h-8" />,
      color: 'from-blue-600 to-indigo-600',
      shadow: 'shadow-blue-500/20',
      items: ['Checklist', 'ASAN/AQTA', 'Menü Mühəndisliyi']
    },
    {
      id: 'grow',
      title: '🚀 BÖYÜT',
      subtitle: 'Mövcud sahibkarlar üçün',
      description: 'P&L hesablama, Food Cost kalkulyatoru, bazar qiymətləri və KAZAN AI.',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-brand-red to-rose-600',
      shadow: 'shadow-brand-red/20',
      items: ['P&L Toolkit', 'Food Cost', 'Bazar Qiymətləri'],
      featured: true
    },
    {
      id: 'exit',
      title: '🔄 DEVİR & SATIŞ',
      subtitle: 'Çıxış istəyənlər üçün',
      description: 'İşletme devri elanları, ekipman satışı, franchise və ortak axtarışı.',
      icon: <RefreshCcw className="w-8 h-8" />,
      color: 'from-emerald-600 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      items: ['Devir Elanları', 'Ekipman Satışı', 'Ortaqlıq']
    }
  ];

  return (
    <section id="stages" className="py-32 bg-white relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-brand-red text-[10px] font-bold uppercase tracking-[0.3em] mb-6"
          >
            <Sparkles size={12} />
            Mərhələni Seç
          </motion.div>
          <h2 className="text-5xl lg:text-6xl font-display font-extrabold text-slate-900 mb-6">
            Sən hansı mərhələdəsən?
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            İstər yeni başlayın, istərsə də mövcud biznesinizi böyüdün — biz hər addımda yanınızdayıq.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className={`group relative bg-white rounded-[2.5rem] p-10 border transition-all duration-500 ${
                stage.featured 
                  ? 'border-brand-red/20 shadow-[0_30px_60px_-15px_rgba(225,29,72,0.15)] ring-1 ring-brand-red/5' 
                  : 'border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-slate-200 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]'
              }`}
            >
              {stage.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-red text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand-red/20">
                  Ən Populyar
                </div>
              )}

              <div className={`w-20 h-20 bg-gradient-to-br ${stage.color} rounded-3xl flex items-center justify-center text-white mb-10 shadow-2xl ${stage.shadow} group-hover:scale-110 transition-transform duration-500`}>
                {stage.icon}
              </div>

              <h4 className="text-3xl font-display font-extrabold text-slate-900 mb-2">{stage.title}</h4>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">{stage.subtitle}</p>
              
              <p className="text-slate-500 mb-10 leading-relaxed font-medium">
                {stage.description}
              </p>

              <div className="space-y-4 mb-12">
                {stage.items.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${stage.color}`}></div>
                    {item}
                  </div>
                ))}
              </div>

              <button className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                stage.featured 
                  ? 'bg-brand-red text-white hover:bg-rose-600 shadow-xl shadow-brand-red/20' 
                  : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
              }`}>
                Daha ətraflı <ChevronRight size={20} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
