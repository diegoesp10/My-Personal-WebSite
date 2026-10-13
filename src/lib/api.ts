export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init);
  if (!r.ok) {
    const body = await r.json().catch(() => null);
    throw new Error(body?.error || `No se pudo completar la operación (${r.status}).`);
  }
  return r.json();
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
