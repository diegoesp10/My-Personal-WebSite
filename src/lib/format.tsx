import { Fragment, type ReactNode } from 'react';

const locale = 'es-ES';

/** 2026-10-12 → 12 oct 2026 */
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(value + 'T12:00:00'))
    .replace('.', '');

const monthDate = (value: string) => {
  const [year, month] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, 15);
};

/** 2025-10 → oct 2025 · 2020 → 2020 */
export const formatMonth = (value: string) =>
  /^\d{4}-\d{2}$/.test(value)
    ? new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' })
        .format(monthDate(value))
        .replace('.', '')
    : value;

export const formatPeriod = (start: string, end: string) =>
  `${formatMonth(start)} — ${end ? formatMonth(end) : 'actualidad'}`;

/** Inclusive length of a period of months: 2025-10 → 2026-05 = 8 meses. */
export function formatDuration(start: string, end: string) {
  if (!/^\d{4}-\d{2}$/.test(start)) return '';
  const from = monthDate(start);
  const to = end ? monthDate(end) : new Date();
  const months = (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth() + 1;
  if (months <= 0) return '';
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [
    years ? `${years} ${years === 1 ? 'año' : 'años'}` : '',
    rest ? `${rest} ${rest === 1 ? 'mes' : 'meses'}` : '',
  ].filter(Boolean);
  return parts.join(' y ');
}

const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
const steps: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

/** ISO date → «hace 3 días» */
export function timeAgo(iso: string, now = Date.now()) {
  const seconds = (new Date(iso).getTime() - now) / 1000;
  for (const [unit, size] of steps)
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  return 'ahora mismo';
}

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
