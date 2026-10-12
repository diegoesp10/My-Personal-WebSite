import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Github, Globe } from 'lucide-react';
import { ContactBand, Tags } from '../components/Blocks';
import { PageMeta } from '../components/PageMeta';
import { ProjectVisual } from '../components/ProjectCard';
import { usePortfolio } from '../data/PortfolioContext';
import { isGitHubUrl, safeUrl } from '../lib/api';
import { paragraphs } from '../lib/format';
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
  const facts: [string, string][] = [
    ['Categoría', project.category],
    ['Año', project.year],
    ['Estado', project.status],
  ];

  return (
    <>
      <PageMeta
        title={project.title}
        description={project.description}
        path={`/proyectos/${project.id}`}
      />
      <article>
        <header className="shell project-header">
          <nav className="breadcrumb" aria-label="Ruta">
            <Link to="/proyectos">
              <ArrowLeft size={15} /> Proyectos
            </Link>
          </nav>
          <p className="eyebrow">
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
            <h2 className="mini-title">Sobre el proyecto</h2>
            {paragraphs(project.details).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
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
