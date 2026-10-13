import { useState, type CSSProperties } from 'react';
import { PageHeader } from '../components/Blocks';
import { Globe, regionName, type GlobeFocus, type GlobePlace } from '../components/Globe';
import { navigation } from '../components/Header';
import { usePortfolio } from '../data/PortfolioContext';
import { useVisitors } from '../data/visits';
import { useLanguage } from '../i18n/LanguageContext';
import type { Messages } from '../i18n/es';
import { emphasis, useFormat } from '../lib/format';
import type { Portfolio, VisitLocation } from '../lib/types';

// Where the arcs end: the base shown in the profile.
const home: GlobePlace = { latitude: 43.36, longitude: -5.85, label: 'Oviedo' };

/**
 * Friendly name for a visited path: /proyectos/murmur → the project title. Paths arrive without a language prefix,
 * so both versions of a page count together.
 */
function pageLabel(path: string, data: Portfolio, t: Messages) {
  if (path === '/') return t.nav.home;
  const section = navigation.find(([to]) => to === path);
  if (section) return t.nav[section[1]];
  if (path === '/contacto') return t.nav.contacto;
  const [, kind, id] = path.split('/');
  if (kind === 'proyectos')
    return data.projects.find((project) => project.id === id)?.title ?? path;
  if (kind === 'diario') return data.entries.find((entry) => entry.id === id)?.title ?? path;
  return path;
}

export default function VisitsPage() {
  const data = usePortfolio();
  const { summary, failed } = useVisitors();
  const { language, t } = useLanguage();
  const format = useFormat();
  const number = format.number;
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
        eyebrow={t.visits.eyebrow}
        title={emphasis(t.visits.title)}
        lead={t.visits.lead}
      />

      <section className="shell section-tight">
        {failed && !summary && (
          <div className="notice">
            <p>{t.visits.failed}</p>
          </div>
        )}
        {summary && !summary.enabled && (
          <div className="notice">
            <p>{t.visits.disabled}</p>
          </div>
        )}

        <div className="observatory">
          <div className="observatory-globe">
            <Globe
              places={places}
              home={home}
              focus={focus}
              label={t.visits.globe(places.length)}
            />
            <p className="observatory-hint">
              {t.visits.drag}
              <span className="hint-pointer">{t.visits.hover}</span>
            </p>
          </div>
          <div className="observatory-panel">
            <p className="live-pill">
              <span className="pulse" aria-hidden="true" />
              {summary
                ? t.visits.online(number(summary.online), summary.online)
                : t.visits.connecting}
            </p>
            <dl className="observatory-stats">
              <div>
                <dt>{t.visits.visits}</dt>
                <dd>{summary ? number(summary.visits) : '—'}</dd>
              </div>
              <div>
                <dt>{t.visits.visitors}</dt>
                <dd>{summary ? number(summary.visitors) : '—'}</dd>
              </div>
              <div>
                <dt>{t.visits.countries}</dt>
                <dd>{summary ? number(summary.countries.length) : '—'}</dd>
              </div>
              <div>
                <dt>{t.visits.today}</dt>
                <dd>{summary?.today ? number(summary.today.visitors) : '—'}</dd>
              </div>
            </dl>
            <div className="spark" role="img" aria-label={t.visits.spark}>
              {days.map((day, index) => (
                <span
                  key={day.date}
                  title={`${format.date(day.date)}: ${t.visits.visitorCount(day.visitors)}`}
                  style={
                    { '--h': `${(day.visitors / busiest) * 100}%`, '--i': index } as CSSProperties
                  }
                />
              ))}
            </div>
            <p className="spark-caption">
              <span>{t.visits.lastDays}</span>
              {summary?.since && <span>{t.visits.since(format.date(summary.since))}</span>}
            </p>
          </div>
        </div>

        <div className="visits-grid">
          <section aria-labelledby="visits-countries" data-reveal>
            <h2 className="mini-title" id="visits-countries">
              {t.visits.countries}
            </h2>
            {summary?.countries.length ? (
              <ol className="rank-list">
                {summary.countries.slice(0, 10).map((country) => (
                  <li key={country.name}>
                    <button type="button" onClick={() => show(placeOf(country.name))}>
                      <span className="country-code">{country.name}</span>
                      <span className="rank-name">{regionName(country.name, language)}</span>
                      <span className="rank-bar" aria-hidden="true">
                        <i style={{ width: `${(country.count / topCountry) * 100}%` }} />
                      </span>
                      <span className="rank-count">{number(country.count)}</span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted">{t.visits.noCountries}</p>
            )}
          </section>

          <section
            aria-labelledby="visits-recent"
            data-reveal
            style={{ '--i': 1 } as CSSProperties}
          >
            <h2 className="mini-title" id="visits-recent">
              {t.visits.recent}
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
                            (visit.country
                              ? regionName(visit.country, language)
                              : t.visits.unknown)}
                        </strong>
                        <span>{pageLabel(visit.path, data, t)}</span>
                      </span>
                      <time dateTime={visit.at}>{format.timeAgo(visit.at)}</time>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted">{t.visits.noRecent}</p>
            )}
          </section>

          <section aria-labelledby="visits-pages" data-reveal style={{ '--i': 2 } as CSSProperties}>
            <h2 className="mini-title" id="visits-pages">
              {t.visits.top}
            </h2>
            <ol className="plain-rank">
              {(summary?.pages ?? []).map((page) => (
                <li key={page.name}>
                  <span>{pageLabel(page.name, data, t)}</span>
                  <b>{number(page.count)}</b>
                </li>
              ))}
            </ol>
            <h2 className="mini-title spaced">{t.visits.referrers}</h2>
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
              <p className="muted">{t.visits.direct}</p>
            )}
          </section>
        </div>

        <p className="footnote">
          {t.visits.noteBefore}{' '}
          <a className="inline-link" href="https://db-ip.com" target="_blank" rel="noreferrer">
            IP Geolocation by DB-IP
          </a>
          {t.visits.noteAfter}
        </p>
      </section>
    </>
  );
}
