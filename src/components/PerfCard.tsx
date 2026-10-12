/** Hero visual: the data-access redesign summarised in the CV (endpoints from more than 30 s to under 1 s). */
export function PerfCard() {
  return (
    <figure className="perf-card">
      <div className="perf-top" aria-hidden="true">
        <span className="perf-dots">
          <i />
          <i />
          <i />
        </span>
        <span>acceso-a-datos.trace</span>
      </div>
      <div className="perf-body">
        <p className="perf-request" aria-hidden="true">
          <span>GET</span> /api/{'{recurso}'}?page=1
        </p>
        <div className="perf-row is-before">
          <span className="perf-label">Antes</span>
          <span className="perf-bar" aria-hidden="true">
            <i />
          </span>
          <span className="perf-value">&gt; 30 s</span>
        </div>
        <div className="perf-row is-after">
          <span className="perf-label">Después</span>
          <span className="perf-bar" aria-hidden="true">
            <i />
          </span>
          <span className="perf-value">&lt; 1 s</span>
        </div>
        <ul className="perf-steps">
          <li>consultas asíncronas</li>
          <li>proyecciones a DTO</li>
          <li>paginación</li>
          <li>sin N+1</li>
        </ul>
      </div>
      <figcaption>Rediseño de la capa de acceso a datos · caso real</figcaption>
    </figure>
  );
}
