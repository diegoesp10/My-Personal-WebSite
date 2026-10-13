import { ApiError } from './api';

/**
 * What the error page shows for an error code: codes of the API catalog (Portfolio.Errors/Catalog/ErrorCatalog.cs)
 * plus the frontend's own (route.not_found, network, app.crash).
 */
export type ErrorCopy = {
  /** Large label: the HTTP status or a short word. */
  label: string;
  title: string;
  text: string;
  /** Whether trying again can fix it (the page offers "Reintentar"). */
  retry: boolean;
};

const copies: Record<string, ErrorCopy> = {
  'route.not_found': {
    label: '404',
    title: 'Esta página no existe.',
    text: 'Puede que el enlace haya cambiado o que la dirección tenga una errata. Desde el inicio llegas a todo lo demás.',
    retry: false,
  },
  'request.not_found': {
    label: '404',
    title: 'No encuentro lo que buscas.',
    text: 'El contenido que pedía la página ya no está disponible.',
    retry: false,
  },
  network: {
    label: 'Offline',
    title: 'No hay conexión con el servidor.',
    text: 'Comprueba tu conexión a internet. En cuanto vuelva, reintenta y la web cargará donde lo dejaste.',
    retry: true,
  },
  'server.unavailable': {
    label: '503',
    title: 'El servidor está tomando aire.',
    text: 'La API no responde ahora mismo. Suele resolverse en unos segundos: reintenta en un momento.',
    retry: true,
  },
  'server.unexpected': {
    label: '500',
    title: 'Algo ha fallado de mi lado.',
    text: 'El error ha quedado registrado con su referencia para revisarlo. Puedes reintentarlo o volver al inicio.',
    retry: true,
  },
  'request.rate_limit': {
    label: '429',
    title: 'Demasiadas peticiones seguidas.',
    text: 'Para proteger el servidor hay un límite de peticiones por minuto. Espera un momento y reintenta.',
    retry: true,
  },
  'app.crash': {
    label: 'Error',
    title: 'La página se ha detenido inesperadamente.',
    text: 'Ha ocurrido un fallo al mostrar esta página. Recargarla suele bastar; si se repite, avísame con la referencia.',
    retry: true,
  },
};

const fallback: ErrorCopy = {
  label: 'Error',
  title: 'No se ha podido completar la petición.',
  text: 'Ha ocurrido un error inesperado. Puedes reintentarlo o volver al inicio.',
  retry: true,
};

export const errorCopy = (code: string | null | undefined): ErrorCopy =>
  (code && copies[code]) || fallback;

/** Address of the error page for an error: /error?code=…&status=…&ref=… */
export function errorPath(error: unknown) {
  const query = new URLSearchParams();
  if (error instanceof ApiError) {
    query.set('code', error.code);
    if (error.status) query.set('status', String(error.status));
    if (error.traceId) query.set('ref', error.traceId);
  } else query.set('code', 'app.crash');
  return `/error?${query}`;
}
