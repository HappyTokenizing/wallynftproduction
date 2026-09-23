'use client';

import { Analytics } from '@vercel/analytics/next';

export function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        const url = new URL(event.url);
        if (
          event.type !== 'pageview' ||
          !['wallynft.xyz', 'www.wallynft.xyz', 'wallynftproduction.vercel.app'].includes(url.hostname) ||
          /^\/admin(?:\/|$)/.test(url.pathname)
        ) {
          return null;
        }
        url.search = '';
        url.hash = '';
        return { ...event, url: url.href };
      }}
    />
  );
}
