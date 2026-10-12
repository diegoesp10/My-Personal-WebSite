import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { usePortfolioState } from '../data/PortfolioContext';
import { BrandMark } from './Brand';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout() {
  const { data, error, reload, canEdit } = usePortfolioState();
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // New page: start at the top and move focus to the content, as a full page load would.
  useEffect(() => {
    window.scrollTo(0, 0);
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
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
