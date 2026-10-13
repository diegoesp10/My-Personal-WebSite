import { useState, type CSSProperties } from 'react';
import { PageHeader } from '../components/Blocks';
import { Globe, regionName, type GlobeFocus, type GlobePlace } from '../components/Globe';
import { navigation } from '../components/Header';
import { usePortfolio } from '../data/PortfolioContext';
import { useVisitors } from '../data/visits';
import { formatDate, timeAgo } from '../lib/format';
import type { Portfolio, VisitLocation } from '../lib/types';

// Where the arcs end: the base shown in the profile.
const home: GlobePlace = { latitude: 43.36, longitude: -5.85, label: 'Oviedo' };
const number = (value: number) => value.toLocaleString('es-ES');

/** Friendly name for a visited path: /proyectos/murmur → the project title. */
function pageLabel(path: string, data: Portfolio) {
  if (path === '/') return 'Inicio';
  const section = navigation.find(([to]) => to === path);
  if (section) return section[1];
  if (path === '/contacto') return 'Contacto';
  const [, kind, id] = path.split('/');
  if (kind === 'proyectos')
    return data.projects.find((project) => project.id === id)?.title ?? path;
  if (kind === 'diario') return data.entries.find((entry) => entry.id === id)?.title ?? path;
  return path;
}

export default function VisitsPage() {
  const data = usePortfolio();
  const { summary, failed } = useVisitors();
  const [focus, setFocus] = useState<GlobeFocus>();
  const places = summary?.locations ?? [];
  const days = summary?.days ?? [];
  const busiest = Math.max(1, ...days.map((day) => day.visitors));
  const topCountry = summary?.countries[0]?.count ?? 1;

  const show = (place?: VisitLocation) => {
    if (place?.latitude == null || place.longitude == null) return;
    setFocus({ latitude: place.latitude, longitude: place.longitude, key: Date.now() });
    document.querySelector('.observatory')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const placeOf = (country: string, city?: string) =>
    places.find(
      (place) => place.country === country && (city === undefined || place.city === city),
    );

  return (
    <>
      <PageHeader
        eyebrow="Visitas · en directo"
        title={
          <>
            Quién pasa <em className="accent-serif">por aquí</em>
          </>
        }
        lead="Cada punto naranja es una ciudad desde la que alguien ha abierto esta web, unida con Oviedo. Sin cookies y sin guardar direcciones IP: solo la ciudad aproximada y recuentos."
      />

      <section className="shell section-tight">
        {failed && !summary && (
          <div className="notice">
            <p>
              No he podido cargar las estadísticas ahora mismo. Vuelve a intentarlo en un momento.
            </p>
          </div>
        )}
        {summary && !summary.enabled && (
          <div className="notice">
            <p>Las estadísticas de visitas están desactivadas.</p>
          </div>
        )}

        <div className="observatory">
          <div className="observatory-globe">
            <Globe
              places={places}
              home={home}
              focus={focus}
              label={`Globo con ${places.length} ciudades desde las que se ha visitado la web`}
            />
            <p className="observatory-hint">
              Arrastra para girar
              <span className="hint-pointer"> · pasa por encima de un punto</span>
            </p>
          </div>
          <div className="observatory-panel">
            <p className="live-pill">
              <span className="pulse" aria-hidden="true" />
              {summary
                ? `${number(summary.online)} ${summary.online === 1 ? 'persona' : 'personas'} ahora mismo`
                : 'Conectando…'}
            </p>
            <dl className="observatory-stats">
              <div>
                <dt>Visitas</dt>
                <dd>{summary ? number(summary.visits) : '—'}</dd>
              </div>
              <div>
                <dt>Visitantes</dt>
                <dd>{summary ? number(summary.visitors) : '—'}</dd>
              </div>
              <div>
                <dt>Países</dt>
                <dd>{summary ? number(summary.countries.length) : '—'}</dd>
              </div>
              <div>
                <dt>Hoy</dt>
                <dd>{summary?.today ? number(summary.today.visitors) : '—'}</dd>
              </div>
            </dl>
            <div
              className="spark"
              role="img"
              aria-label="Visitantes por día en los últimos 30 días"
            >
              {days.map((day, index) => (
                <span
                  key={day.date}
                  title={`${formatDate(day.date)}: ${day.visitors} ${day.visitors === 1 ? 'visitante' : 'visitantes'}`}
                  style={
                    { '--h': `${(day.visitors / busiest) * 100}%`, '--i': index } as CSSProperties
                  }
                />
              ))}
            </div>
            <p className="spark-caption">
              <span>Últimos 30 días</span>
              {summary?.since && <span>desde {formatDate(summary.since)}</span>}
            </p>
          </div>
        </div>

        <div className="visits-grid">
          <section aria-labelledby="visits-countries" data-reveal>
            <h2 className="mini-title" id="visits-countries">
              Países
            </h2>
            {summary?.countries.length ? (
              <ol className="rank-list">
                {summary.countries.slice(0, 10).map((country) => (
                  <li key={country.name}>
                    <button type="button" onClick={() => show(placeOf(country.name))}>
                      <span className="country-code">{country.name}</span>
                      <span className="rank-name">{regionName(country.name)}</span>
                      <span className="rank-bar" aria-hidden="true">
                        <i style={{ width: `${(country.count / topCountry) * 100}%` }} />
                      </span>
                      <span className="rank-count">{number(country.count)}</span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted">Aún no hay visitas con ubicación.</p>
            )}
          </section>

          <section
            aria-labelledby="visits-recent"
            data-reveal
            style={{ '--i': 1 } as CSSProperties}
          >
            <h2 className="mini-title" id="visits-recent">
              Últimas visitas
            </h2>
            {summary?.recent.length ? (
              <ol className="recent-list">
                {summary.recent.map((visit) => (
                  <li key={visit.at + visit.path}>
                    <button
                      type="button"
                      onClick={() => show(placeOf(visit.country, visit.city))}
                      disabled={!visit.country}
                    >
                      <span className="country-code">{visit.country || '··'}</span>
                      <span className="recent-place">
                        <strong>
                          {visit.city ||
                            (visit.country ? regionName(visit.country) : 'Ubicación desconocida')}
                        </strong>
                        <span>{pageLabel(visit.path, data)}</span>
                      </span>
                      <time dateTime={visit.at}>{timeAgo(visit.at)}</time>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted">Todavía no hay visitas registradas.</p>
            )}
          </section>

          <section aria-labelledby="visits-pages" data-reveal style={{ '--i': 2 } as CSSProperties}>
            <h2 className="mini-title" id="visits-pages">
              Lo más visto
            </h2>
            <ol className="plain-rank">
              {(summary?.pages ?? []).map((page) => (
                <li key={page.name}>
                  <span>{pageLabel(page.name, data)}</span>
                  <b>{number(page.count)}</b>
                </li>
              ))}
            </ol>
            <h2 className="mini-title spaced">Llegan desde</h2>
            {summary?.referrers.length ? (
              <ol className="plain-rank">
                {summary.referrers.map((referrer) => (
                  <li key={referrer.name}>
                    <span>{referrer.name}</span>
                    <b>{number(referrer.count)}</b>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted">Por ahora, entradas directas.</p>
            )}
          </section>
        </div>

        <p className="footnote">
          Ubicación aproximada a nivel de ciudad, obtenida al recibir la visita (Cloudflare o{' '}
          <a className="inline-link" href="https://db-ip.com" target="_blank" rel="noreferrer">
            IP Geolocation by DB-IP
          </a>
          , CC BY 4.0). No se guardan direcciones IP ni se usan cookies; un visitante cuenta una vez
          al día y quien activa «No rastrear» no se cuenta. Se actualiza cada 30 segundos.
        </p>
      </section>
    </>
  );
}
