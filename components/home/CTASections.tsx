'use client';

import { motion } from 'framer-motion';
import { Check, Quote, Sparkles, Send } from 'lucide-react';

export function DoganNote() {
  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-red/5 -skew-x-12 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-full bg-blue-500/5 skew-x-12 -translate-x-1/4"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:w-1/3"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-brand-red to-rose-500 rounded-[3rem] blur-2xl opacity-20"></div>
              <img
                src="https://picsum.photos/seed/founder/600/800"
                alt="Doğan"
                className="relative rounded-[2.5rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand-red rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-brand-red/20 rotate-12">
                <Quote size={40} fill="currentColor" />
              </div>
            </div>
          </motion.div>

          <div className="lg:w-2/3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-red text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
                TƏSİSÇİDƏN QEYD
              </div>
              <h3 className="text-4xl lg:text-5xl font-display font-extrabold text-white mb-10 leading-tight">
                {"\u201C"}Restoran biznesi yalnız dadlı yemək deyil, həm də <span className="text-brand-red">dəqiq riyaziyyatdır.</span> Biz sizə bu riyaziyyatı asanlaşdırırıq.{"\u201D"}
              </h3>
              <div className="space-y-6 mb-12">
                <p className="text-xl text-slate-400 leading-relaxed font-medium">
                  15 ildən artıq sektor təcrübəmi bu platformada topladım. Məqsədimiz Azərbaycanda HoReCa sektorunun standartlarını dünya səviyyəsinə çatdırmaqdır.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-1px bg-brand-red"></div>
                  <span className="text-white font-display font-bold text-xl tracking-wide">Doğan, DK AGENCY Təsisçisi</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                {[
                  { label: 'Təcrübə', value: '15+ İl' },
                  { label: 'Layihə', value: '100+' },
                  { label: 'Tərəfdaş', value: '50+' }
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-display font-extrabold text-white mb-1">{stat.value}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function JoinCTA() {
  return (
    <section id="join" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-24 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
          {/* Background Mesh */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--dk-red)_0%,transparent_50%)] blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-red text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
                  <Sparkles size={12} fill="currentColor" />
                  İNDİ QOŞULUN
                </div>
                <h3 className="text-5xl lg:text-6xl font-display font-extrabold text-white mb-8 leading-tight">
                  Biznesinizi <br />
                  <span className="text-brand-red">növbəti səviyyəyə</span> daşıyın
                </h3>
                <p className="text-xl text-slate-400 mb-12 leading-relaxed font-medium">
                  Yüzlərlə uğurlu restoran sahibi kimi siz də DK AGENCY ailəsinə qoşulun və rəqəmsal üstünlük qazanın.
                </p>
                
                <div className="space-y-6">
                  {[
                    'Bütün toolkitlərə limitsiz giriş',
                    'KAZAN AI ilə 24/7 dəstək',
                    'Eksklüziv sektor xəbərləri',
                    'Ödənişsiz ilk konsultasiya'
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-4 text-white font-bold">
                      <div className="w-6 h-6 bg-brand-red rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={14} />
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
                <h4 className="text-2xl font-display font-bold text-slate-900 mb-8 text-center">Qeydiyyatdan keçin</h4>
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Adınız</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-red transition-colors" placeholder="Məs: Elvin" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Soyadınız</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-red transition-colors" placeholder="Məs: Məmmədov" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-poçt</label>
                    <input type="email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-red transition-colors" placeholder="elvin@misal.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Restoran Adı</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-red transition-colors" placeholder="Məs: Grand Cafe" />
                  </div>
                  <button className="w-full bg-brand-red text-white py-5 rounded-2xl font-bold text-lg hover:bg-rose-600 transition-all shadow-xl shadow-brand-red/20 flex items-center justify-center gap-3 active:scale-95">
                    Üzv ol <Send size={20} />
                  </button>
                  <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
                    Qeydiyyatdan keçməklə şərtlərimizi qəbul edirsiniz
                  </p>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
