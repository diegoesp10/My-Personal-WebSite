import { Suspense, useEffect, useRef } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { usePortfolioState } from '../data/PortfolioContext';
import { useReveal } from '../lib/useReveal';
import { usePageMetadata } from '../lib/seo';
import { sendVisit } from '../data/visits';
import { BrandMark } from './Brand';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout() {
  const { data, error, reload, canEdit } = usePortfolioState();
  const { pathname } = useLocation();
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

  if (error)
    return (
      <div className="status-screen">
        <BrandMark />
        <h1>No he podido cargar la web.</h1>
        <p>{error}</p>
        <button type="button" className="button" onClick={reload}>
          Reintentar
        </button>
      </div>
    );
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
    </>
  );
}
