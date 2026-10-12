import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { PortfolioProvider } from './data/PortfolioContext';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import EntryPage from './pages/EntryPage';
import ExperiencePage from './pages/ExperiencePage';
import HomePage from './pages/HomePage';
import JournalPage from './pages/JournalPage';
import NotFoundPage from './pages/NotFoundPage';
import ProjectPage from './pages/ProjectPage';
import ProjectsPage from './pages/ProjectsPage';

// Rarely visited: loaded on demand.
const GitHubPage = lazy(() => import('./pages/GitHubPage'));
const EditorPage = lazy(() => import('./editor/EditorPage'));

// Public routes are also listed in the API sitemap (Portfolio.Application/Sitemaps/SitemapService.cs).
export default function App() {
  return (
    <BrowserRouter>
      <PortfolioProvider>
        <Suspense fallback={<div className="status-screen" aria-busy="true" />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="proyectos" element={<ProjectsPage />} />
              <Route path="proyectos/:id" element={<ProjectPage />} />
              <Route path="experiencia" element={<ExperiencePage />} />
              <Route path="github" element={<GitHubPage />} />
              <Route path="sobre-mi" element={<AboutPage />} />
              <Route path="diario" element={<JournalPage />} />
              <Route path="diario/:id" element={<EntryPage />} />
              <Route path="contacto" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="editor" element={<EditorPage />} />
          </Routes>
        </Suspense>
      </PortfolioProvider>
    </BrowserRouter>
  );
}
