import { useSearchParams } from 'react-router';
import { PageHeader } from '../components/Blocks';
import { ProjectCard } from '../components/ProjectCard';
import { usePortfolio } from '../data/PortfolioContext';

const all = 'Todos';

export default function ProjectsPage() {
  const data = usePortfolio();
  const [params, setParams] = useSearchParams();
  const categories = [
    all,
    ...new Set(data.projects.map((project) => project.category).filter(Boolean)),
  ];
  const requested = params.get('categoria');
  const filter = requested && categories.includes(requested) ? requested : all;
  const projects = data.projects.filter((project) => filter === all || project.category === filter);

  return (
    <>
      <PageHeader
        eyebrow={`Proyectos · ${String(data.projects.length).padStart(2, '0')}`}
        title={
          <>
            Lo que <em className="accent-serif">construyo</em>
          </>
        }
        lead="Backends .NET, aplicaciones completas y webs en producción. Cada ficha explica el problema, las decisiones técnicas y enlaza al código cuando es público."
      />
      <section className="shell section-tight">
        <div className="filters" role="group" aria-label="Filtrar por categoría">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={filter === category ? 'is-active' : ''}
              aria-pressed={filter === category}
              onClick={() => {
                // Only the cards animate on a filter change, not the whole page (styles/motion.css).
                const root = document.documentElement;
                root.classList.add('vt-filter');
                setTimeout(() => root.classList.remove('vt-filter'), 900);
                setParams(category === all ? {} : { categoria: category }, {
                  replace: true,
                  preventScrollReset: true,
                  viewTransition: true,
                });
              }}
            >
              {category}
              <span>
                {category === all
                  ? data.projects.length
                  : data.projects.filter((project) => project.category === category).length}
              </span>
            </button>
          ))}
        </div>
        <div className="project-grid">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} reflow />
          ))}
        </div>
        {!projects.length && <p className="empty">Los próximos proyectos aparecerán aquí.</p>}
      </section>
    </>
  );
}
