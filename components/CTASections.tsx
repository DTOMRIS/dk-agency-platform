'use client';

import { motion } from 'framer-motion';
import { BookOpen, Check, Sparkles, Send } from 'lucide-react';

export function DoganNote() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 text-center">
        {/* BookOpen icon circle */}
        <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200/30 flex items-center justify-center mx-auto mb-6">
          <BookOpen size={28} className="text-amber-600" />
        </div>

        {/* Quote */}
        <blockquote className="text-xl sm:text-2xl font-medium text-slate-900 italic leading-relaxed mb-5">
          &ldquo;700 il əvvəl bir usta, çırağının belinə Şədd bağlayanda &mdash; bu sadəcə bir qumaş parçası deyildi. O dükanın keyfiyyətinə verilən bir namus sözü idi. Bu gün biz, HoReCa dünyasında eyni yemini dijital üçün edirik.&rdquo;
        </blockquote>

        {/* Name */}
        <div className="text-sm text-gray-500">
          <span className="font-semibold text-slate-900">Doğan Tomris</span> &mdash; DK Agency qurucusu
        </div>

        {/* Cavanmerdlik */}
        <div className="text-xs text-amber-600 italic mt-2">
          Biz bu sektorun Cavənmərdləriyik.
        </div>
      </div>
    </section>
  );
}

export function JoinCTA() {
  return (
    <section id="join" className="py-32 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-24 relative overflow-hidden shadow-2xl">
          {/* Background Mesh */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#e11d48_0%,transparent_50%)] blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-red text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                  <Sparkles size={12} fill="currentColor" />
                  İNDİ QOŞULUN
                </div>
                <h3 className="text-5xl lg:text-6xl font-display font-black text-white mb-8 leading-tight tracking-tighter">
                  Agentlik əməliyyatlarınızı <br />
                  <span className="text-brand-red italic px-2">növbəti səviyyəyə</span> daşıyın
                </h3>
                <p className="text-lg text-slate-400 mb-12 leading-relaxed font-medium">
                  Yüzlərlə uğurlu lahiyədə olduğu kimi, siz də DK AGENCY ailəsinə qoşulun və strateji üstünlük qazanın.
                </p>
                
                <div className="space-y-6">
                  {[
                    'Bütün strateji alətlərə limitsiz giriş',
                    'KAZAN AI ilə 24/7 əməliyyat dəstəyi',
                    'Eksklüziv investisiya imkanları',
                    'Ödənişsiz ilk strateji konsultasiya'
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-4 text-white text-sm font-bold">
                      <div className="w-5 h-5 bg-brand-red rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={12} />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="lg:w-1/2 w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2.5rem] p-10 shadow-2xl"
              >
                <h4 className="text-2xl font-display font-black text-slate-900 mb-8 text-center uppercase tracking-tight">Müraciət et</h4>
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adınız</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:border-brand-red transition-colors" placeholder="Məs: Elvin" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Soyadınız</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:border-brand-red transition-colors" placeholder="Məs: Məmmədov" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-poçt</label>
                    <input type="email" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:border-brand-red transition-colors" placeholder="elvin@agency.az" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Şirkət / Layihə Adı</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:border-brand-red transition-colors" placeholder="Məs: Grand Holding" />
                  </div>
                  <button className="w-full bg-brand-red text-white py-5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-brand-red/20 flex items-center justify-center gap-3 active:scale-95">
                    Göndər <Send size={16} />
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
