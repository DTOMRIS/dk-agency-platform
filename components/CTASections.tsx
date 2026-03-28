'use client';

import { motion } from 'framer-motion';
import { BookOpen, Check, Send, Sparkles } from 'lucide-react';

export function DoganNote() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-200/30 bg-amber-50">
          <BookOpen size={28} className="text-amber-600" />
        </div>

        <blockquote className="mb-5 text-xl font-medium italic leading-relaxed text-slate-900 sm:text-2xl">
          “700 il əvvəl bir usta, şagirdinin belinə Şədd bağlayanda bu sadəcə bir parça parça deyildi.
          Bu, keyfiyyətə verilən namus sözü idi. Bu gün biz eyni sözü rəqəmlə və sistemlə qoruyuruq.”
        </blockquote>

        <div className="text-sm text-gray-500">
          <span className="font-semibold text-slate-900">Doğan Tomris</span> — DK Agency qurucusu
        </div>
        <div className="mt-2 text-xs italic text-amber-600">Bu sektorda cavanmərdlik hələ də vacibdir.</div>
      </div>
    </section>
  );
}

export function JoinCTA() {
  return (
    <section id="join" className="relative overflow-hidden bg-slate-50 py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-12 shadow-2xl lg:p-24">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_50%_50%,var(--dk-red)_0%,transparent_50%)] blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-20 lg:flex-row">
            <div className="lg:w-1/2">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-red">
                  <Sparkles size={12} fill="currentColor" />
                  İNDİ QOŞULUN
                </div>
                <h3 className="mb-8 text-5xl font-display font-black leading-tight tracking-tighter text-white lg:text-6xl">
                  Agentlik əməliyyatlarınızı
                  <br />
                  <span className="px-2 italic text-brand-red">növbəti səviyyəyə</span> daşıyın
                </h3>
                <p className="mb-12 text-lg font-medium leading-relaxed text-slate-400">
                  Strateji alətlər, KAZAN AI dəstəyi və sistemli idarəetmə ilə daha güclü nəticə alın.
                </p>

                <div className="space-y-6">
                  {[
                    'Bütün strateji alətlərə limitsiz giriş',
                    'KAZAN AI ilə 24/7 əməliyyat dəstəyi',
                    'Eksklüziv investisiya imkanları',
                    'Ödənişsiz ilk strateji konsultasiya',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-4 text-sm font-bold text-white">
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-red">
                        <Check size={12} />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="w-full lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="rounded-[2.5rem] bg-white p-10 shadow-2xl"
              >
                <h4 className="mb-8 text-center text-2xl font-display font-black uppercase tracking-tight text-slate-900">
                  Müraciət et
                </h4>
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Adınız</label>
                      <input type="text" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 text-xs font-bold transition-colors focus:border-brand-red focus:outline-none" placeholder="Məs: Elvin" />
                    </div>
                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Soyadınız</label>
                      <input type="text" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 text-xs font-bold transition-colors focus:border-brand-red focus:outline-none" placeholder="Məs: Məmmədov" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">E-poçt</label>
                    <input type="email" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 text-xs font-bold transition-colors focus:border-brand-red focus:outline-none" placeholder="elvin@agency.az" />
                  </div>
                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Şirkət / Layihə adı</label>
                    <input type="text" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 text-xs font-bold transition-colors focus:border-brand-red focus:outline-none" placeholder="Məs: Grand Holding" />
                  </div>
                  <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-brand-red py-5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-brand-red/20 transition-all hover:bg-rose-600 active:scale-95">
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
