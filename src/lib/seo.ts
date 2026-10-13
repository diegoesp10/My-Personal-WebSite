import { useEffect, useRef } from 'react';
import { request } from './api';
import type { PageMetadata } from './types';

/**
 * Writes the metadata of a page in <head>: the same tags that the API renders for Nginx
 * (Portfolio.Api/Features/Seo/SeoHeadRenderer.cs). Every tag except the title carries data-seo.
 */
export function applyPageMetadata(page: PageMetadata) {
  document.title = page.title;
  const head = document.head;
  head.querySelectorAll('[data-seo]').forEach((node) => node.remove());

  const add = (tag: string, attributes: Record<string, string>, text?: string) => {
    const element = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    element.setAttribute('data-seo', '');
    if (text !== undefined) element.textContent = text;
    head.append(element);
  };
  const meta = (attribute: 'name' | 'property', name: string, content: string | null) => {
    if (content) add('meta', { [attribute]: name, content });
  };

  meta('name', 'description', page.description);
  if (page.indexable && page.url) add('link', { rel: 'canonical', href: page.url });
  else meta('name', 'robots', 'noindex');
  meta('property', 'og:type', page.type);
  meta('property', 'og:site_name', page.siteName);
  meta('property', 'og:locale', 'es_ES');
  meta('property', 'og:title', page.title);
  meta('property', 'og:description', page.description);
  meta('property', 'og:url', page.url);
  meta('property', 'og:image', page.image);
  meta('property', 'og:image:alt', page.imageAlt);
  meta('property', 'article:published_time', page.published);
  meta('name', 'twitter:card', 'summary_large_image');
  meta('name', 'twitter:title', page.title);
  meta('name', 'twitter:description', page.description);
  meta('name', 'twitter:image', page.image);
  // A data block, never executed: the CSP does not apply to it.
  if (page.structuredData)
    add('script', { type: 'application/ld+json' }, JSON.stringify(page.structuredData));
}

/**
 * Keeps <head> in step with the current page. The first page usually arrives with its metadata already inserted by
 * the server; later navigations ask the API, the single source of these texts.
 */
export function usePageMetadata(pathname: string) {
  const first = useRef(true);
  useEffect(() => {
    const served = first.current && document.head.querySelector('[data-seo]') !== null;
    first.current = false;
    if (served) return;
    // An outdated answer is ignored instead of aborting the request: the response is tiny, and aborting made the API
    // see a cancelled request on every navigation (and twice per page in development, where effects run twice).
    let current = true;
    request<PageMetadata>(`/api/seo/page?${new URLSearchParams({ path: decodePath(pathname) })}`)
      .then((page) => {
        if (current) applyPageMetadata(page);
      })
      // The previous metadata stays: it only affects the tab title and link previews.
      .catch(() => {});
    return () => {
      current = false;
    };
  }, [pathname]);
}

const decodePath = (pathname: string) => {
  try {
    return decodeURI(pathname);
  } catch {
    return pathname;
  }
};
