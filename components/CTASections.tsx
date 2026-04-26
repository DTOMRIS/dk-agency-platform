'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { BookOpen, Check, Send, Sparkles } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';

const copyByLocale: Record<Locale, {
  founderBadge: string;
  founderTitle: string;
  founderBody: string;
  founderSignature: string;
  joinBadge: string;
  joinTitle: [string, string];
  joinBody: string;
  bullets: string[];
  formTitle: string;
  fields: { firstName: string; lastName: string; email: string; company: string };
  placeholders: { firstName: string; lastName: string; email: string; company: string };
  submit: string;
}> = {
  az: {
    founderBadge: 'Founder Note',
    founderTitle: 'Doğan Notu',
    founderBody: '“Mən 10 ildən çox HoReCa sektorunda çalışmışam. Restoranların 70%-i düzgün maliyyə hesabatı aparmır. DK Agency-ni bu problemi həll etmək üçün qurdum — pulsuz alətlər, şəffaf bilik, texnologiya dəstəyi.”',
    founderSignature: '— Doğan Tomris, Təsisçi',
    joinBadge: 'İndi qoşulun',
    joinTitle: ['Agentlik əməliyyatlarınızı', 'növbəti səviyyəyə'],
    joinBody: 'Strateji alətlər, KAZAN AI dəstəyi və sistemli idarəetmə ilə daha güclü nəticə alın.',
    bullets: ['Bütün strateji alətlərə limitsiz giriş', 'KAZAN AI ilə 24/7 əməliyyat dəstəyi', 'Eksklüziv investisiya imkanları', 'Ödənişsiz ilk strateji konsultasiya'],
    formTitle: 'Müraciət et',
    fields: { firstName: 'Adınız', lastName: 'Soyadınız', email: 'E-poçt', company: 'Şirkət / Layihə adı' },
    placeholders: { firstName: 'Məs: Elvin', lastName: 'Məs: Məmmədov', email: 'elvin@agency.az', company: 'Məs: Grand Holding' },
    submit: 'Göndər',
  },
  ru: {
    founderBadge: 'Founder Note',
    founderTitle: 'Заметка Doğan',
    founderBody: '«Я более 10 лет работаю в HoReCa. Около 70% ресторанов не ведут корректную финансовую отчётность. Я создал DK Agency, чтобы решить эту проблему — через бесплатные инструменты, прозрачные знания и технологическую поддержку.»',
    founderSignature: '— Doğan Tomris, основатель',
    joinBadge: 'Присоединиться сейчас',
    joinTitle: ['Выведите операции агентства', 'на следующий уровень'],
    joinBody: 'Получайте более сильный результат с помощью стратегических инструментов, поддержки KAZAN AI и системного управления.',
    bullets: ['Безлимитный доступ ко всем стратегическим инструментам', 'Операционная поддержка 24/7 через KAZAN AI', 'Эксклюзивные инвестиционные возможности', 'Первая стратегическая консультация без оплаты'],
    formTitle: 'Оставить заявку',
    fields: { firstName: 'Имя', lastName: 'Фамилия', email: 'E-mail', company: 'Компания / проект' },
    placeholders: { firstName: 'Напр.: Эльвин', lastName: 'Напр.: Мамедов', email: 'elvin@agency.az', company: 'Напр.: Grand Holding' },
    submit: 'Отправить',
  },
  en: {
    founderBadge: 'Founder Note',
    founderTitle: 'A Note from Doğan',
    founderBody: '“I have worked in HoReCa for more than 10 years. Around 70% of restaurants still do not keep proper financial reporting. I built DK Agency to solve that problem with free tools, transparent knowledge, and technology support.”',
    founderSignature: '— Doğan Tomris, Founder',
    joinBadge: 'Join now',
    joinTitle: ['Move your agency operations', 'to the next level'],
    joinBody: 'Get stronger outcomes with strategic tools, KAZAN AI support, and disciplined operations.',
    bullets: ['Unlimited access to all strategic tools', '24/7 operational support with KAZAN AI', 'Exclusive investment opportunities', 'First strategic consultation at no cost'],
    formTitle: 'Apply now',
    fields: { firstName: 'First name', lastName: 'Last name', email: 'Email', company: 'Company / project' },
    placeholders: { firstName: 'Ex: Elvin', lastName: 'Ex: Mammadov', email: 'elvin@agency.az', company: 'Ex: Grand Holding' },
    submit: 'Send',
  },
  tr: {
    founderBadge: 'Founder Note',
    founderTitle: 'Doğan Notu',
    founderBody: '“10 yıldan fazla süredir HoReCa sektöründe çalışıyorum. Restoranların yaklaşık %70’i doğru finansal raporlama yapmıyor. DK Agency’yi bu problemi ücretsiz araçlar, şeffaf bilgi ve teknoloji desteği ile çözmek için kurdum.”',
    founderSignature: '— Doğan Tomris, Kurucu',
    joinBadge: 'Şimdi katılın',
    joinTitle: ['Ajans operasyonlarınızı', 'bir üst seviyeye'],
    joinBody: 'Stratejik araçlar, KAZAN AI desteği ve sistemli yönetim ile daha güçlü sonuç alın.',
    bullets: ['Tüm strateji araçlarına sınırsız erişim', 'KAZAN AI ile 7/24 operasyon desteği', 'Özel yatırım fırsatları', 'İlk strateji danışmanlığı ücretsiz'],
    formTitle: 'Başvur',
    fields: { firstName: 'Adınız', lastName: 'Soyadınız', email: 'E-posta', company: 'Şirket / proje adı' },
    placeholders: { firstName: 'Örn: Elvin', lastName: 'Örn: Memmedov', email: 'elvin@agency.az', company: 'Örn: Grand Holding' },
    submit: 'Gönder',
  },
};

export function DoganNote() {
  const locale = normalizeLocale(useLocale());
  const copy = copyByLocale[locale];

  return (
    <section className="bg-[#1A1A2E] py-20 text-white">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <div className="rounded-[2rem] border border-[#C5A022]/30 bg-white/5 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-10">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[#C5A022] bg-white/10 shadow-lg shadow-black/20 sm:h-28 sm:w-28">
            <Image
              src="/images/dogan-note-avatar.png"
              alt="Doğan Tomris placeholder avatar"
              width={300}
              height={300}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C5A022]/35 bg-[#C5A022]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#C5A022]">
            <BookOpen size={14} />
            {copy.founderBadge}
          </div>

          <h3 className="font-display text-3xl font-black text-white sm:text-4xl">{copy.founderTitle}</h3>

          <p className="mt-6 text-lg leading-relaxed text-slate-200">{copy.founderBody}</p>

          <span className="mt-6 block text-sm font-semibold tracking-wide text-[#C5A022]">
            {copy.founderSignature}
          </span>
        </div>
      </div>
    </section>
  );
}

export function JoinCTA() {
  const locale = normalizeLocale(useLocale());
  const copy = copyByLocale[locale];

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
                  {copy.joinBadge}
                </div>
                <h3 className="mb-8 text-5xl font-display font-black leading-tight tracking-tighter text-white lg:text-6xl">
                  {copy.joinTitle[0]}
                  <br />
                  <span className="px-2 italic text-brand-red">{copy.joinTitle[1]}</span>
                </h3>
                <p className="mb-12 text-lg font-medium leading-relaxed text-slate-400">{copy.joinBody}</p>

                <div className="space-y-6">
                  {copy.bullets.map((item) => (
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
                  {copy.formTitle}
                </h4>
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{copy.fields.firstName}</label>
                      <input type="text" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 text-xs font-bold transition-colors focus:border-brand-red focus:outline-none" placeholder={copy.placeholders.firstName} />
                    </div>
                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{copy.fields.lastName}</label>
                      <input type="text" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 text-xs font-bold transition-colors focus:border-brand-red focus:outline-none" placeholder={copy.placeholders.lastName} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{copy.fields.email}</label>
                    <input type="email" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 text-xs font-bold transition-colors focus:border-brand-red focus:outline-none" placeholder={copy.placeholders.email} />
                  </div>
                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{copy.fields.company}</label>
                    <input type="text" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 text-xs font-bold transition-colors focus:border-brand-red focus:outline-none" placeholder={copy.placeholders.company} />
                  </div>
                  <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-brand-red py-5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-brand-red/20 transition-all hover:bg-rose-600 active:scale-95">
                    {copy.submit} <Send size={16} />
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
