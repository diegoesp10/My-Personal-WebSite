import type { Messages } from '../i18n/es';
import type { Language } from '../i18n/languages';
import { ApiError } from './api';

/** What the error page shows for an error code (texts in the dictionaries, i18n/es.ts and i18n/en.ts). */
export type ErrorCopy = {
  /** Large label: the HTTP status or a short word. */
  label: string;
  title: string;
  text: string;
  /** Whether trying again can fix it (the page offers "Reintentar"). */
  retry: boolean;
};

/**
 * Copy for an error code: codes of the API catalog (Portfolio.Errors/Catalog/ErrorCatalog.cs) plus the frontend's
 * own (route.not_found, network, app.crash).
 */
export const errorCopy = (code: string | null | undefined, t: Messages): ErrorCopy =>
  (code && t.error.copies[code]) || t.error.fallback;

/** Address of the error page for an error, in a language: /es/error?code=…&status=…&ref=… */
export function errorPath(error: unknown, language: Language) {
  const query = new URLSearchParams();
  if (error instanceof ApiError) {
    query.set('code', error.code);
    if (error.status) query.set('status', String(error.status));
    if (error.traceId) query.set('ref', error.traceId);
  } else query.set('code', 'app.crash');
  return `/${language}/error?${query}`;
}
