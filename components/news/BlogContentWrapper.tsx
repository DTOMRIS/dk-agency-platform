// components/news/BlogContentWrapper.tsx
// Blog içerik sarmalayıcı - %40 Paywall sistemi ile  
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Mail, Star, CheckCircle, Zap } from 'lucide-react';
import ReadingProgress from './ReadingProgress';

interface BlogContentWrapperProps {
  children: React.ReactNode;
  articleTitle: string;
}

export default function BlogContentWrapper({ children, articleTitle }: BlogContentWrapperProps) {
  const [showPaywall, setShowPaywall] = useState(false);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on mount
  useEffect(() => {
    const checkLogin = () => {
      try {
        const userStr = localStorage.getItem('dk_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.loggedIn) {
            setIsLoggedIn(true);
            setShowPaywall(false);
            setIsScrollLocked(false);
          }
        }
      } catch (e) {
        console.error('Login check error:', e);
      }
    };
    checkLogin();
    
    // Also listen for storage changes (login from another tab)
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, []);

  useEffect(() => {
    // Don't trigger paywall if logged in
    if (isLoggedIn) return;
    
    const handlePaywallTrigger = () => {
      setShowPaywall(true);
      setIsScrollLocked(true);
    };

    window.addEventListener('paywallTrigger', handlePaywallTrigger);
    
    return () => {
      window.removeEventListener('paywallTrigger', handlePaywallTrigger);
    };
  }, [isLoggedIn]);

  // Lock scroll when paywall is shown
  useEffect(() => {
    if (isScrollLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isScrollLocked]);

  return (
    <>
      {/* Reading Progress with paywall trigger */}
      <ReadingProgress 
        showPercentage={true} 
        paywallThreshold={isLoggedIn ? undefined : 40}
        onPaywallTrigger={isLoggedIn ? undefined : () => {
          setShowPaywall(true);
          setIsScrollLocked(true);
        }}
      />

      {/* Main content */}
      <div className={`relative ${showPaywall && !isLoggedIn ? 'max-h-screen overflow-hidden' : ''}`}>
        {children}

        {/* Paywall Overlay - AÇIK TEMA */}
        {showPaywall && !isLoggedIn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with gradient fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/98 to-white/80" />
            
            {/* Paywall Card */}
            <div className="relative z-10 w-full max-w-lg mx-4">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-3">
                    <Lock className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Bu Yazının Tamamı Üyelere Açıktır
                  </h3>
                  <p className="text-amber-100 text-sm mt-1">
                    %40 oxudunuz. Davamı üçün üzv olun.
                  </p>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                  {/* Reading progress indicator */}
                  <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-xl">
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          className="text-slate-200"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          cx="18"
                          cy="18"
                          r="15.9"
                        />
                        <circle
                          className="text-amber-500"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          fill="none"
                          strokeDasharray="40, 100"
                          cx="18"
                          cy="18"
                          r="15.9"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                        40%
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">{articleTitle}</p>
                      <p className="text-xs text-slate-500">Oxumağa davam etmək üçün üzv olun</p>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">Tam Məqalə Girişi</p>
                        <p className="text-xs text-slate-500">Bütün expert bloq yazıları və analizlər</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">HoReCa Toolkit</p>
                        <p className="text-xs text-slate-500">ROI hesablayıcılar, şablonlar, checklistlər</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">Həftəlik Newsletter</p>
                        <p className="text-xs text-slate-500">Sektör trendləri birbaşa e-poçtunuza</p>
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <Link 
                      href="/auth/register" 
                      className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/25"
                    >
                      <Zap className="w-5 h-5" />
                      Pulsuz Üzv Ol
                    </Link>
                    <Link 
                      href="/auth/login" 
                      className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-medium transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Artıq Üzvəm - Daxil Ol
                    </Link>
                  </div>
                </div>

                {/* Footer trust badges */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    2,500+ üzv
                  </span>
                  <span>•</span>
                  <span>Pulsuz qeydiyyat</span>
                  <span>•</span>
                  <span>Spam yoxdur</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
