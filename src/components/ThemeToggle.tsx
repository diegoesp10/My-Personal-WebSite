import { useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

const current = (): Theme =>
  (document.documentElement.dataset.theme as Theme | undefined) ??
  (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(current);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  const apply = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Storage can be unavailable (private mode); the choice then lasts for this visit.
    }
    flushSync(() => setTheme(next));
  };

  // The new theme spreads as a circle from the button (View Transitions API, styles/motion.css).
  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches)
      return apply();
    // Keyboard activation has no pointer position: start from the button itself.
    const button = event.currentTarget.getBoundingClientRect();
    const fromKeyboard = event.detail === 0;
    const x = fromKeyboard ? button.left + button.width / 2 : event.clientX;
    const y = fromKeyboard ? button.top + button.height / 2 : event.clientY;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add('theme-transition');
    const transition = document.startViewTransition(apply);
    transition.ready
      .then(() =>
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          {
            duration: 700,
            easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        ),
      )
      .catch(() => {});
    transition.finished.finally(() => root.classList.remove('theme-transition'));
  };

  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      aria-label={next === 'dark' ? 'Activar tema oscuro' : 'Activar tema claro'}
      title={next === 'dark' ? 'Tema oscuro' : 'Tema claro'}
      onClick={toggle}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
