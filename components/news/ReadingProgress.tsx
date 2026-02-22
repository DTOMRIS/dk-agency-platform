// components/news/ReadingProgress.tsx
// Scroll-based reading progress indicator with paywall trigger
'use client';

import { useEffect, useState, useCallback } from 'react';

interface ReadingProgressProps {
  showPercentage?: boolean;
  color?: string;
  height?: number;
  paywallThreshold?: number;
  onPaywallTrigger?: () => void;
}

export default function ReadingProgress({ 
  showPercentage = true, 
  color = 'bg-amber-600',
  height = 4,
  paywallThreshold = 40,
  onPaywallTrigger
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [paywallTriggered, setPaywallTriggered] = useState(false);

  const triggerPaywall = useCallback(() => {
    if (!paywallTriggered) {
      setPaywallTriggered(true);
      onPaywallTrigger?.();
      // Dispatch custom event for paywall
      window.dispatchEvent(new CustomEvent('paywallTrigger', { detail: { progress } }));
    }
  }, [paywallTriggered, onPaywallTrigger, progress]);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      const newProgress = Math.min(scrollProgress, 100);
      setProgress(newProgress);

      // Trigger paywall at threshold
      if (newProgress >= paywallThreshold && !paywallTriggered) {
        triggerPaywall();
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, [paywallThreshold, paywallTriggered, triggerPaywall]);

  return (
    <>
      {/* Fixed progress bar at top - DARK THEME */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full bg-[#16213E]" style={{ height: `${height}px` }}>
          <div 
            className="bg-[#C5A022] h-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Floating percentage indicator - DARK THEME */}
      {showPercentage && progress > 5 && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#16213E]/95 backdrop-blur-sm border border-[#8892B015] rounded-full px-4 py-2 shadow-lg">
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#8892B030]"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#C5A022]"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${progress}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#EAEAEA]">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      )}
    </>
  );
}
