'use client';

import { useLocale } from 'next-intl';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { TELEGRAM_URL, WHATSAPP_NUMBER } from '@/lib/contact-channels';
import styles from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Icon, Reveal } from '@/components/home/v2/shared';

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
    whatsappPrefill:
      'Hello, I am writing from the DK Agency website. I would like advice for my business.',
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
    whatsappPrefill:
      'Merhaba, DK Agency sitesinden yazıyorum. İşletmem için danışmanlık istiyorum.',
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

  // TASK-0512 (owner 2026-10-08): v2 dark ink card like the /tanitim CTA — Inter headline,
  // one red primary action (WhatsApp), Telegram as the quiet second path.
  return (
    <section id="join" className={`${styles.v2} ${inter.className}`}>
      <div className={`${styles.sec} ${styles.jn}`}>
        <div className={styles.wrap}>
          <Reveal className={styles.jnCard}>
            <div className={styles.jnText}>
              <span className={`${styles.eyebrow} ${styles.jnEyebrow}`}>
                <span className={styles.dot} />
                {copy.joinBadge}
              </span>
              <h2 className={`${styles.h2} ${styles.jnH2}`}>
                {copy.joinTitle[0]} <span className={styles.jnAc}>{copy.joinTitle[1]}</span>
              </h2>
              <p className={styles.jnBody}>{copy.joinBody}</p>
              <ul className={styles.jnList}>
                {copy.bullets.map((item) => (
                  <li key={item}>
                    <span className={styles.jnCheck}>
                      <Icon name="check" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.jnBox}>
              <h3 className={styles.jnBoxTitle}>{copy.contactTitle}</h3>
              <p className={styles.jnBoxBody}>{copy.contactBody}</p>
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
                className={`${styles.jnBtn} ${styles.jnBtnRed}`}
              >
                <Icon name="chat" />
                <span className={styles.jnBtnText}>
                  <b>{copy.whatsapp}</b>
                  <span>{copy.whatsappHint}</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  track('telegram', { destinationPhone: TELEGRAM_URL });
                  openExternal(TELEGRAM_URL);
                }}
                className={`${styles.jnBtn} ${styles.jnBtnGhost}`}
              >
                <Icon name="send" />
                <span className={styles.jnBtnText}>
                  <b>{copy.telegram}</b>
                  <span>{copy.telegramHint}</span>
                </span>
              </button>
              <p className={styles.jnHours}>{copy.hours}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
