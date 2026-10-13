import { useParams } from 'react-router';
import { Link } from '../components/Link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, Check, Github, Globe } from 'lucide-react';
import { ContactBand, Tags } from '../components/Blocks';
import { ProjectVisual } from '../components/ProjectCard';
import { usePortfolio } from '../data/PortfolioContext';
import { isGitHubUrl, safeUrl } from '../lib/api';
import { formatPeriod, paragraphs } from '../lib/format';
import { companyName, positionAnchor, positionOf } from '../lib/portfolio';
import NotFoundPage from './NotFoundPage';

export default function ProjectPage() {
  const { id } = useParams();
  const data = usePortfolio();
  const index = data.projects.findIndex((project) => project.id === id);
  if (index < 0) return <NotFoundPage what="proyecto" />;

  const project = data.projects[index];
  const previous = data.projects[index - 1];
  const next = data.projects[index + 1];
  const site = safeUrl(project.url);
  const links = project.links.filter((link) => safeUrl(link.url));
  const position = positionOf(data, project);
  const facts: [string, string][] = [
    ['Empresa', position ? companyName(position.company) : ''],
    ['Categoría', project.category],
    ['Año', project.year],
    ['Estado', project.status],
  ];

  return (
    <>
      <article>
        <header className="shell project-header">
          <nav className="breadcrumb" aria-label="Ruta">
            <Link to="/proyectos">
              <ArrowLeft size={15} /> Proyectos
            </Link>
          </nav>
          <p className="eyebrow">
            {position && `Proyecto en ${companyName(position.company)} · `}
            {project.category}
            {project.status && ` · ${project.status}`}
          </p>
          <h1 className="page-title">{project.title}</h1>
          <p className="page-lead">{project.description}</p>
          {(site || links.length > 0) && (
            <div className="page-actions">
              {site && (
                <a className="button" href={site} target="_blank" rel="noreferrer">
                  <Globe size={17} /> Visitar la web <ArrowUpRight size={15} />
                </a>
              )}
              {links.map((link, i) => (
                <a
                  key={link.url}
                  className={`button ${site || i > 0 ? 'button-ghost' : ''}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {isGitHubUrl(link.url) && <Github size={17} />} {link.label}{' '}
                  <ArrowUpRight size={15} />
                </a>
              ))}
            </div>
          )}
        </header>

        <div className="shell project-hero">
          <ProjectVisual project={project} eager />
        </div>

        <div className="shell project-body">
          <div className="prose">
            {position && (
              <aside className="context-note">
                <Building2 size={18} aria-hidden="true" />
                <p>
                  Trabajo realizado en <strong>{position.company}</strong> como {position.role} (
                  {formatPeriod(position.start, position.end)}). El producto y el código pertenecen
                  a la empresa y a sus clientes; aquí describo mi papel.{' '}
                  <Link className="inline-link" to={`/experiencia#${positionAnchor(position.id)}`}>
                    Ver esa etapa en mi experiencia
                  </Link>
                </p>
              </aside>
            )}
            <h2 className="mini-title">Sobre el proyecto</h2>
            {paragraphs(project.details).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {project.sections?.map((section, index) => (
              <section
                className="project-case-section"
                key={`${index}-${section.title}`}
                aria-labelledby={`case-section-${index}`}
              >
                <h2 id={`case-section-${index}`}>{section.title}</h2>
                {paragraphs(section.text).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
            {project.highlights.length > 0 && (
              <>
                <h2 className="mini-title">Lo más destacado</h2>
                <ul className="check-list">
                  {project.highlights.map((highlight) => (
                    <li key={highlight}>
                      <Check size={17} aria-hidden="true" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <aside className="fact-sheet" aria-label="Ficha del proyecto">
            <dl>
              {facts.map(
                ([label, value]) =>
                  value && (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ),
              )}
            </dl>
            {project.tags.length > 0 && (
              <>
                <p className="fact-label">Tecnologías</p>
                <Tags items={project.tags} />
              </>
            )}
          </aside>
        </div>

        <nav className="shell pager" aria-label="Otros proyectos">
          {previous ? (
            <Link to={`/proyectos/${previous.id}`} rel="prev">
              <span>
                <ArrowLeft size={15} /> Anterior
              </span>
              {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/proyectos/${next.id}`} rel="next" className="pager-next">
              <span>
                Siguiente <ArrowRight size={15} />
              </span>
              {next.title}
            </Link>
          )}
        </nav>
      </article>
      <ContactBand profile={data.profile} />
    </>
  );
}
