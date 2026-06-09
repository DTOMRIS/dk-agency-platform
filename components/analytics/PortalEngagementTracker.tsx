'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function PortalEngagementTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Get or generate session ID
    let sessionId = sessionStorage.getItem('portal_tracker_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      sessionStorage.setItem('portal_tracker_session_id', sessionId);
    }
    activeSessionIdRef.current = sessionId;

    // 2. Parse UTM parameters and referrer
    const utmSource = searchParams.get('utm_source');
    const utmCampaign = searchParams.get('utm_campaign');
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    let source = 'direct';
    if (utmSource) {
      source = utmSource;
    } else if (referrer) {
      try {
        source = new URL(referrer).hostname;
      } catch {
        source = referrer;
      }
    }
    const campaign = utmCampaign || 'organic';

    // Helper to send tracking events
    const trackEvent = async (eventName: string, metadata: Record<string, unknown> = {}) => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: activeSessionIdRef.current,
            pagePath: pathname,
            eventName,
            source,
            campaign,
            metadata: {
              userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
              timestamp: new Date().toISOString(),
              ...metadata,
            },
          }),
        });
      } catch (err) {
        console.error('[Tracker Error]', err);
      }
    };

    // Track page_view event on page load
    trackEvent('page_view');

    // Track dwell_30s event after 30 seconds
    const dwellTimer = setTimeout(() => {
      trackEvent('dwell_30s');
    }, 30000);

    // Track portal_exit on beforeunload
    const handleBeforeUnload = () => {
      const payload = JSON.stringify({
        sessionId: activeSessionIdRef.current,
        pagePath: pathname,
        eventName: 'portal_exit',
        source,
        campaign,
        metadata: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          timestamp: new Date().toISOString(),
          exitType: 'beforeunload',
        },
      });
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/track', new Blob([payload], { type: 'application/json' }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(dwellTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname, searchParams]);

  return null;
}
