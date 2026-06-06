'use client';
// Fires a result_view event with a virality flag: did the visitor land here from
// a shared link (a fresh load of this result page) or from taking the quiz in-app?
import { useEffect } from 'react';
import { track } from '@vercel/analytics';

export function TrackResultView({ slug, result }: { slug: string; result: string }) {
  useEffect(() => {
    let entry: 'internal' | 'external' | 'direct' = 'internal';
    try {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const entryPath = nav?.name ? new URL(nav.name).pathname : location.pathname;
      // If this result page was the document that loaded, the visit came from outside
      // (a shared link). If we navigated here in-app (from the quiz), entryPath differs.
      const directLoad = entryPath === location.pathname;
      if (directLoad) {
        if (!document.referrer) entry = 'direct';
        else {
          try { entry = new URL(document.referrer).host === location.host ? 'internal' : 'external'; }
          catch { entry = 'direct'; }
        }
      }
    } catch { /* analytics is best-effort */ }
    track('result_view', { slug, result, entry });
  }, [slug, result]);

  return null;
}
