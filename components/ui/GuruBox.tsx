// components/ui/GuruBox.tsx
// DK Agency — TEK Guru/Insight Kutusu
// Gold + Navy premium dizayn — HƏR YERDƏ EYNI

import React from 'react';

type GuruBoxProps = {
  type: 'insight' | 'notu' | 'expert';  // Doğan İnsight, DK Agency Notu, Xarici ekspert
  name: string;
  title?: string;
  quote: string;
  source?: string;
  context?: string;
};

export default function GuruBox({ type, name, title, quote, source, context }: GuruBoxProps) {
  const getIcon = () => {
    switch (type) {
      case 'insight': return '💡';
      case 'notu': return '📋';
      case 'expert': return '🎓';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'insight': return 'DOĞAN İNSİGHT';
      case 'notu': return 'DK AGENCY NOTU';
      case 'expert': return name;
    }
  };

  const getInitials = () => {
    if (type === 'expert') {
      return name.split(' ').map(n => n[0]).join('').slice(0, 2);
    }
    return 'DT';
  };

  return (
    <div className="my-8 rounded-2xl overflow-hidden bg-[var(--dk-surface-dark)] border border-[color:color-mix(in_srgb,var(--dk-gold)_19%,transparent)]">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3 border-b border-[color:color-mix(in_srgb,var(--dk-gold)_8%,transparent)]">
        <div className="w-10 h-10 rounded-full bg-[color:color-mix(in_srgb,var(--dk-gold)_13%,transparent)] flex items-center justify-center flex-shrink-0">
          <span className="text-lg">{getIcon()}</span>
        </div>
        <div>
          <h4 className="text-[var(--dk-gold)] font-bold text-[14px] uppercase tracking-wide">
            {getLabel()}
          </h4>
          {title && (
            <p className="text-[var(--dk-muted)] text-[12px]">{title}</p>
          )}
        </div>
      </div>
      
      {/* Quote */}
      <div className="px-6 py-5">
        <div className="border-l-[3px] border-[var(--dk-gold)] pl-5">
          <p className="text-[16px] leading-[1.75] italic text-[var(--dk-text)]">
            {"\u201C"}{quote}{"\u201D"}
          </p>
        </div>
        
        {/* İmza */}
        <div className="flex items-center gap-2 mt-4">
          <div className="w-7 h-7 rounded-full bg-[var(--dk-gold)] flex items-center justify-center text-[var(--dk-night)] text-[11px] font-bold">
            {getInitials()}
          </div>
          <span className="text-[13px] text-[var(--dk-muted)]">
            — {type === 'expert' ? name : 'Doğan Tomris'}
          </span>
        </div>
      </div>
      
      {/* Source + Context (əgər varsa) */}
      {(source || context) && (
        <div className="px-6 pb-5 space-y-1.5">
          {source && (
            <p className="text-[12px] text-[var(--dk-muted)]">
              📖 <span className="font-medium">Mənbə:</span> {source}
            </p>
          )}
          {context && (
            <p className="text-[12px] text-[var(--dk-muted)]">
              <span className="text-[var(--dk-gold)]">🔗 Kontekst:</span> {context}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Kompakt versiya — yan-yana guru sitatları üçün
export function GuruBoxCompact({ 
  name, 
  title, 
  quote, 
  source 
}: Omit<GuruBoxProps, 'type' | 'context'>) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  
  return (
    <div className="p-5 rounded-xl bg-[var(--dk-surface-dark)] border border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] hover:border-[color:color-mix(in_srgb,var(--dk-gold)_19%,transparent)] transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-[color:color-mix(in_srgb,var(--dk-gold)_13%,transparent)] flex items-center justify-center">
          <span className="text-sm">🎓</span>
        </div>
        <div>
          <h5 className="text-[var(--dk-gold)] font-bold text-[12px] uppercase tracking-wide">{name}</h5>
          {title && <p className="text-[var(--dk-muted)] text-[11px]">{title}</p>}
        </div>
      </div>
      <p className="text-[var(--dk-text)] text-[14px] italic leading-relaxed">{"\u201C"}{quote}{"\u201D"}</p>
      {source && (
        <p className="text-[var(--dk-muted)] text-[11px] mt-3">📖 {source}</p>
      )}
    </div>
  );
}
