import { useEffect, useState } from 'react';
import { request } from '../lib/api';
import type { VisitorSummary } from '../lib/types';

let firstPage = true;
let lastSent = { path: '', at: 0 };

/**
 * Reports a page view to the API (anonymous statistics on /visitas). No cookies or identifiers are sent; the
 * referring site goes only with the first page of the visit and only when it is another site. Browsers that ask
 * not to be tracked send nothing.
 */
export function sendVisit(path: string) {
  const privacy = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (path.startsWith('/editor') || navigator.doNotTrack === '1' || privacy.globalPrivacyControl)
    return;
  // The same page reported twice in a row within a second is one view (React StrictMode mounts twice).
  const now = Date.now();
  if (lastSent.path === path && now - lastSent.at < 1000) return;
  lastSent = { path, at: now };
  let referrer = '';
  if (firstPage && document.referrer) {
    try {
      if (new URL(document.referrer).host !== location.host) referrer = document.referrer;
    } catch {
      // Malformed referrer: ignore it.
    }
  }
  firstPage = false;
  const body = JSON.stringify({ path, referrer });
  const sent = navigator.sendBeacon?.(
    '/api/visits',
    new Blob([body], { type: 'application/json' }),
  );
  if (!sent)
    fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
}

/** Visitor summary, refreshed every 30 seconds while the page is visible. */
export function useVisitors() {
  const [summary, setSummary] = useState<VisitorSummary>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const load = () => {
      if (document.hidden) return;
      request<VisitorSummary>('/api/visitors')
        .then((data) => {
          if (!active) return;
          setSummary(data);
          setFailed(false);
        })
        .catch(() => active && setFailed(true));
    };
    // Give the beacon of this page a moment to arrive so the visitor sees themself counted.
    const first = setTimeout(load, 400);
    const timer = setInterval(load, 30_000);
    document.addEventListener('visibilitychange', load);
    return () => {
      active = false;
      clearTimeout(first);
      clearInterval(timer);
      document.removeEventListener('visibilitychange', load);
    };
  }, []);
  return { summary, failed };
}
