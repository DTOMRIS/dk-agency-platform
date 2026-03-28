// components/blog/DoganNote.tsx
// DK Agency Blog — Doğan Notu (Dark Theme)
// Gold + Navy premium dizayn

import React from 'react';

interface DoganNoteProps {
  children: React.ReactNode;
  variant?: 'default' | 'warning' | 'insight' | 'story';
}

export default function DoganNote({ children, variant = 'default' }: DoganNoteProps) {
  const variants = {
    default: {
      icon: '📋',
      label: 'DK AGENCY NOTU',
    },
    warning: {
      icon: '⚠️',
      label: 'XƏBƏRDARLIQ',
    },
    insight: {
      icon: '💡',
      label: 'DOĞAN İNSİGHT',
    },
    story: {
      icon: '🎯',
      label: 'DOĞAN HEKAYƏSİ',
    },
  };

  const v = variants[variant];

  return (
    <div className="my-8 rounded-2xl overflow-hidden bg-[var(--dk-surface-dark)] border border-[color:color-mix(in_srgb,var(--dk-gold)_19%,transparent)]">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3 border-b border-[color:color-mix(in_srgb,var(--dk-gold)_8%,transparent)]">
        <div className="w-10 h-10 rounded-full bg-[color:color-mix(in_srgb,var(--dk-gold)_13%,transparent)] flex items-center justify-center flex-shrink-0">
          <span className="text-lg">{v.icon}</span>
        </div>
        <h4 className="text-[var(--dk-gold)] font-bold text-[14px] uppercase tracking-wide">
          {v.label}
        </h4>
      </div>
      
      {/* Content */}
      <div className="px-6 py-5">
        <div className="border-l-[3px] border-[var(--dk-gold)] pl-5">
          <div className="text-[16px] leading-[1.75] text-[var(--dk-text)]">
            {children}
          </div>
        </div>
        
        {/* İmza */}
        <div className="flex items-center gap-2 mt-4">
          <div className="w-7 h-7 rounded-full bg-[var(--dk-gold)] flex items-center justify-center text-[var(--dk-night)] text-[11px] font-bold">
            DT
          </div>
          <span className="text-[13px] text-[var(--dk-muted)]">— Doğan Tomris</span>
        </div>
      </div>
    </div>
  );
}

// İnline versiyon — yazı içində qısa not üçün
export function DoganNoteInline({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[color:color-mix(in_srgb,var(--dk-gold)_8%,transparent)] border border-[color:color-mix(in_srgb,var(--dk-gold)_19%,transparent)] text-[var(--dk-text)] text-sm">
      <span className="font-bold text-[var(--dk-gold)]">DT:</span>
      {children}
    </span>
  );
}
