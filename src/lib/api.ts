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

export const isGitHubUrl = (url: string) => /^https:\/\/github\.com\//i.test(url);

/** Normalised https://github.com/owner/repo, used to match repositories with portfolio projects. */
export const repositoryKey = (url: string) =>
  url
    .toLowerCase()
    .replace(/\.git$/, '')
    .replace(/\/+$/, '');
