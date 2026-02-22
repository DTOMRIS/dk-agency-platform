// components/blog/MikroCTA.tsx
// DK Agency Blog — Mikro CTA'lar (Dark Theme)
// Gold + Navy premium dizayn

import React from 'react';
import Link from 'next/link';

interface MikroCTAProps {
  type: 'calculator' | 'consultation' | 'course' | 'checklist' | 'custom';
  href: string;
  text?: string;
}

const ctaTemplates = {
  calculator: {
    icon: '💡',
    defaultText: 'Bu hesablamanı DK Agency kalkulyatorunda 2 dəqiqəyə edə bilərsən',
    buttonText: 'Kalkulyatora keç',
  },
  consultation: {
    icon: '🎯',
    defaultText: 'Bu mövzuda pulsuz konsultasiya almaq istəyirsiniz?',
    buttonText: 'Konsultasiyaya yaz',
  },
  course: {
    icon: '🎓',
    defaultText: 'Bu bacarığı DK Agency kurslarında praktiki öyrən',
    buttonText: 'Kurslara bax',
  },
  checklist: {
    icon: '📋',
    defaultText: 'Tam checklist-i yüklə və heç nəyi unutma',
    buttonText: 'Yüklə',
  },
  custom: {
    icon: '→',
    defaultText: '',
    buttonText: 'Daha ətraflı',
  },
};

export default function MikroCTA({ type, href, text }: MikroCTAProps) {
  const template = ctaTemplates[type];
  const displayText = text || template.defaultText;

  return (
    <div className="my-8 rounded-2xl overflow-hidden bg-gradient-to-r from-[#C5A02215] to-[#E9456015] border border-[#C5A02225] p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#C5A02220] flex items-center justify-center">
            <span className="text-lg">{template.icon}</span>
          </div>
          <p className="text-[15px] text-[#EAEAEA]">
            {displayText}
          </p>
        </div>
        <Link 
          href={href}
          className="px-6 py-2.5 rounded-xl bg-[#C5A022] text-[#0A0A1A] font-bold text-[14px] hover:bg-[#D4AF37] transition-colors whitespace-nowrap"
        >
          {template.buttonText} →
        </Link>
      </div>
    </div>
  );
}

// Hekayə CTA — guru sitatından sonra
interface StoryCTAProps {
  guruName: string;
  guruContext: string;
  href: string;
  buttonText: string;
}

export function StoryCTA({ guruName, guruContext, href, buttonText }: StoryCTAProps) {
  return (
    <div className="my-6 p-5 rounded-xl bg-[#16213E60] border border-[#8892B015]">
      <p className="text-[#B0B8C8] text-sm mb-3">
        <span className="text-[#C5A022] font-semibold">{guruName}</span> bunu illər ərzində öyrənib.{' '}
        {guruContext}
      </p>
      <Link 
        href={href}
        className="inline-flex items-center gap-2 text-[#C5A022] hover:text-[#D4AF37] font-semibold text-sm transition-colors"
      >
        {buttonText}
        <span>→</span>
      </Link>
    </div>
  );
}

// Əsas CTA — yazı sonunda böyük blok
interface MainCTAProps {
  title: string;
  description: string;
  buttonText: string;
  href: string;
  secondaryButton?: {
    text: string;
    href: string;
  };
}

export function MainCTA({ title, description, buttonText, href, secondaryButton }: MainCTAProps) {
  return (
    <div className="my-12 p-8 rounded-2xl bg-[#16213E] border border-[#C5A02230]">
      <div className="text-center max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-full bg-[#C5A02220] flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔥</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-[#EAEAEA] mb-4">
          {title}
        </h3>
        <p className="text-[#8892B0] mb-6 leading-relaxed">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={href}
            className="px-8 py-3 bg-[#E94560] hover:bg-[#FF5A75] text-white font-bold rounded-xl transition-colors"
          >
            {buttonText}
          </Link>
          {secondaryButton && (
            <Link
              href={secondaryButton.href}
              className="px-8 py-3 bg-[#C5A022] hover:bg-[#D4AF37] text-[#0A0A1A] font-bold rounded-xl transition-colors"
            >
              {secondaryButton.text}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
