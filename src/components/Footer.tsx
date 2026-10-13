import { Link } from './Link';
import { ArrowUpRight, Settings2 } from 'lucide-react';
import { openCookiePreferences } from '../consent/consent';
import { legalLinks } from '../legal/documents';
import { safeUrl } from '../lib/api';
import type { Portfolio } from '../lib/types';
import { BrandMark } from './Brand';
import { navigation } from './Header';

export function Footer({ data, canEdit }: { data: Portfolio; canEdit: boolean }) {
  const p = data.profile;
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
            <Link to="/" className="brand" aria-label="Inicio">
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
          <nav className="footer-nav" aria-label="Pie de página">
            <div>
              <h2>Páginas</h2>
              <ul>
                <li>
                  <Link to="/">Inicio</Link>
                </li>
                {navigation.map(([to, label]) => (
                  <li key={to}>
                    <Link to={to}>{label}</Link>
                  </li>
                ))}
                <li>
                  <Link to="/contacto">Contacto</Link>
                </li>
              </ul>
            </div>
            <div>
              <h2>En la red</h2>
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
                    <a href={`mailto:${p.email}`}>Correo</a>
                  </li>
                )}
              </ul>
            </div>
          </nav>
        </div>
        <nav className="footer-legal" aria-label="Textos legales">
          {legalLinks.map(({ slug, short }) => (
            <Link key={slug} to={`/legal/${slug}`}>
              {short}
            </Link>
          ))}
          <button type="button" onClick={openCookiePreferences}>
            Preferencias de cookies
          </button>
        </nav>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {p.name}
          </span>
          <Link to="/visitas" className="footer-live">
            <span className="pulse" aria-hidden="true" /> Mapa de visitas en directo
          </Link>
          <span>
            Hecho con ASP.NET Core y React
            {thisSite && (
              <>
                {' · '}
                <Link to={`/proyectos/${thisSite.id}`}>cómo está hecha esta web</Link>
              </>
            )}
          </span>
          {canEdit && (
            <Link to="/editor" className="editor-link">
              <Settings2 size={14} /> Editar contenido
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
