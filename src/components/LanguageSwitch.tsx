import { useLocation } from 'react-router';
import { languageState, useLanguage } from '../i18n/LanguageContext';
import { languages, withoutLanguage } from '../i18n/languages';
import { Link } from './Link';

/**
 * The same page in each language: the address keeps everything but its prefix, and the scroll position stays.
 * Each link is labelled in its own language, so it reads right whatever language the visitor speaks.
 */
export function LanguageSwitch({ className = '' }: { className?: string }) {
  const { language, t } = useLanguage();
  const { pathname, search, hash } = useLocation();
  const rest = withoutLanguage(pathname);
  return (
    // A group, not a nav: it sits inside the menus, whose nav styles must not apply to it.
    <div
      className={`language-switch ${className}`.trim()}
      role="group"
      aria-label={t.language.switchLabel}
    >
      {languages.map((code) =>
        code === language ? (
          <span key={code} lang={code} aria-current="true">
            {code}
          </span>
        ) : (
          <Link
            key={code}
            to={`/${code}${rest === '/' ? '' : rest}${search}${hash}`}
            lang={code}
            hrefLang={code}
            aria-label={languageState(code).t.language.switchTo}
            title={languageState(code).t.language.name}
            preventScrollReset
          >
            {code}
          </Link>
        ),
      )}
    </div>
  );
}
