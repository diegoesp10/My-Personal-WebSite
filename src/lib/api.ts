import type { ApiLanguage, ApiProblem } from './types';

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly traceId?: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/** Language belongs to the transport contract, separate from the portfolio's authored content. */
export async function request<T>(
  url: string,
  init?: RequestInit,
  language: ApiLanguage = 'es',
): Promise<T> {
  const target = new URL(url, window.location.origin);
  const method = (init?.method ?? 'GET').toUpperCase();
  const options = { ...init };
  if (method === 'GET' || method === 'HEAD') {
    if (!target.searchParams.has('language')) target.searchParams.set('language', language);
  } else if (options.body instanceof FormData) {
    // Copy so retries or another caller cannot mutate the original form.
    const form = new FormData();
    options.body.forEach((value, key) => form.append(key, value));
    form.set('language', language);
    options.body = form;
  } else if (
    typeof options.body === 'string' &&
    new Headers(options.headers).get('Content-Type')?.includes('application/json')
  ) {
    const body: unknown = JSON.parse(options.body);
    if (body && typeof body === 'object' && !Array.isArray(body))
      options.body = JSON.stringify({ ...body, language });
  }
  const r = await fetch(target, options).catch((error: Error) => {
    if (error.name === 'AbortError') throw error;
    throw new ApiRequestError(
      language === 'en'
        ? 'Could not connect to the service. Please try again.'
        : 'No se pudo conectar con el servicio. Inténtalo de nuevo.',
      0,
      'client.network',
    );
  });
  if (!r.ok) {
    const body = (await r.json().catch(() => null)) as Partial<ApiProblem> | null;
    const detail =
      typeof body?.detail === 'string'
        ? body.detail
        : typeof body?.error === 'string'
          ? body.error
          : language === 'en'
            ? `The operation could not be completed (${r.status}).`
            : `No se pudo completar la operación (${r.status}).`;
    const traceId =
      typeof body?.traceId === 'string'
        ? body.traceId
        : (r.headers.get('X-Correlation-ID') ?? undefined);
    throw new ApiRequestError(
      detail,
      r.status,
      typeof body?.code === 'string' ? body.code : undefined,
      traceId,
    );
  }
  return r.status === 204 ? (undefined as T) : r.json();
}

/** Only absolute http(s) links reach an href; anything else is dropped. */
export const safeUrl = (url: string) => (/^https?:\/\//i.test(url) ? url : undefined);

/** Only images uploaded through the editor are rendered. */
export const imageUrl = (url: string) =>
  /^\/uploads\/[a-f0-9]+\.(png|jpg|webp)$/.test(url) ? url : undefined;

/** tel: link for a phone number already validated by the API (+34 600 000 000 → tel:+34600000000). */
export const telUrl = (phone: string) => {
  const digits = phone.replace(/[^\d+]/g, '');
  return /^\+?\d{6,15}$/.test(digits) ? `tel:${digits}` : undefined;
};

/** Valid CSS identifier for view-transition-name, derived from an item id. */
export const transitionName = (prefix: string, id: string) =>
  `${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

export const isGitHubUrl = (url: string) => /^https:\/\/github\.com\//i.test(url);

/** Normalised https://github.com/owner/repo, used to match repositories with portfolio projects. */
export const repositoryKey = (url: string) =>
  url
    .toLowerCase()
    .replace(/\.git$/, '')
    .replace(/\/+$/, '');
