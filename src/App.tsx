import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { Layout } from './components/Layout';
import { PortfolioProvider } from './data/PortfolioContext';
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

// Data router: required for view transitions between pages.
// Public routes are also listed in the API sitemap (Portfolio.Application/Sitemaps/SitemapService.cs).
const router = createBrowserRouter([
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
          { path: 'legal', element: <Navigate to="/legal/aviso-legal" replace /> },
          { path: 'legal/:slug', element: <LegalPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
  // Outside the layout: it must work when the content cannot load.
  { path: 'error', element: <ErrorPage /> },
  {
    path: 'editor',
    element: (
      <Suspense fallback={<div className="status-screen" aria-busy="true" />}>
        <EditorPage />
      </Suspense>
    ),
  },
]);

export default function App() {
  return (
    <PortfolioProvider>
      <RouterProvider router={router} />
    </PortfolioProvider>
  );
}
