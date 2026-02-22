// components/news/PaywallOverlay.tsx
// DK Agency - Paywall Kilit Kutusu (Dark Theme)

'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function PaywallOverlay() {
  return (
    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[#0A0A1A] via-[#0A0A1A]/95 to-transparent p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#C5A02230] bg-[#16213E]/95 p-6 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#C5A02220] text-[#C5A022]">
          <Lock size={20} />
        </div>
        <h3 className="text-xl font-black text-[#EAEAEA]">Bu Məqalənin Tam Versiyası Üzvlərə Açıqdır</h3>
        <p className="mt-2 text-sm text-[#8892B0]">
          İlk hissəni oxudunuz. Tam analiz, ekspert rəyləri və alətlərə giriş üçün qeydiyyatdan keçin.
        </p>
        <div className="mt-4 space-y-2">
          <Link 
            href="/auth/register" 
            className="block w-full rounded-xl bg-[#E94560] hover:bg-[#C5A022] px-4 py-3 font-bold text-white transition-colors"
          >
            Pulsuz Qeydiyyat
          </Link>
          <Link 
            href="/auth/login" 
            className="text-sm text-[#8892B0] hover:text-[#C5A022] underline transition-colors"
          >
            Artıq üzvsünüz? Daxil olun
          </Link>
        </div>
      </div>
    </div>
  );
}
