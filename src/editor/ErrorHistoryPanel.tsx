import { useCallback, useEffect, useState } from 'react';
import { ApiError, request } from '../lib/api';
import type { ApiLanguage, ErrorHistory } from '../lib/types';

export function ErrorHistoryPanel() {
  const [language, setLanguage] = useState<ApiLanguage>('es');
  const [history, setHistory] = useState<ErrorHistory>();
  const [failure, setFailure] = useState('');
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const format = useCallback(
    (date: string) =>
      new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'es', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(new Date(date)),
    [language],
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setFailure('');
    request<ErrorHistory>(
      '/api/editor/errors?limit=50',
      {
        headers: { 'X-Portfolio-Editor': 'local' },
        signal: controller.signal,
      },
      language,
    )
      .then(setHistory)
      .catch((error: Error) => {
        if (!controller.signal.aborted)
          setFailure(
            error.message +
              (error instanceof ApiError && error.traceId ? ` · ${error.traceId}` : ''),
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [language, refresh]);

  return (
    <section
      className="editor-card error-history"
      aria-labelledby="error-history-title"
      aria-busy={loading}
    >
      <h2 id="error-history-title">Historial de errores</h2>
      <p className="muted">
        Últimos 50 registros de esta API. Conservación: hasta 1.000 registros y 14 días con la
        configuración predeterminada. Consulta disponible solo en el editor local.
      </p>
      <div className="error-history-controls">
        <label className="form-field">
          <span>Idioma de los mensajes</span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as ApiLanguage)}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </label>
        <button
          type="button"
          className="button button-ghost"
          onClick={() => setRefresh((value) => value + 1)}
          disabled={loading}
        >
          Actualizar
        </button>
      </div>
      {failure && (
        <p role="alert" className="message is-error">
          {failure}
        </p>
      )}
      {!failure && !loading && history?.entries.length === 0 && (
        <p role="status">No hay errores registrados.</p>
      )}
      {loading && <p role="status">Consultando registros…</p>}
      {!failure &&
        !loading &&
        history?.entries.map((entry) => (
          <article key={entry.id} className="error-history-entry">
            <div className="error-history-summary">
              <strong>{entry.code}</strong>
              <span>{entry.status === null ? 'Registro interno' : `HTTP ${entry.status}`}</span>
            </div>
            <p>{entry.message}</p>
            <dl>
              <div>
                <dt>Fecha</dt>
                <dd>{format(entry.occurredAt)}</dd>
              </div>
              <div>
                <dt>{entry.status === null ? 'Componente' : 'Endpoint'}</dt>
                <dd>
                  <code>
                    {entry.status === null ? entry.endpoint : `${entry.method} /${entry.endpoint}`}
                  </code>
                </dd>
              </div>
              <div>
                <dt>Correlación</dt>
                <dd>
                  <code>{entry.traceId}</code>
                </dd>
              </div>
              {entry.exceptionType && (
                <div>
                  <dt>Tipo técnico</dt>
                  <dd>
                    <code>{entry.exceptionType}</code>
                  </dd>
                </div>
              )}
            </dl>
          </article>
        ))}
    </section>
  );
}
