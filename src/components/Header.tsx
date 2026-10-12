import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { ArrowUpRight, Github, Linkedin, Menu, X } from 'lucide-react';
import { safeUrl } from '../lib/api';
import type { Profile } from '../lib/types';
import { BrandMark } from './Brand';
import { ThemeToggle } from './ThemeToggle';

export const navigation: [string, string][] = [
  ['/proyectos', 'Proyectos'],
  ['/experiencia', 'Experiencia'],
  ['/github', 'GitHub'],
  ['/sobre-mi', 'Sobre mí'],
  ['/diario', 'Diario'],
];

export function Header({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const shortName = profile.name.split(' ').slice(0, 2).join(' ');

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="shell header-inner">
        <Link to="/" className="brand" aria-label={`${profile.name}, inicio`}>
          <BrandMark />
          <span className="brand-name">{shortName}</span>
        </Link>
        <nav className="main-nav" aria-label="Principal">
          {navigation.map(([to, label]) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <NavLink to="/contacto" className="button button-small header-cta">
            Contacto
          </NavLink>
          <button
            type="button"
            className="icon-button menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <nav aria-label="Principal (móvil)">
          <NavLink to="/" end>
            Inicio
          </NavLink>
          {navigation.map(([to, label]) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
          <NavLink to="/contacto">Contacto</NavLink>
        </nav>
        <div className="mobile-menu-footer">
          {profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
          <div className="social-row">
            {safeUrl(profile.github) && (
              <a href={safeUrl(profile.github)} target="_blank" rel="noreferrer">
                <Github size={16} /> GitHub <ArrowUpRight size={14} />
              </a>
            )}
            {safeUrl(profile.linkedin) && (
              <a href={safeUrl(profile.linkedin)} target="_blank" rel="noreferrer">
                <Linkedin size={16} /> LinkedIn <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
