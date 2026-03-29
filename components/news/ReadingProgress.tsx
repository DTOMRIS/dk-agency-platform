'use client';

import { useCallback, useEffect, useState } from 'react';

interface ReadingProgressProps {
  showPercentage?: boolean;
  color?: string;
  height?: number;
  paywallThreshold?: number;
  onPaywallTrigger?: () => void;
}

export default function ReadingProgress({
  showPercentage = true,
  color = 'bg-red-600',
  height = 4,
  paywallThreshold = 40,
  onPaywallTrigger,
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [paywallTriggered, setPaywallTriggered] = useState(false);

  const triggerPaywall = useCallback(() => {
    if (!paywallTriggered) {
      setPaywallTriggered(true);
      onPaywallTrigger?.();
      window.dispatchEvent(new CustomEvent('paywallTrigger', { detail: { progress } }));
    }
  }, [onPaywallTrigger, paywallTriggered, progress]);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      const nextProgress = Math.min(scrollProgress, 100);

      setProgress(nextProgress);

      if (typeof paywallThreshold === 'number' && nextProgress >= paywallThreshold && !paywallTriggered) {
        triggerPaywall();
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, [paywallThreshold, paywallTriggered, triggerPaywall]);

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50">
        <div className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur" style={{ height: `${height}px` }}>
          <div className={`${color} h-full transition-all duration-150 ease-out`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {showPercentage && progress > 5 && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 shadow-lg backdrop-blur-sm">
          <div className="relative h-10 w-10">
            <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-red-600"
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
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      )}
    </>
  );
}
