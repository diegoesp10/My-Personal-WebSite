import { useSyncExternalStore } from 'react';

/** Optional categories. Technical storage (theme, this choice, Cloudflare security) needs no consent. */
export type ConsentCategory = 'analytics' | 'marketing';

export type Consent = {
  version: number;
  analytics: boolean;
  marketing: boolean;
  /** ISO date of the decision. */
  decidedAt: string;
};

// Raising the version asks again, for example when a new optional category starts being used.
const VERSION = 1;
const KEY = 'cookie-consent';
const OPEN_EVENT = 'cookie-preferences:open';
const listeners = new Set<() => void>();

let current: Consent | null = load();

function load(): Consent | null {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Consent | null;
    return stored?.version === VERSION ? stored : null;
  } catch {
    return null;
  }
}

/** Saves the visitor's decision (in this browser only) and notifies the components that read it. */
export function saveConsent(choice: Pick<Consent, ConsentCategory>) {
  current = { version: VERSION, ...choice, decidedAt: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // Storage unavailable: the decision lasts for this visit.
  }
  listeners.forEach((listener) => listener());
}

/** Whether an optional category may be used. Any future optional script must check it before loading. */
export const hasConsent = (category: ConsentCategory) => current?.[category] === true;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The stored decision, or null while the visitor has not decided. */
export const useConsent = () => useSyncExternalStore(subscribe, () => current);

/** Opens the preferences dialog from anywhere (footer link, cookie policy). */
export const openCookiePreferences = () => window.dispatchEvent(new Event(OPEN_EVENT));
export const onOpenCookiePreferences = (handler: () => void) => {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
};
