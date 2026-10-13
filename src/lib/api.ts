import type { ApiLanguage, ApiProblem } from './types';

/**
 * Failure of an API call. The API answers errors as Problem Details (RFC 9457): `code` is stable and drives the
 * interface (see lib/errors.ts), `message` is the translated `detail` and `traceId` identifies the request in the
 * logs and the private error history. Older responses ({ error }) and failures without a body get a code from their
 * status; `network` means the server could not be reached.
 */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly traceId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Same mapping as ErrorCatalog.ForStatus in the API, plus the gateway errors that Nginx answers itself. */
const codeForStatus = (status: number) =>
  status === 400
    ? 'request.invalid'
    : status === 401 || status === 403
      ? 'request.forbidden'
      : status === 404
        ? 'request.not_found'
        : status === 409
          ? 'portfolio.conflict'
          : status === 413
            ? 'request.too_large'
            : status === 429
              ? 'request.rate_limit'
              : status === 502 || status === 503 || status === 504
                ? 'server.unavailable'
                : status >= 500
                  ? 'server.unexpected'
                  : 'request.invalid';

async function toApiError(response: Response, language: ApiLanguage) {
  const body = (await response.json().catch(() => null)) as Partial<ApiProblem> | null;
  const text = (value: unknown) => (typeof value === 'string' && value ? value : undefined);
  return new ApiError(
    text(body?.code) ?? codeForStatus(response.status),
    text(body?.detail) ??
      text(body?.error) ??
      (language === 'en'
        ? `The operation could not be completed (${response.status}).`
        : `No se pudo completar la operación (${response.status}).`),
    response.status,
    text(body?.traceId) ?? response.headers.get('X-Correlation-ID') ?? undefined,
  );
}

/**
 * Calls the API. The language belongs to the transport contract, separate from the authored content: GET and HEAD
 * send it in the query, JSON bodies as a property and uploads as a form field.
 */
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

  let response: Response;
  try {
    response = await fetch(target, options);
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new ApiError(
      'network',
      language === 'en' ? 'Could not reach the server.' : 'No hay conexión con el servidor.',
      0,
    );
  }
  if (!response.ok) throw await toApiError(response, language);
  return response.status === 204 ? (undefined as T) : response.json();
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
