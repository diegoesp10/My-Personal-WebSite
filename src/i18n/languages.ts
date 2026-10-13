/**
 * Languages of the site. Every public address starts with one of them (/es/proyectos, /en/proyectos); the rest of
 * the route is the same in all of them. The content of each language comes from the API (language parameter), the
 * interface texts from the dictionaries in this folder. Keep in sync with ContentLanguage in the API.
 */
export const languages = ['es', 'en'] as const;
export type Language = (typeof languages)[number];
export const defaultLanguage: Language = 'es';

export const isLanguage = (value: unknown): value is Language =>
  languages.includes(value as Language);

/** Language of an address: its first segment, or the default one (/editor, legacy addresses). */
export function languageOf(pathname: string): Language {
  const first = pathname.split('/')[1];
  return isLanguage(first) ? first : defaultLanguage;
}

/** Address without its language prefix: /en/proyectos/x → /proyectos/x, /en → /. */
export const withoutLanguage = (pathname: string) =>
  pathname.replace(/^\/(es|en)(?=\/|$)/, '') || '/';

/**
 * Internal address in a language: /proyectos → /en/proyectos, / → /en. Addresses that already carry a language,
 * the editor and files served by the API (/uploads, /api, /sitemap.xml) are left as they are.
 */
export function localizePath(path: string, language: Language) {
  if (!path.startsWith('/') || /^\/(es|en|editor|api|uploads)(\/|$|\?|#)/.test(path)) return path;
  if (/^\/[^/?#]+\.[a-z]+$/i.test(path)) return path;
  return `/${language}${path === '/' ? '' : path}`;
}

/** Language the browser prefers among the supported ones. */
export function preferredLanguage(): Language {
  for (const tag of navigator.languages ?? [navigator.language]) {
    const code = tag.slice(0, 2).toLowerCase();
    if (isLanguage(code)) return code;
  }
  return defaultLanguage;
}
