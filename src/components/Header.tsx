import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Link, NavLink } from './Link';
import { ArrowUpRight, Github, Linkedin, Menu, X } from 'lucide-react';
import { safeUrl, telUrl } from '../lib/api';
import type { Profile } from '../lib/types';
import { useLanguage } from '../i18n/LanguageContext';
import { BrandMark } from './Brand';
import { LanguageSwitch } from './LanguageSwitch';
import { ThemeToggle } from './ThemeToggle';

export type Section = 'proyectos' | 'experiencia' | 'github' | 'visitas' | 'sobre-mi' | 'diario';

/** Main sections: address without language prefix and key of its name in the dictionaries (t.nav). */
export const navigation: [string, Section][] = [
  ['/proyectos', 'proyectos'],
  ['/experiencia', 'experiencia'],
  ['/github', 'github'],
  ['/visitas', 'visitas'],
  ['/sobre-mi', 'sobre-mi'],
  ['/diario', 'diario'],
];

export function Header({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { t } = useLanguage();
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
        <Link to="/" className="brand" aria-label={t.nav.brandHome(profile.name)}>
          <BrandMark />
          <span className="brand-name">{shortName}</span>
        </Link>
        <nav className="main-nav" aria-label={t.nav.main}>
          {navigation.map(([to, key]) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="nav-pill" aria-hidden="true" />}
                  <span className="nav-label">{t.nav[key]}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <LanguageSwitch className="header-language" />
          <ThemeToggle />
          <NavLink to="/contacto" className="button button-small header-cta">
            {t.nav.contacto}
          </NavLink>
          <button
            type="button"
            className="icon-button menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <span ref={progress} className="scroll-progress" aria-hidden="true" />
      <div id="mobile-menu" className="mobile-menu" hidden={!open} data-lenis-prevent>
        <nav aria-label={t.nav.mobile}>
          <NavLink to="/" end>
            {t.nav.home}
          </NavLink>
          {navigation.map(([to, key]) => (
            <NavLink key={to} to={to}>
              {t.nav[key]}
            </NavLink>
          ))}
          <NavLink to="/contacto">{t.nav.contacto}</NavLink>
        </nav>
        <div className="mobile-menu-footer">
          <LanguageSwitch />
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
