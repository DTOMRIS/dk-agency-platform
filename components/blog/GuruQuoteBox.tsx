// components/blog/GuruQuoteBox.tsx
// DK Agency Blog — Guru Sitat Kutusu (Dark Theme)
// Gold + Navy premium dizayn

import React from 'react';

interface GuruQuoteBoxProps {
  name: string;
  title: string;
  quote: string;
  source: string;
  tqtaContext: string;
  image?: string;
  sourceLabel?: string;
  contextLabel?: string;
}

export default function GuruQuoteBox({
  name,
  title,
  quote,
  source,
  tqtaContext,
  sourceLabel = 'Mənbə:',
  contextLabel = 'Kontekst:',
}: GuruQuoteBoxProps) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="my-8 rounded-2xl overflow-hidden bg-white border border-[#E4DCCD]">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3 border-b border-[#EFE9DE]">
        <div className="w-10 h-10 rounded-full bg-[#FDECEF] flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🎓</span>
        </div>
        <div>
          <h4 className="text-[#BE2F47] font-bold text-[14px] uppercase tracking-wide">
            {name}
          </h4>
          {title && <p className="text-[#5B6474] text-[12px]">{title}</p>}
        </div>
      </div>

      {/* Quote */}
      <div className="px-6 py-5">
        <div className="border-l-[3px] border-[#D63B54] pl-5">
          <p className="text-[16px] leading-[1.75] italic text-[#0F172A]">
            {"\u201C"}{quote}{"\u201D"}
          </p>
        </div>

        {/* İmza */}
        <div className="flex items-center gap-2 mt-4">
          <div className="w-7 h-7 rounded-full bg-[#D63B54] flex items-center justify-center text-white text-[11px] font-bold">
            {initials}
          </div>
          <span className="text-[13px] text-[#5B6474]">— {name}</span>
        </div>
      </div>

      {/* Source + Context */}
      {(source || tqtaContext) && (
        <div className="px-6 pb-5 space-y-1.5">
          {source && (
            <p className="text-[12px] text-[#5B6474]">
              📖 <span className="font-medium">{sourceLabel}</span> {source}
            </p>
          )}
          {tqtaContext && (
            <p className="text-[12px] text-[#5B6474]">
              <span className="text-[#BE2F47]">🔗 {contextLabel}</span> {tqtaContext}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Kompakt versiya — yan-yana guru sitatları üçün
export function GuruQuoteBoxCompact({
  name,
  title,
  quote,
  source
}: Omit<GuruQuoteBoxProps, 'tqtaContext'>) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="p-5 rounded-xl bg-white border border-[#E4DCCD] hover:border-[#0F172A] transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-[#FDECEF] flex items-center justify-center">
          <span className="text-sm">🎓</span>
        </div>
        <div>
          <h5 className="text-[#BE2F47] font-bold text-[12px] uppercase tracking-wide">{name}</h5>
          <p className="text-[#5B6474] text-[11px]">{title}</p>
        </div>
      </div>
      <p className="text-[#0F172A] text-[14px] italic leading-relaxed">{"\u201C"}{quote}{"\u201D"}</p>
      <p className="text-[#5B6474] text-[11px] mt-3">📖 {source}</p>
    </div>
  );
}
