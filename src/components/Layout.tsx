import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { CookieConsent } from '../consent/CookieConsent';
import { usePortfolioState } from '../data/PortfolioContext';
import { sendVisit } from '../data/visits';
import { errorPath } from '../lib/errors';
import { usePageMetadata } from '../lib/seo';
import { useReveal } from '../lib/useReveal';
import { shouldPlayIntro } from '../motion/intro';
import { syncScrollAfterNavigation, useSmoothScroll } from '../motion/useSmoothScroll';
import { useTextReveal } from '../motion/useTextReveal';
import { BrandMark } from './Brand';
import { Footer } from './Footer';
import { Header } from './Header';
import { Preloader } from './Preloader';

export function Layout() {
  const { data, error, canEdit } = usePortfolioState();
  const { pathname, search } = useLocation();
  const main = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  const [intro, setIntro] = useState(shouldPlayIntro);
  const finishIntro = useCallback(() => setIntro(false), []);
  const pageKey = `${pathname}:${data ? 'ready' : 'loading'}`;
  useReveal(main, pageKey);
  useTextReveal(main, pageKey);
  useSmoothScroll();

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
    syncScrollAfterNavigation();
  }, [pathname]);

  // Without content no page can be shown: go to the error page, which can retry and come back here.
  if (error) return <Navigate to={errorPath(error)} replace state={{ from: pathname + search }} />;

  return (
    <>
      {/* Same position in both states, so the intro keeps running when the content arrives. */}
      {intro && <Preloader ready={Boolean(data)} onDone={finishIntro} />}
      {!data ? (
        !intro && (
          <div className="status-screen" aria-busy="true">
            <BrandMark />
            <p>Cargando…</p>
          </div>
        )
      ) : (
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
      )}
    </>
  );
}
