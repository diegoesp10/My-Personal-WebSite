import { Link } from './Link';
import { ArrowUpRight, Settings2 } from 'lucide-react';
import { openCookiePreferences } from '../consent/consent';
import { useLanguage } from '../i18n/LanguageContext';
import { legalLinks } from '../legal/links';
import { safeUrl } from '../lib/api';
import type { Portfolio } from '../lib/types';
import { BrandMark } from './Brand';
import { navigation } from './Header';

export function Footer({ data, canEdit }: { data: Portfolio; canEdit: boolean }) {
  const p = data.profile;
  const { t } = useLanguage();
  const thisSite = data.projects.find((project) => project.id === 'portfolio');
  const external: [string, string | undefined][] = [
    ['GitHub', safeUrl(p.github)],
    ['LinkedIn', safeUrl(p.linkedin)],
  ];
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="brand" aria-label={t.nav.home}>
              <BrandMark />
            </Link>
            <p>
              {p.name}
              <br />
              <span>
                {p.role}
                {p.location && ` · ${p.location}`}
              </span>
            </p>
          </div>
          <nav className="footer-nav" aria-label={t.footer.label}>
            <div>
              <h2>{t.footer.pages}</h2>
              <ul className="footer-pages">
                <li>
                  <Link to="/">{t.nav.home}</Link>
                </li>
                {navigation.map(([to, key]) => (
                  <li key={to}>
                    <Link to={to}>{t.nav[key]}</Link>
                  </li>
                ))}
                <li>
                  <Link to="/contacto">{t.nav.contacto}</Link>
                </li>
              </ul>
            </div>
            <div>
              <h2>{t.footer.elsewhere}</h2>
              <ul>
                {external.map(
                  ([label, url]) =>
                    url && (
                      <li key={label}>
                        <a href={url} target="_blank" rel="noreferrer">
                          {label} <ArrowUpRight size={13} />
                        </a>
                      </li>
                    ),
                )}
                {p.email && (
                  <li>
                    <a href={`mailto:${p.email}`}>{t.footer.email}</a>
                  </li>
                )}
              </ul>
            </div>
          </nav>
        </div>
        <nav className="footer-legal" aria-label={t.footer.legal}>
          {legalLinks.map((slug) => (
            <Link key={slug} to={`/legal/${slug}`}>
              {t.legal.short[slug]}
            </Link>
          ))}
          <button type="button" onClick={openCookiePreferences}>
            {t.footer.cookies}
          </button>
        </nav>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {p.name}
          </span>
          <Link to="/visitas" className="footer-live">
            <span className="pulse" aria-hidden="true" /> {t.footer.live}
          </Link>
          <span>
            {t.footer.madeWith}
            {thisSite && (
              <>
                {' · '}
                <Link to={`/proyectos/${thisSite.id}`}>{t.footer.howBuilt}</Link>
              </>
            )}
          </span>
          {canEdit && (
            <Link to="/editor" className="editor-link">
              <Settings2 size={14} /> {t.footer.edit}
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
