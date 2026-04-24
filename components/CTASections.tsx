'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, Check, Send, Sparkles } from 'lucide-react';

export function DoganNote() {
  return (
    <section className="bg-[#1A1A2E] py-20 text-white">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <div className="rounded-[2rem] border border-[#C5A022]/30 bg-white/5 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-10">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[#C5A022] bg-white/10 shadow-lg shadow-black/20 sm:h-28 sm:w-28">
            <Image
              src="/images/dogan-note-avatar.png"
              alt="Doğan Tomris üçün placeholder avatar"
              width={300}
              height={300}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C5A022]/35 bg-[#C5A022]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#C5A022]">
            <BookOpen size={14} />
            Founder Note
          </div>

          <h3 className="font-display text-3xl font-black text-white sm:text-4xl">Doğan Notu</h3>

          <p className="mt-6 text-lg leading-relaxed text-slate-200">
            &ldquo;Mən 10 ildən çox HoReCa sektorunda çalışmışam. Restoranların 70%-i düzgün maliyyə
            hesabatı aparmır. DK Agency-ni bu problemi həll etmək üçün qurdum - pulsuz alətlər,
            şəffaf bilik, texnologiya dəstəyi.&rdquo;
          </p>

          <span className="mt-6 block text-sm font-semibold tracking-wide text-[#C5A022]">
            - Doğan Tomris, Təsisçi
          </span>
        </div>
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
                  İndi qoşulun
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
