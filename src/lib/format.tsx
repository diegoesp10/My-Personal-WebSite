import { Fragment, type ReactNode } from 'react';
import { languageState, useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/languages';

const monthDate = (value: string) => {
  const [year, month] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, 15);
};

const steps: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

/** Dates, periods and numbers written in a language. */
function createFormatters(language: Language) {
  const { locale, t } = languageState(language);
  const dayFormat = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const monthFormat = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' });
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  /** 2026-10-12 → 12 oct 2026 · 12 Oct 2026 */
  const date = (value: string) => dayFormat.format(new Date(value + 'T12:00:00')).replace('.', '');

  /** 2025-10 → oct 2025 · Oct 2025; 2020 → 2020 */
  const month = (value: string) =>
    /^\d{4}-\d{2}$/.test(value) ? monthFormat.format(monthDate(value)).replace('.', '') : value;

  const period = (start: string, end: string) =>
    `${month(start)} — ${end ? month(end) : t.format.present}`;

  /** Inclusive length of a period of months: 2025-10 → 2026-05 = 8 meses · 8 months. */
  function duration(start: string, end: string) {
    if (!/^\d{4}-\d{2}$/.test(start)) return '';
    const from = monthDate(start);
    const to = end ? monthDate(end) : new Date();
    const months =
      (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth() + 1;
    if (months <= 0) return '';
    const years = Math.floor(months / 12);
    const rest = months % 12;
    return [
      years ? `${years} ${t.format.year(years)}` : '',
      rest ? `${rest} ${t.format.month(rest)}` : '',
    ]
      .filter(Boolean)
      .join(` ${t.format.and} `);
  }

  /** ISO date → «hace 3 días» · "3 days ago" */
  function timeAgo(iso: string, now = Date.now()) {
    const seconds = (new Date(iso).getTime() - now) / 1000;
    for (const [unit, size] of steps)
      if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
    return t.format.now;
  }

  const number = (value: number) => value.toLocaleString(locale);

  return { date, month, period, duration, timeAgo, number };
}

export type Formatters = ReturnType<typeof createFormatters>;
const cache = new Map<Language, Formatters>();

export function formatters(language: Language) {
  let found = cache.get(language);
  if (!found) cache.set(language, (found = createFormatters(language)));
  return found;
}

/** Formatters of the current page's language. */
export const useFormat = () => formatters(useLanguage().language);

/** Renders *text* fragments as the serif accent used in headings. */
export function emphasis(text: string): ReactNode {
  return text.split(/(\*[^*]+\*)/g).map((part, index) =>
    part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
      <em key={index} className="accent-serif">
        {part.slice(1, -1)}
      </em>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

export const plain = (text: string) => text.replace(/\*/g, '');

export const paragraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

export const pad = (n: number) => String(n).padStart(2, '0');
