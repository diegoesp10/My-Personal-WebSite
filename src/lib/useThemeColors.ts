import { useEffect, useState } from 'react';

export type ThemeColors = {
  dark: boolean;
  bg: string;
  ink: string;
  muted: string;
  faint: string;
  line: string;
  accent: string;
};

const read = (): ThemeColors => {
  const style = getComputedStyle(document.documentElement);
  const value = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    dark: style.getPropertyValue('color-scheme').trim() === 'dark',
    bg: value('--bg', '#f5f3ee'),
    ink: value('--ink', '#16171a'),
    muted: value('--muted', '#5c5e57'),
    faint: value('--faint', '#9a9c93'),
    line: value('--line', '#dedad0'),
    accent: value('--accent', '#e2491d'),
  };
};

/**
 * Colours of the current theme (styles/tokens.css) for canvas and WebGL drawings, which cannot use CSS
 * variables. Updates when the theme toggle or the system preference changes.
 */
export function useThemeColors() {
  const [colors, setColors] = useState(read);
  useEffect(() => {
    const update = () => setColors(read());
    const theme = new MutationObserver(update);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const scheme = matchMedia('(prefers-color-scheme: dark)');
    scheme.addEventListener('change', update);
    return () => {
      theme.disconnect();
      scheme.removeEventListener('change', update);
    };
  }, []);
  return colors;
}
