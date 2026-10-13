import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  type LinkProps,
  type NavLinkProps,
  type To,
} from 'react-router';
import { useLanguage } from '../i18n/LanguageContext';

/** Absolute internal addresses get the language of the current page: /proyectos → /en/proyectos. */
function useLocalized(to: To): To {
  const { path } = useLanguage();
  if (typeof to === 'string') return path(to);
  return to.pathname ? { ...to, pathname: path(to.pathname) } : to;
}

// Internal links animate with the View Transitions API where the browser supports it
// (styles in styles/motion.css). Other browsers navigate without the transition.
export function Link({ to, ...props }: LinkProps) {
  return <RouterLink viewTransition {...props} to={useLocalized(to)} />;
}

export function NavLink({ to, ...props }: NavLinkProps) {
  return <RouterNavLink viewTransition {...props} to={useLocalized(to)} />;
}
