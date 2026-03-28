// components/news/PaywallOverlay.tsx
// DK Agency - Paywall Kilit Kutusu (Dark Theme)

'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function PaywallOverlay() {
  return (
    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[var(--dk-night)] via-[var(--dk-night)]/95 to-transparent p-4">
      <div className="w-full max-w-md rounded-2xl border border-[color:color-mix(in_srgb,var(--dk-gold)_19%,transparent)] bg-[var(--dk-surface-dark)]/95 p-6 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--dk-gold)_13%,transparent)] text-[var(--dk-gold)]">
          <Lock size={20} />
        </div>
        <h3 className="text-xl font-black text-[var(--dk-text)]">Bu Məqalənin Tam Versiyası Üzvlərə Açıqdır</h3>
        <p className="mt-2 text-sm text-[var(--dk-muted)]">
          İlk hissəni oxudunuz. Tam analiz, ekspert rəyləri və alətlərə giriş üçün qeydiyyatdan keçin.
        </p>
        <div className="mt-4 space-y-2">
          <Link 
            href="/auth/register" 
            className="block w-full rounded-xl bg-[var(--dk-red)] hover:bg-[var(--dk-gold)] px-4 py-3 font-bold text-white transition-colors"
          >
            Pulsuz Qeydiyyat
          </Link>
          <Link 
            href="/auth/login" 
            className="text-sm text-[var(--dk-muted)] hover:text-[var(--dk-gold)] underline transition-colors"
          >
            Artıq üzvsünüz? Daxil olun
          </Link>
        </div>
      </div>
    </div>
  );
}
