'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Mail, MapPin, Clock, MessageCircle, Briefcase } from 'lucide-react';
import { normalizeLocale, withLocale, type Locale } from '@/i18n/config';

const WHATSAPP_NUMBER = '994502566279';
const CONTACT_EMAIL = 'info@dkagency.com.tr';

const contactCopy: Record<Locale, {
  back: string;
  title: string;
  lead: string;
  emailLabel: string;
  addressLabel: string;
  address: string;
  hoursLabel: string;
  hours: string;
  whatsappCta: string;
  b2bTitle: string;
  b2bText: string;
}> = {
  az: {
    back: 'Ana səhifə',
    title: 'Bizimlə əlaqə',
    lead: 'Sual, təklif və ya əməkdaşlıq fikri varsa — yazın.',
    emailLabel: 'E-poçt',
    addressLabel: 'Ünvan',
    address: 'Bakı, Azərbaycan',
    hoursLabel: 'İş saatları',
    hours: 'Bazar ertəsi – Cümə, 09:00 – 18:00 (UTC+4)',
    whatsappCta: 'WhatsApp ilə yazın',
    b2bTitle: 'B2B əməkdaşlıq',
    b2bText: 'Restoran zəncirləri, franchise markaları və tədarükçülər üçün ayrı kanal var. WhatsApp-dan "B2B" yazın.',
  },
  ru: {
    back: 'Главная',
    title: 'Связаться с нами',
    lead: 'Вопрос, предложение или идея сотрудничества — пишите.',
    emailLabel: 'E-mail',
    addressLabel: 'Адрес',
    address: 'Баку, Азербайджан',
    hoursLabel: 'Рабочие часы',
    hours: 'Понедельник – Пятница, 09:00 – 18:00 (UTC+4)',
    whatsappCta: 'Написать в WhatsApp',
    b2bTitle: 'B2B-партнёрство',
    b2bText: 'Для ресторанных сетей, франшиз и поставщиков — отдельный канал. Напишите "B2B" в WhatsApp.',
  },
  en: {
    back: 'Home',
    title: 'Get in touch',
    lead: 'Questions, proposals, or partnership ideas — write to us.',
    emailLabel: 'Email',
    addressLabel: 'Address',
    address: 'Baku, Azerbaijan',
    hoursLabel: 'Hours',
    hours: 'Monday – Friday, 09:00 – 18:00 (UTC+4)',
    whatsappCta: 'Message us on WhatsApp',
    b2bTitle: 'B2B partnerships',
    b2bText: 'For restaurant chains, franchise brands, and suppliers — we have a dedicated channel. Send "B2B" via WhatsApp.',
  },
  tr: {
    back: 'Ana sayfa',
    title: 'Bize ulaşın',
    lead: 'Soru, öneri veya işbirliği fikriniz varsa — yazın.',
    emailLabel: 'E-posta',
    addressLabel: 'Adres',
    address: 'Bakü, Azerbaycan',
    hoursLabel: 'Çalışma saatleri',
    hours: 'Pazartesi – Cuma, 09:00 – 18:00 (UTC+4)',
    whatsappCta: "WhatsApp'tan yazın",
    b2bTitle: 'B2B ortaklık',
    b2bText: 'Restoran zincirleri, franchise markaları ve tedarikçiler için ayrı kanal var. WhatsApp\'tan "B2B" yazın.',
  },
};

export default function ElaqePage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = contactCopy[locale];

  return (
    <div className="bg-[var(--dk-paper)]">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href={withLocale(locale, '/')}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--dk-muted)] transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={14} />
          {copy.back}
        </Link>

        <h1 className="mb-4 font-display text-4xl font-bold text-[var(--dk-navy)]">{copy.title}</h1>
        <p className="mb-10 text-lg text-slate-600">{copy.lead}</p>

        <div className="mb-8 space-y-4">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 transition-colors hover:border-emerald-300"
          >
            <MessageCircle size={24} className="flex-shrink-0 text-emerald-600" />
            <div>
              <p className="font-semibold text-slate-900">{copy.whatsappCta}</p>
              <p className="text-sm text-slate-500">+994 50 256 62 79</p>
            </div>
          </a>

          <div className="flex items-center gap-4 rounded-2xl border border-[var(--dk-border-soft)] bg-white p-4">
            <Mail size={24} className="flex-shrink-0 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-500">{copy.emailLabel}</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-slate-900 hover:text-brand-red">
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[var(--dk-border-soft)] bg-white p-4">
            <MapPin size={24} className="flex-shrink-0 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-500">{copy.addressLabel}</p>
              <p className="font-semibold text-slate-900">{copy.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[var(--dk-border-soft)] bg-white p-4">
            <Clock size={24} className="flex-shrink-0 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-500">{copy.hoursLabel}</p>
              <p className="font-semibold text-slate-900">{copy.hours}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="mb-2 flex items-center gap-2">
            <Briefcase size={20} className="text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">{copy.b2bTitle}</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">{copy.b2bText}</p>
        </div>
      </div>
    </div>
  );
}
