import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation, useParams } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { Layout } from './components/Layout';
import { PortfolioProvider } from './data/PortfolioContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { defaultLanguage, isLanguage, languageOf, preferredLanguage } from './i18n/languages';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import EntryPage from './pages/EntryPage';
import ExperiencePage from './pages/ExperiencePage';
import HomePage from './pages/HomePage';
import JournalPage from './pages/JournalPage';
import NotFoundPage from './pages/NotFoundPage';
import ErrorPage, { RouteError } from './pages/ErrorPage';
import ProjectPage from './pages/ProjectPage';
import ProjectsPage from './pages/ProjectsPage';

// Rarely visited: loaded on demand.
const GitHubPage = lazy(() => import('./pages/GitHubPage'));
const VisitsPage = lazy(() => import('./pages/VisitsPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const EditorPage = lazy(() => import('./editor/EditorPage'));

/** Every route: the language of the address (i18n/languages.ts) and the content in that language. */
function Root() {
  const { pathname } = useLocation();
  return (
    <LanguageProvider language={languageOf(pathname)}>
      <PortfolioProvider>
        <Outlet />
      </PortfolioProvider>
    </LanguageProvider>
  );
}

/** / → the visitor's language. Nginx answers the same from Accept-Language before the app loads. */
function LanguageRedirect() {
  const { search, hash } = useLocation();
  return <Navigate to={`/${preferredLanguage()}${search}${hash}`} replace />;
}

/** An address whose first segment is not a language comes from before /es and /en: the same page in Spanish. */
function LanguageGuard() {
  const { lang } = useParams();
  const { pathname, search, hash } = useLocation();
  return isLanguage(lang) ? (
    <Outlet />
  ) : (
    <Navigate to={`/${defaultLanguage}${pathname}${search}${hash}`} replace />
  );
}

// Data router: required for view transitions between pages.
// Public routes are also listed in the API sitemap (Portfolio.Application/Sitemaps/SitemapService.cs) and SEO
// (Portfolio.Application/Seo/SeoService.cs), without the language prefix.
const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <LanguageRedirect /> },
      {
        // Internal tool, in Spanish and without a language prefix; it edits the content of any language.
        path: 'editor',
        element: (
          <Suspense fallback={<div className="status-screen" aria-busy="true" />}>
            <EditorPage />
          </Suspense>
        ),
      },
      {
        path: ':lang',
        element: <LanguageGuard />,
        children: [
          // Outside the layout: it must work when the content cannot load.
          { path: 'error', element: <ErrorPage /> },
          {
            element: <Layout />,
            errorElement: <RouteError />,
            children: [
              {
                // A page that fails while rendering shows the error page inside the layout.
                errorElement: <RouteError embedded />,
                children: [
                  { index: true, element: <HomePage /> },
                  { path: 'proyectos', element: <ProjectsPage /> },
                  { path: 'proyectos/:id', element: <ProjectPage /> },
                  { path: 'experiencia', element: <ExperiencePage /> },
                  { path: 'github', element: <GitHubPage /> },
                  { path: 'visitas', element: <VisitsPage /> },
                  { path: 'sobre-mi', element: <AboutPage /> },
                  { path: 'diario', element: <JournalPage /> },
                  { path: 'diario/:id', element: <EntryPage /> },
                  { path: 'contacto', element: <ContactPage /> },
                  { path: 'legal', element: <Navigate to="aviso-legal" replace /> },
                  { path: 'legal/:slug', element: <LegalPage /> },
                  { path: '*', element: <NotFoundPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
