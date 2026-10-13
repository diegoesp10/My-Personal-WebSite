import { useLanguage } from '../i18n/LanguageContext';

/** Hero visual: the data-access redesign summarised in the CV (endpoints from more than 30 s to under 1 s). */
export function PerfCard() {
  const { t } = useLanguage();
  return (
    <figure className="perf-card">
      <div className="perf-top" aria-hidden="true">
        <span className="perf-dots">
          <i />
          <i />
          <i />
        </span>
        <span>{t.perf.file}</span>
      </div>
      <div className="perf-body">
        <p className="perf-request" aria-hidden="true">
          <span>GET</span> /api/{`{${t.perf.resource}}`}?page=1
        </p>
        <div className="perf-row is-before">
          <span className="perf-label">{t.perf.before}</span>
          <span className="perf-bar" aria-hidden="true">
            <i />
          </span>
          <span className="perf-value">&gt; 30 s</span>
        </div>
        <div className="perf-row is-after">
          <span className="perf-label">{t.perf.after}</span>
          <span className="perf-bar" aria-hidden="true">
            <i />
          </span>
          <span className="perf-value">&lt; 1 s</span>
        </div>
        <ul className="perf-steps">
          {t.perf.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>
      <figcaption>{t.perf.caption}</figcaption>
    </figure>
  );
}
