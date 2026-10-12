import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

const current = (): Theme =>
  (document.documentElement.dataset.theme as Theme | undefined) ??
  (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(current);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className="icon-button"
      aria-label={next === 'dark' ? 'Activar tema oscuro' : 'Activar tema claro'}
      title={next === 'dark' ? 'Tema oscuro' : 'Tema claro'}
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem('theme', next);
        } catch {
          // Storage can be unavailable (private mode); the choice then lasts for this visit.
        }
        setTheme(next);
      }}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
