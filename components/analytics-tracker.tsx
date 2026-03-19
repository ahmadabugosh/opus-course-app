'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'false') {
      return;
    }

    void fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'page_view',
        data: {
          path: pathname,
          referrer: typeof document !== 'undefined' ? document.referrer : null,
        },
      }),
    });
  }, [pathname]);

  return null;
}
