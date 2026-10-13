import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { en } from './en';
import { es, type Messages } from './es';
import { languageOf, languages, localizePath, type Language } from './languages';

export type LanguageState = {
  language: Language;
  /** Interface texts of the language. */
  t: Messages;
  /** BCP 47 locale for dates and numbers. */
  locale: string;
  /** Internal address in this language: /proyectos → /en/proyectos. */
  path: (to: string) => string;
};

const dictionaries: Record<Language, Messages> = { es, en };
const locales: Record<Language, string> = { es: 'es-ES', en: 'en-GB' };

const states = Object.fromEntries(
  languages.map((language) => [
    language,
    {
      language,
      t: dictionaries[language],
      locale: locales[language],
      path: (to: string) => localizePath(to, language),
    },
  ]),
) as Record<Language, LanguageState>;

/** The state of a language, for code that runs outside React components. */
export const languageState = (language: Language) => states[language];

const LanguageContext = createContext<LanguageState | null>(null);

/** Provides the language of the current address to the whole app and keeps <html lang> in step with it. */
export function LanguageProvider({
  language,
  children,
}: {
  language: Language;
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return <LanguageContext.Provider value={states[language]}>{children}</LanguageContext.Provider>;
}

/**
 * Language of the current page with its texts. Error boundaries can render outside the provider: there the language
 * is read from the address.
 */
export function useLanguage(): LanguageState {
  return useContext(LanguageContext) ?? states[languageOf(window.location.pathname)];
}
