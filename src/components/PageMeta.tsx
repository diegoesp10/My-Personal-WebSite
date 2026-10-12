import { useEffect } from 'react';

const site = 'https://diegoespinarodriguez.com';
const defaultTitle = 'Diego Espina · Backend Developer .NET';

function setMeta(selector: string, attribute: 'content' | 'href', value: string) {
  document.querySelector(selector)?.setAttribute(attribute, value);
}

/** Updates the tags already present in index.html, so crawlers that skip JavaScript still read them. */
export function PageMeta({
  title,
  description,
  path,
}: {
  title?: string;
  description?: string;
  path: string;
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} · Diego Espina` : defaultTitle;
    document.title = fullTitle;
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('link[rel="canonical"]', 'href', site + path);
    setMeta('meta[property="og:url"]', 'content', site + path);
    if (description) {
      const text =
        description.length > 160 ? description.slice(0, 157).trimEnd() + '…' : description;
      setMeta('meta[name="description"]', 'content', text);
      setMeta('meta[property="og:description"]', 'content', text);
    }
  }, [title, description, path]);
  return null;
}
