import type { CSSProperties } from 'react';
import { Link } from '../components/Link';
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Download,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Printer,
} from 'lucide-react';
import { PageHeader, Tags } from '../components/Blocks';
import { usePortfolio } from '../data/PortfolioContext';
import { cvUrl, safeUrl, telUrl } from '../lib/api';
import { mobilityDetails, positionAnchor } from '../lib/portfolio';
import { useLanguage } from '../i18n/LanguageContext';
import { emphasis, paragraphs, useFormat } from '../lib/format';

const shortUrl = (url: string) => {
  const trimmed = url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '');
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
};

export default function ExperiencePage() {
  const data = usePortfolio();
  const p = data.profile;
  const { language, t } = useLanguage();
  const format = useFormat();
  const mobility = mobilityDetails(p, t);
  const github = safeUrl(p.github);
  const linkedin = safeUrl(p.linkedin);
  const projectsOf = (positionId: string) =>
    data.projects.filter((project) => project.experienceId === positionId);
  // Printed CV: personal projects (not tied to a position) and the address of this site.
  const ownProjects = data.projects.filter((project) => !project.experienceId);
  const siteHost = typeof window === 'undefined' ? '' : window.location.hostname;

  return (
    <>
      <PageHeader
        eyebrow={t.experience.eyebrow}
        title={emphasis(t.experience.title)}
        lead={p.intro}
      >
        <a className="button" href={cvUrl(language)} download type="application/pdf" hrefLang={language}>
          <Download size={17} aria-hidden="true" /> {t.experience.download}
        </a>
        <button type="button" className="button button-ghost" onClick={() => window.print()}>
          <Printer size={17} /> {t.experience.print}
        </button>
        <Link className="button button-ghost" to="/contacto">
          {t.experience.contact}
        </Link>
      </PageHeader>

      {/* Shown only when printing: a compact CV document with the same content as the page, plus the own projects. */}
      <div className="print-only cv-print">
        <header className="cv-print-header">
          <h1>{p.name}</h1>
          <p className="cv-print-role">{p.role}</p>
          <p>{[p.location, p.email, p.phone, p.availability].filter(Boolean).join(' · ')}</p>
          <p>
            {[siteHost, github && shortUrl(github), linkedin && shortUrl(linkedin)]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </header>

        <section>
          <h2>{t.experience.profile}</h2>
          {paragraphs(p.bio).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <section>
          <h2>{t.experience.positions}</h2>
          {data.experience.map((role) => (
            <article key={role.id} className="cv-print-item">
              <h3>
                {role.role} <span>— {role.company}</span>
              </h3>
              <p className="cv-print-meta">
                {[format.period(role.start, role.end), format.duration(role.start, role.end), role.location]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {role.summary && <p>{role.summary}</p>}
              {role.highlights.length > 0 && (
                <ul>
                  {role.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              )}
              {role.stack.length > 0 && (
                <p className="cv-print-stack">
                  <strong>{t.experience.stack}:</strong> {role.stack.join(' · ')}
                </p>
              )}
              {projectsOf(role.id).map((project) => (
                <p key={project.id} className="cv-print-stack">
                  <strong>{project.title}:</strong> {project.description}
                </p>
              ))}
            </article>
          ))}
        </section>

        {ownProjects.length > 0 && (
          <section>
            <h2>{t.experience.ownProjects}</h2>
            {ownProjects.map((project) => {
              const site = safeUrl(project.url) || (project.id === 'portfolio' ? siteHost : '');
              const links = [
                site && `${t.experience.website}: ${shortUrl(site)}`,
                ...project.links
                  .filter((link) => safeUrl(link.url))
                  .map((link) => `${link.label}: ${shortUrl(link.url)}`),
              ].filter(Boolean);
              return (
                <article key={project.id} className="cv-print-item cv-print-project">
                  <h3>
                    {project.title}{' '}
                    <span>— {[project.year, project.status].filter(Boolean).join(' · ')}</span>
                  </h3>
                  <p>{project.description}</p>
                  {project.highlights.length > 0 && (
                    <ul>
                      {project.highlights.slice(0, 4).map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                  {project.tags.length > 0 && (
                    <p className="cv-print-stack">
                      <strong>{t.experience.stack}:</strong> {project.tags.join(' · ')}
                    </p>
                  )}
                  {links.length > 0 && <p className="cv-print-stack">{links.join(' · ')}</p>}
                </article>
              );
            })}
          </section>
        )}

        <section>
          <h2>{t.experience.skills}</h2>
          {data.skills.map((skill) => (
            <p key={skill.id} className="cv-print-skill">
              <strong>{skill.title}:</strong> {skill.tags.join(' · ')}
            </p>
          ))}
        </section>

        {data.education.length > 0 && (
          <section>
            <h2>{t.experience.education}</h2>
            {data.education.map((item) => (
              <p key={item.id}>
                <strong>{item.title}</strong>
                {' — '}
                {[
                  item.center,
                  item.location,
                  [format.month(item.start), format.month(item.end)].filter(Boolean).join(' — '),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            ))}
          </section>
        )}

        <section>
          <h2>{t.experience.languagesOther}</h2>
          {p.languages && <p>{p.languages}</p>}
          {mobility.length > 0 && <p>{mobility.join(' · ')}</p>}
          {p.personal && <p>{p.personal}</p>}
        </section>
      </div>

      <div className="shell cv-layout">
        <aside className="cv-aside">
          <dl className="cv-facts">
            {p.location && (
              <div>
                <dt>
                  <MapPin size={15} /> {t.experience.location}
                </dt>
                <dd>{p.location}</dd>
              </div>
            )}
            {p.availability && (
              <div>
                <dt>{t.experience.availability}</dt>
                <dd>{p.availability}</dd>
              </div>
            )}
            {p.languages && (
              <div>
                <dt>{t.experience.languages}</dt>
                <dd>{p.languages}</dd>
              </div>
            )}
            {mobility.length > 0 && (
              <div>
                <dt>{t.experience.mobility}</dt>
                <dd>{mobility.join(' · ')}</dd>
              </div>
            )}
            {p.email && (
              <div>
                <dt>
                  <Mail size={15} /> {t.experience.email}
                </dt>
                <dd>
                  <a className="inline-link" href={`mailto:${p.email}`}>
                    {p.email.split('@')[0]}
                    <wbr />@{p.email.split('@')[1]}
                  </a>
                </dd>
              </div>
            )}
            {telUrl(p.phone) && (
              <div>
                <dt>
                  <Phone size={15} /> {t.experience.phone}
                </dt>
                <dd>
                  <a className="inline-link" href={telUrl(p.phone)}>
                    {p.phone}
                  </a>
                </dd>
              </div>
            )}
          </dl>
          <div className="cv-aside-links">
            {github && (
              <a className="arrow-link" href={github} target="_blank" rel="noreferrer">
                GitHub <ArrowUpRight size={15} />
              </a>
            )}
            {linkedin && (
              <a className="arrow-link" href={linkedin} target="_blank" rel="noreferrer">
                LinkedIn <ArrowUpRight size={15} />
              </a>
            )}
          </div>
        </aside>

        <div className="cv-main">
          <section aria-labelledby="cv-profile" className="cv-section">
            <h2 id="cv-profile" className="cv-heading">
              {t.experience.profile}
            </h2>
            <div className="prose">
              {paragraphs(p.bio).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section aria-labelledby="cv-experience" className="cv-section">
            <h2 id="cv-experience" className="cv-heading">
              <Briefcase size={18} aria-hidden="true" /> {t.experience.positions}
            </h2>
            <ol className="timeline">
              {data.experience.map((role) => {
                const company = safeUrl(role.companyUrl);
                return (
                  <li
                    key={role.id}
                    id={positionAnchor(role.id)}
                    className="timeline-item"
                    data-reveal
                  >
                    <div className="timeline-when">
                      <span>{format.period(role.start, role.end)}</span>
                      <small>{format.duration(role.start, role.end)}</small>
                    </div>
                    <div className="timeline-what">
                      <h3>{role.role}</h3>
                      <p className="timeline-company">
                        {company ? (
                          <a href={company} target="_blank" rel="noreferrer">
                            {role.company}
                          </a>
                        ) : (
                          role.company
                        )}
                        {role.location && <span> · {role.location}</span>}
                      </p>
                      {role.summary && <p className="timeline-summary">{role.summary}</p>}
                      {role.highlights.length > 0 && (
                        <ul className="timeline-highlights">
                          {role.highlights.map((highlight) => (
                            <li key={highlight}>{highlight}</li>
                          ))}
                        </ul>
                      )}
                      <Tags items={role.stack} />
                      {projectsOf(role.id).length > 0 && (
                        <div className="timeline-projects">
                          <p className="fact-label">{t.experience.stageProjects}</p>
                          <ul>
                            {projectsOf(role.id).map((project) => (
                              <li key={project.id}>
                                <Link to={`/proyectos/${encodeURIComponent(project.id)}`}>
                                  <span>{project.title}</span>
                                  <small>{project.description}</small>
                                  <ArrowRight size={16} aria-hidden="true" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section aria-labelledby="cv-skills" className="cv-section">
            <h2 id="cv-skills" className="cv-heading">
              {t.experience.skills}
            </h2>
            <div className="skill-grid">
              {data.skills.map((skill, index) => (
                <article key={skill.id} data-reveal style={{ '--i': index % 2 } as CSSProperties}>
                  <h3>{skill.title}</h3>
                  {skill.description && <p>{skill.description}</p>}
                  <Tags items={skill.tags} />
                </article>
              ))}
            </div>
          </section>

          {data.education.length > 0 && (
            <section aria-labelledby="cv-education" className="cv-section">
              <h2 id="cv-education" className="cv-heading">
                <GraduationCap size={18} aria-hidden="true" /> {t.experience.education}
              </h2>
              <ul className="education-list">
                {data.education.map((item) => (
                  <li key={item.id}>
                    <span className="role-period">
                      {[format.month(item.start), format.month(item.end)]
                        .filter(Boolean)
                        .join(' — ')}
                    </span>
                    <strong>{item.title}</strong>
                    <span>{[item.center, item.location].filter(Boolean).join(' · ')}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {p.personal && (
            <section aria-labelledby="cv-other" className="cv-section">
              <h2 id="cv-other" className="cv-heading">
                {t.experience.other}
              </h2>
              <p className="muted">{p.personal}</p>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
