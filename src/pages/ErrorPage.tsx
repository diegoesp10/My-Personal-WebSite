import { useLocation, useNavigate, useRouteError, useSearchParams } from 'react-router';
import { ErrorScreen } from '../components/ErrorScreen';
import { usePortfolioState } from '../data/PortfolioContext';
import { useLanguage } from '../i18n/LanguageContext';
import { ApiError } from '../lib/api';

/**
 * /{language}/error?code=…&status=…&ref=… — where the site sends the visitor when a page cannot be shown (the content does
 * not load, the API fails). It lives outside the layout, so it works without the content. "Reintentar" loads the
 * content again and returns to the page the visitor was on.
 */
export default function ErrorPage() {
  const [query] = useSearchParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { reload } = usePortfolioState();
  const { path } = useLanguage();
  const from = (state as { from?: string } | null)?.from ?? path('/');
  const status = Number(query.get('status')) || undefined;

  return (
    <ErrorScreen
      code={query.get('code') || 'server.unexpected'}
      status={status}
      reference={query.get('ref') || undefined}
      onRetry={() => {
        reload();
        navigate(from, { replace: true });
      }}
    />
  );
}

/** Router error boundary: a page that throws while rendering shows the error page in its place. */
export function RouteError({ embedded = false }: { embedded?: boolean }) {
  const error = useRouteError();
  console.error(error);
  return (
    <ErrorScreen
      code={error instanceof ApiError ? error.code : 'app.crash'}
      status={error instanceof ApiError ? error.status : undefined}
      reference={error instanceof ApiError ? error.traceId : undefined}
      embedded={embedded}
      onRetry={() => window.location.reload()}
    />
  );
}
