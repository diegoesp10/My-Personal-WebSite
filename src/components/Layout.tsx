import { Suspense, useEffect, useRef } from 'react';
import { Navigate, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { usePortfolioState } from '../data/PortfolioContext';
import { useReveal } from '../lib/useReveal';
import { errorPath } from '../lib/errors';
import { usePageMetadata } from '../lib/seo';
import { sendVisit } from '../data/visits';
import { BrandMark } from './Brand';
import { CookieConsent } from '../consent/CookieConsent';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout() {
  const { data, error, canEdit } = usePortfolioState();
  const { pathname, search } = useLocation();
  const main = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  useReveal(main, `${pathname}:${data ? 'ready' : 'loading'}`);

  useEffect(() => sendVisit(pathname), [pathname]);
  usePageMetadata(pathname);

  // New page: move focus to the content, as a full page load would. ScrollRestoration handles scrolling.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    document.documentElement.classList.remove('first-visit');
    main.current?.focus({ preventScroll: true });
  }, [pathname]);

  // Without content no page can be shown: go to the error page, which can retry and come back here.
  if (error) return <Navigate to={errorPath(error)} replace state={{ from: pathname + search }} />;
  if (!data)
    return (
      <div className="status-screen" aria-busy="true">
        <BrandMark />
        <p>Cargando…</p>
      </div>
    );

  return (
    <>
      <ScrollRestoration />
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      <Header profile={data.profile} />
      <main id="contenido" ref={main} tabIndex={-1} className="page" key={pathname}>
        <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer data={data} canEdit={canEdit === true} />
      <CookieConsent />
    </>
  );
}
