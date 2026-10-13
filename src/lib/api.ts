/** Field that failed the API validation (`errors` of a `validation.failed` problem). */
export type FieldError = { field: string; code: string; message: string };

/**
 * Failure of an API call. The API answers errors as Problem Details (RFC 9457): `code` is stable and drives the
 * interface (see lib/errors.ts), `message` is the translated `detail` and `traceId` identifies the request in its
 * logs. Older responses ({ error }) and failures without a body get a code from their status; `network` means the
 * server could not be reached.
 */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly traceId?: string,
    readonly errors: FieldError[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const codeForStatus = (status: number) =>
  status === 404
    ? 'resource.not_found'
    : status === 413
      ? 'request.too_large'
      : status === 429
        ? 'rate_limit.exceeded'
        : status === 502 || status === 503 || status === 504
          ? 'service.unavailable'
          : status >= 500
            ? 'server.error'
            : 'request.invalid';

async function toApiError(response: Response) {
  const body = await response.json().catch(() => null);
  const problem = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const text = (value: unknown) => (typeof value === 'string' && value ? value : undefined);
  return new ApiError(
    text(problem.code) ?? codeForStatus(response.status),
    text(problem.detail) ??
      text(problem.title) ??
      text(problem.error) ??
      `No se pudo completar la operación (${response.status}).`,
    response.status,
    text(problem.traceId),
    Array.isArray(problem.errors) ? (problem.errors as FieldError[]) : [],
  );
}

export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('network', 'No hay conexión con el servidor.', 0);
  }
  if (!response.ok) throw await toApiError(response);
  return response.json();
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
