import { Link } from './Link';
import { ArrowUpRight, Github, Globe } from 'lucide-react';
import type { CSSProperties } from 'react';
import { imageUrl, isGitHubUrl, safeUrl, transitionName } from '../lib/api';
import { companyName, positionOf } from '../lib/portfolio';
import type { Project } from '../lib/types';
import { usePortfolio } from '../data/PortfolioContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Tags } from './Blocks';
import { ProjectArt } from './ProjectArt';

export function ProjectVisual({ project, eager = false }: { project: Project; eager?: boolean }) {
  const image = imageUrl(project.image);
  // Same name on the card and on the project page: the image morphs between both views.
  return (
    <div
      className={`project-visual tone-${project.art}`}
      style={{ viewTransitionName: transitionName('project', project.id) }}
    >
      {image ? (
        <img src={image} alt="" loading={eager ? 'eager' : 'lazy'} />
      ) : (
        <ProjectArt kind={project.art} />
      )}
    </div>
  );
}

export function ProjectCard({
  project,
  index,
  reflow = false,
}: {
  project: Project;
  index: number;
  /** Animate the card to its new position when a filter changes the grid. */
  reflow?: boolean;
}) {
  const position = positionOf(usePortfolio(), project);
  const { t } = useLanguage();
  const hasCode = project.links.some((link) => isGitHubUrl(link.url));
  const hasSite = Boolean(safeUrl(project.url));
  return (
    <article
      className={`project-card${reflow ? ' is-reflow' : ''}`}
      data-reveal
      style={
        {
          '--i': index % 2,
          ...(reflow ? { viewTransitionName: transitionName('card', project.id) } : {}),
        } as CSSProperties
      }
    >
      <Link to={`/proyectos/${encodeURIComponent(project.id)}`} className="project-card-link">
        <ProjectVisual project={project} />
        <span className="project-card-index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="project-card-open" aria-hidden="true">
          <ArrowUpRight size={20} />
        </span>
        <div className="project-card-body">
          <p className="project-card-meta">
            {position && (
              <span className="is-company">{t.projectCard.at(companyName(position.company))}</span>
            )}
            <span>{project.category}</span>
            {project.year && <span>{project.year}</span>}
            {project.status && <span>{project.status}</span>}
          </p>
          <h3>{project.title}</h3>
          <p className="project-card-description">{project.description}</p>
          <div className="project-card-footer">
            <Tags items={project.tags} limit={4} />
            <span className="project-card-signals">
              {hasCode && (
                <span title={t.projectCard.code}>
                  <Github size={15} aria-label={t.projectCard.code} />
                </span>
              )}
              {hasSite && (
                <span title={t.projectCard.live}>
                  <Globe size={15} aria-label={t.projectCard.live} />
                </span>
              )}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
