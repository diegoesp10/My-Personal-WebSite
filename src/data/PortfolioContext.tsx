import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { languages, type Language } from '../i18n/languages';
import { request } from '../lib/api';
import type { Portfolio } from '../lib/types';

type PortfolioState = {
  /** Content of the current page's language; undefined while it loads. */
  data?: Portfolio;
  /** Why the content could not load (an ApiError for API failures); undefined while it loads or once loaded. */
  error?: unknown;
  /** undefined while the API is being asked whether the local editor is available. */
  canEdit: boolean | undefined;
  /** Content of every language loaded so far (the editor edits any of them). */
  contents: Partial<Record<Language, Portfolio>>;
  /** Loads the content of a language if it has not been loaded yet. */
  ensure: (language: Language) => void;
  reload: () => void;
  replace: (data: Portfolio, language: Language) => void;
};

const PortfolioContext = createContext<PortfolioState | null>(null);

/**
 * Content of the site from the API, one copy per language with the same identifiers. The page's language loads
 * first; once it is ready the other languages load in the background, so switching language is instant.
 */
export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [contents, setContents] = useState<Partial<Record<Language, Portfolio>>>({});
  const [errors, setErrors] = useState<Partial<Record<Language, unknown>>>({});
  const [canEdit, setCanEdit] = useState<boolean>();
  const requested = useRef(new Set<Language>());

  const load = useCallback((code: Language) => {
    requested.current.add(code);
    setErrors((current) => ({ ...current, [code]: undefined }));
    request<Portfolio>('/api/portfolio', undefined, code)
      .then((data) => setContents((current) => ({ ...current, [code]: data })))
      .catch((error: unknown) => {
        requested.current.delete(code);
        setErrors((current) => ({ ...current, [code]: error }));
      });
  }, []);

  const ensure = useCallback(
    (code: Language) => {
      if (!requested.current.has(code)) load(code);
    },
    [load],
  );

  useEffect(() => ensure(language), [ensure, language]);

  const ready = Boolean(contents[language]);
  useEffect(() => {
    if (ready) languages.forEach(ensure);
  }, [ready, ensure]);

  useEffect(() => {
    request<{ enabled: boolean }>('/api/editor')
      .then((r) => setCanEdit(r.enabled))
      .catch(() => setCanEdit(false));
  }, []);

  const replace = useCallback(
    (data: Portfolio, code: Language) => setContents((current) => ({ ...current, [code]: data })),
    [],
  );

  return (
    <PortfolioContext.Provider
      value={{
        data: contents[language],
        error: errors[language],
        canEdit,
        contents,
        ensure,
        reload: () => load(language),
        replace,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioState() {
  const state = useContext(PortfolioContext);
  if (!state) throw new Error('PortfolioProvider no está disponible.');
  return state;
}

/** Content for pages rendered inside the layout, which only mounts them once it has loaded. */
export function usePortfolio() {
  const { data } = usePortfolioState();
  if (!data) throw new Error('El contenido aún no se ha cargado.');
  return data;
}
