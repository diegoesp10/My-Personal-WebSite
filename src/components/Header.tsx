import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Link, NavLink } from './Link';
import { ArrowUpRight, Github, Linkedin, Menu, X } from 'lucide-react';
import { safeUrl, telUrl } from '../lib/api';
import type { Profile } from '../lib/types';
import { BrandMark } from './Brand';
import { ThemeToggle } from './ThemeToggle';

export const navigation: [string, string][] = [
  ['/proyectos', 'Proyectos'],
  ['/experiencia', 'Experiencia'],
  ['/github', 'GitHub'],
  ['/visitas', 'Visitas'],
  ['/sobre-mi', 'Sobre mí'],
  ['/diario', 'Diario'],
];

export function Header({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  const shortName = profile.name.split(' ').slice(0, 2).join(' ');

  useEffect(() => setOpen(false), [pathname]);
  // Reading progress: a thin accent line under the header.
  const progress = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const share = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progress.current) progress.current.style.transform = `scaleX(${share})`;
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    document.body.classList.add('menu-open');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('menu-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="shell header-inner">
        <Link to="/" className="brand" aria-label={`${profile.name}, inicio`}>
          <BrandMark />
          <span className="brand-name">{shortName}</span>
        </Link>
        <nav className="main-nav" aria-label="Principal">
          {navigation.map(([to, label], index) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <>
                  {/* Shared view-transition name: the pill glides to the new section. */}
                  {isActive && <span className="nav-pill" aria-hidden="true" />}
                  <span className="nav-label" style={{ viewTransitionName: `nav-label-${index}` }}>
                    {label}
                  </span>
                </>
              )}
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
      <span ref={progress} className="scroll-progress" aria-hidden="true" />
      <div id="mobile-menu" className="mobile-menu" hidden={!open} data-lenis-prevent>
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
          {telUrl(profile.phone) && <a href={telUrl(profile.phone)}>{profile.phone}</a>}
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
