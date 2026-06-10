// components/blog/LegalDisclaimer.tsx
// Hüquqi bloglar üçün disclaimer footer
// category=Hüquqi olan blogların altında göstərilir

import React from 'react';

interface LegalDisclaimerProps {
  title?: string;
  text?: string;
}

export default function LegalDisclaimer({
  title = 'Hüquqi qeyd:',
  text = 'Bu yazı ümumi məlumat xarakteri daşıyır və hüquqi məsləhət deyil. Konkret addımlar üçün patent vəkili və ya hüquqşünasa müraciət edin.',
}: LegalDisclaimerProps) {
  return (
    <div className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex-shrink-0 text-lg">⚖️</span>
        <p className="text-sm leading-relaxed text-slate-600">
          <strong className="text-slate-700">{title}</strong> {text}
        </p>
      </div>
    </div>
  );
}
