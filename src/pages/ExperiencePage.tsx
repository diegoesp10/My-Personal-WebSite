import type { CSSProperties } from 'react';
import { Link } from '../components/Link';
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Printer,
} from 'lucide-react';
import { PageHeader, Tags } from '../components/Blocks';
import { usePortfolio } from '../data/PortfolioContext';
import { safeUrl, telUrl } from '../lib/api';
import { mobilityDetails, positionAnchor } from '../lib/portfolio';
import { formatDuration, formatMonth, formatPeriod, paragraphs } from '../lib/format';

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
  const mobility = mobilityDetails(p);
  const github = safeUrl(p.github);
  const linkedin = safeUrl(p.linkedin);
  const projectsOf = (positionId: string) =>
    data.projects.filter((project) => project.experienceId === positionId);

  return (
    <>
      <PageHeader
        eyebrow="Trayectoria · CV online"
        title={
          <>
            Experiencia <em className="accent-serif">y CV</em>
          </>
        }
        lead={p.intro}
      >
        <button type="button" className="button" onClick={() => window.print()}>
          <Printer size={17} /> Imprimir o guardar en PDF
        </button>
        <Link className="button button-ghost" to="/contacto">
          Contactar
        </Link>
      </PageHeader>

      {/* Shown only when printing: the page becomes a one-column CV. */}
      <div className="print-only cv-print-header">
        <h1>{p.name}</h1>
        <p>{p.role}</p>
        <p>
          {[
            p.location,
            p.email,
            p.phone,
            ...mobility,
            github && shortUrl(github),
            linkedin && shortUrl(linkedin),
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      <div className="shell cv-layout">
        <aside className="cv-aside">
          <dl className="cv-facts">
            {p.location && (
              <div>
                <dt>
                  <MapPin size={15} /> Ubicación
                </dt>
                <dd>{p.location}</dd>
              </div>
            )}
            {p.availability && (
              <div>
                <dt>Modalidad</dt>
                <dd>{p.availability}</dd>
              </div>
            )}
            {p.languages && (
              <div>
                <dt>Idiomas</dt>
                <dd>{p.languages}</dd>
              </div>
            )}
            {mobility.length > 0 && (
              <div>
                <dt>Movilidad</dt>
                <dd>{mobility.join(' · ')}</dd>
              </div>
            )}
            {p.email && (
              <div>
                <dt>
                  <Mail size={15} /> Correo
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
                  <Phone size={15} /> Teléfono
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
              Perfil
            </h2>
            <div className="prose">
              {paragraphs(p.bio).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section aria-labelledby="cv-experience" className="cv-section">
            <h2 id="cv-experience" className="cv-heading">
              <Briefcase size={18} aria-hidden="true" /> Experiencia profesional
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
                      <span>{formatPeriod(role.start, role.end)}</span>
                      <small>{formatDuration(role.start, role.end)}</small>
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
                          <p className="fact-label">Proyectos de esta etapa</p>
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
              Competencias técnicas
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
                <GraduationCap size={18} aria-hidden="true" /> Formación
              </h2>
              <ul className="education-list">
                {data.education.map((item) => (
                  <li key={item.id}>
                    <span className="role-period">
                      {[formatMonth(item.start), formatMonth(item.end)].filter(Boolean).join(' — ')}
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
                Otros
              </h2>
              <p className="muted">{p.personal}</p>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
