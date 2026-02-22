// components/ui/CookiesBanner.tsx
// DK Agency — Premium Cookies Banner (Sunday.de style)

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function CookiesBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('dk-cookies-accepted');
    if (!cookiesAccepted) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('dk-cookies-accepted', 'true');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('dk-cookies-accepted', 'false');
    setShow(false);
  };

  const handleCustomize = () => {
    localStorage.setItem('dk-cookies-accepted', 'custom');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        {/* Üst kısım - Cookie resimli sarı dalga */}
        <div className="relative h-32 overflow-visible">
          {/* Sarı dalga arka plan */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F5E6A3] via-[#E8C840] to-[#D4AF37]">
            {/* Dalga SVG */}
            <svg 
              className="absolute bottom-0 left-0 w-full" 
              viewBox="0 0 400 50" 
              preserveAspectRatio="none"
              style={{ height: '50px' }}
            >
              <path 
                d="M0,25 Q100,50 200,25 T400,25 L400,50 L0,50 Z" 
                fill="white"
              />
            </svg>
          </div>
          
          {/* Cookie resmi - taşıyor */}
          <div className="absolute -bottom-8 right-4 z-10">
            <div className="relative w-32 h-32 drop-shadow-2xl">
              <Image 
                src="/cookies.png" 
                alt="Cookie" 
                fill
                className="object-contain transform rotate-12 hover:rotate-6 transition-transform duration-300"
                style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }}
              />
            </div>
          </div>
          
          {/* Küçük cookie parçacıkları */}
          <div className="absolute top-4 left-8 w-3 h-3 bg-[#8B4513] rounded-full opacity-60" />
          <div className="absolute top-8 left-16 w-2 h-2 bg-[#8B4513] rounded-full opacity-40" />
          <div className="absolute bottom-12 left-12 w-2 h-2 bg-[#8B4513] rounded-full opacity-50" />
        </div>

        {/* İçerik */}
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-[#1a1a1a] font-bold text-xl leading-tight mb-2">
            Kim dedi cookies sağlam deyil?
          </h3>
          <p className="text-[#666] text-[14px] leading-relaxed mb-3">
            DK Agency-də təcrübənizi yaxşılaşdırmaq üçün cookies istifadə edirik.
          </p>
          <Link 
            href="/privacy" 
            className="inline-flex items-center gap-1 text-[#1a1a1a] text-[13px] font-semibold hover:text-[#E94560] transition-colors"
          >
            Məxfilik siyasətimizi buradan oxuyun
            <span className="text-[10px]">→</span>
          </Link>
        </div>

        {/* Güven rozeti */}
        <div className="px-6 py-3 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            GDPR uyğunluğu təmin edilir
          </p>
        </div>

        {/* Butonlar */}
        <div className="grid grid-cols-3 border-t border-gray-100">
          <button 
            onClick={handleDecline}
            className="py-4 text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all border-r border-gray-100"
          >
            xeyr
          </button>
          <button 
            onClick={handleCustomize}
            className="py-4 text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all border-r border-gray-100"
          >
            seçim edim
          </button>
          <button 
            onClick={handleAccept}
            className="py-4 text-[13px] font-bold text-white bg-[#E94560] hover:bg-[#d63d56] transition-all"
          >
            qəbul et
          </button>
        </div>
      </div>
    </div>
  );
}
