'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Check, MessageCircle, Send, Sparkles } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { TELEGRAM_URL, WHATSAPP_NUMBER } from '@/lib/contact-channels';

type ContactChannel = 'whatsapp' | 'telegram';

function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

const copyByLocale: Record<
  Locale,
  {
    joinBadge: string;
    joinTitle: [string, string];
    joinBody: string;
    bullets: string[];
    contactTitle: string;
    contactBody: string;
    whatsapp: string;
    whatsappHint: string;
    whatsappPrefill: string;
    telegram: string;
    telegramHint: string;
    hours: string;
  }
> = {
  az: {
    joinBadge: 'İndi qoşulun',
    joinTitle: ['Biznesinizi', 'növbəti səviyyəyə daşıyın'],
    joinBody:
      'Strateji alətlər, KAZAN AI dəstəyi və sistemli idarəetmə ilə daha güclü nəticə alın.',
    bullets: [
      'Bütün strateji alətlərə limitsiz giriş',
      'KAZAN AI ilə 24/7 əməliyyat dəstəyi',
      'Eksklüziv investisiya imkanları',
      'Ödənişsiz ilk strateji konsultasiya',
    ],
    contactTitle: 'Bizə yazın',
    contactBody: 'Form doldurmağa ehtiyac yoxdur. Sualınızı yazın, iş vaxtı ərzində cavab veririk.',
    whatsapp: 'WhatsApp-a yazın',
    whatsappHint: 'Ən sürətli yol',
    whatsappPrefill: 'Salam, DK Agency saytından yazıram. Biznesim üçün məsləhət istəyirəm.',
    telegram: 'Telegram-a yazın',
    telegramHint: 't.me/dkagency',
    hours: 'B.e.–Cümə · 09:00–18:00 (Bakı)',
  },
  ru: {
    joinBadge: 'Присоединиться сейчас',
    joinTitle: ['Выведите бизнес', 'на следующий уровень'],
    joinBody:
      'Получайте более сильный результат с помощью стратегических инструментов, поддержки KAZAN AI и системного управления.',
    bullets: [
      'Безлимитный доступ ко всем стратегическим инструментам',
      'Операционная поддержка 24/7 через KAZAN AI',
      'Эксклюзивные инвестиционные возможности',
      'Первая стратегическая консультация без оплаты',
    ],
    contactTitle: 'Напишите нам',
    contactBody: 'Заполнять форму не нужно. Напишите вопрос — ответим в рабочее время.',
    whatsapp: 'Написать в WhatsApp',
    whatsappHint: 'Самый быстрый способ',
    whatsappPrefill: 'Здравствуйте, пишу с сайта DK Agency. Нужна консультация для моего бизнеса.',
    telegram: 'Написать в Telegram',
    telegramHint: 't.me/dkagency',
    hours: 'Пн–Пт · 09:00–18:00 (Баку)',
  },
  en: {
    joinBadge: 'Join now',
    joinTitle: ['Take your business', 'to the next level'],
    joinBody:
      'Get stronger outcomes with strategic tools, KAZAN AI support, and disciplined operations.',
    bullets: [
      'Unlimited access to all strategic tools',
      '24/7 operational support with KAZAN AI',
      'Exclusive investment opportunities',
      'First strategic consultation at no cost',
    ],
    contactTitle: 'Message us',
    contactBody: 'No form to fill in. Send your question and we reply during working hours.',
    whatsapp: 'Message on WhatsApp',
    whatsappHint: 'Fastest way',
    whatsappPrefill: 'Hello, I am writing from the DK Agency website. I would like advice for my business.',
    telegram: 'Message on Telegram',
    telegramHint: 't.me/dkagency',
    hours: 'Mon–Fri · 09:00–18:00 (Baku)',
  },
  tr: {
    joinBadge: 'Şimdi katılın',
    joinTitle: ['İşinizi', 'bir üst seviyeye taşıyın'],
    joinBody: 'Stratejik araçlar, KAZAN AI desteği ve sistemli yönetim ile daha güçlü sonuç alın.',
    bullets: [
      'Tüm strateji araçlarına sınırsız erişim',
      'KAZAN AI ile 7/24 operasyon desteği',
      'Özel yatırım fırsatları',
      'İlk strateji danışmanlığı ücretsiz',
    ],
    contactTitle: 'Bize yazın',
    contactBody: 'Form doldurmanıza gerek yok. Sorunuzu yazın, mesai saatlerinde yanıtlıyoruz.',
    whatsapp: "WhatsApp'tan yazın",
    whatsappHint: 'En hızlı yol',
    whatsappPrefill: 'Merhaba, DK Agency sitesinden yazıyorum. İşletmem için danışmanlık istiyorum.',
    telegram: "Telegram'dan yazın",
    telegramHint: 't.me/dkagency',
    hours: 'Pzt–Cuma · 09:00–18:00 (Bakü)',
  },
};

export function JoinCTA() {
  const locale = normalizeLocale(useLocale());
  const copy = copyByLocale[locale];

  // Same click tracking as the contact page (ContactFunnel): one row per
  // click in `leads`, plus the admin e-mail. Tracking never blocks the action.
  const track = (
    channel: ContactChannel,
    extra?: { prefillText?: string; destinationPhone?: string }
  ) => {
    fetch('/api/leads/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'home_join',
        channel,
        locale,
        sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        prefillText: extra?.prefillText,
        destinationPhone: extra?.destinationPhone,
      }),
      keepalive: true,
    }).catch(() => undefined);
  };

  return (
    <section id="join" className="relative overflow-hidden bg-slate-50 py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-12 shadow-2xl lg:p-24">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_50%_50%,var(--dk-red)_0%,transparent_50%)] blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-20 lg:flex-row">
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-red">
                  <Sparkles size={12} fill="currentColor" />
                  {copy.joinBadge}
                </div>
                <h3 className="mb-8 text-5xl font-display font-black leading-tight tracking-tighter text-white lg:text-6xl">
                  {copy.joinTitle[0]}
                  <br />
                  <span className="px-2 italic text-brand-red">{copy.joinTitle[1]}</span>
                </h3>
                <p className="mb-12 text-lg font-medium leading-relaxed text-slate-400">
                  {copy.joinBody}
                </p>

                <div className="space-y-6">
                  {copy.bullets.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-4 text-sm font-bold text-white"
                    >
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
                <h4 className="mb-3 text-center text-2xl font-display font-black uppercase tracking-tight text-slate-900">
                  {copy.contactTitle}
                </h4>
                <p className="mb-8 text-center text-sm leading-6 text-slate-600">
                  {copy.contactBody}
                </p>
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => {
                      track('whatsapp', {
                        prefillText: copy.whatsappPrefill,
                        destinationPhone: WHATSAPP_NUMBER,
                      });
                      openExternal(
                        `/api/leads/whatsapp?text=${encodeURIComponent(copy.whatsappPrefill)}`
                      );
                    }}
                    className="flex w-full items-center gap-4 rounded-xl bg-brand-red px-5 py-4 text-left text-white shadow-xl shadow-brand-red/20 transition-all hover:bg-rose-600 active:scale-95"
                  >
                    <MessageCircle size={22} aria-hidden="true" />
                    <span className="flex flex-col">
                      <span className="text-sm font-black uppercase tracking-widest">
                        {copy.whatsapp}
                      </span>
                      <span className="text-xs font-semibold text-white/90">
                        {copy.whatsappHint}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      track('telegram', { destinationPhone: TELEGRAM_URL });
                      openExternal(TELEGRAM_URL);
                    }}
                    className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 text-left text-slate-900 transition-all hover:border-sky-300 hover:bg-sky-50 active:scale-95"
                  >
                    <Send size={22} className="text-sky-600" aria-hidden="true" />
                    <span className="flex flex-col">
                      <span className="text-sm font-black uppercase tracking-widest">
                        {copy.telegram}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">{copy.telegramHint}</span>
                    </span>
                  </button>
                  <p className="pt-2 text-center text-xs font-semibold text-slate-600">{copy.hours}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
