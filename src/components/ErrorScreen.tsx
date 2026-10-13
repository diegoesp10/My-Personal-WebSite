import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Copy, Home, RotateCcw } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { errorCopy } from '../lib/errors';
import { useThemeColors } from '../lib/useThemeColors';
import { gsap, reducedMotion } from '../motion/gsap';
import { BrandMark } from './Brand';
import { Link } from './Link';
import { GlyphField } from './GlyphField';
import { ThemeToggle } from './ThemeToggle';

/**
 * The site's error page: the error label decrypts itself over a field of code glyphs that light up around the
 * pointer (GlyphField). `embedded` renders it inside the layout (unknown routes); otherwise it is a full page with its own
 * brand bar, used when the content cannot load at all.
 */
export function ErrorScreen({
  code,
  status,
  reference,
  embedded = false,
  onRetry,
}: {
  code: string;
  status?: number;
  reference?: string;
  embedded?: boolean;
  onRetry?: () => void;
}) {
  const { t } = useLanguage();
  const copy = errorCopy(code, t);
  const colors = useThemeColors();
  const label = useRef<HTMLSpanElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!embedded) document.title = `${copy.label} · ${copy.title}`;
  }, [embedded, copy]);

  useEffect(() => {
    if (!label.current || reducedMotion()) return;
    const tween = gsap.to(label.current, {
      duration: 1.6,
      ease: 'none',
      scrambleText: { text: copy.label, chars: '0123456789#%&<>/', revealDelay: 0.35, speed: 0.45 },
    });
    return () => {
      tween.kill();
    };
  }, [copy.label]);

  const copyReference = () => {
    if (!reference) return;
    navigator.clipboard
      ?.writeText(reference)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  };

  return (
    <section
      className={`error-screen${embedded ? ' is-embedded' : ''}`}
      aria-labelledby="error-title"
    >
      <div className="error-backdrop" aria-hidden="true">
        <GlyphField colors={colors} />
      </div>
      {!embedded && (
        <div className="error-bar shell">
          <Link to="/" className="brand" aria-label={t.nav.home}>
            <BrandMark />
          </Link>
          <ThemeToggle />
        </div>
      )}
      <div className="error-card">
        <p className="eyebrow error-eyebrow">
          {t.error.eyebrow}
          {status ? ` ${status}` : ''} · <code>{code}</code>
        </p>
        <p className="error-label" aria-hidden="true">
          <span ref={label}>{copy.label}</span>
        </p>
        <h1 id="error-title" className="error-title">
          {copy.title}
        </h1>
        <p className="error-text">{copy.text}</p>
        {reference && (
          <div className="error-reference">
            <span>{t.error.reference}</span>
            <code>{reference}</code>
            <button
              type="button"
              className="icon-button"
              onClick={copyReference}
              aria-label={copied ? t.error.referenceCopied : t.error.copyReference}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        )}
        <div className="error-actions">
          {copy.retry && onRetry && (
            <button type="button" className="button button-accent" onClick={onRetry}>
              <RotateCcw size={17} /> {t.error.retry}
            </button>
          )}
          <Link className={`button${copy.retry && onRetry ? ' button-ghost' : ''}`} to="/">
            <Home size={17} /> {t.error.home}
          </Link>
          {embedded && (
            <button type="button" className="button button-ghost" onClick={() => history.back()}>
              <ArrowLeft size={17} /> {t.error.back}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
