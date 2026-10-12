import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ContactBand, SectionHeading, SocialLinks, Tags } from '../components/Blocks';
import { CommitList, LanguageBar } from '../components/GitHubWidgets';
import { PageMeta } from '../components/PageMeta';
import { PerfCard } from '../components/PerfCard';
import { ProjectCard } from '../components/ProjectCard';
import { usePortfolio } from '../data/PortfolioContext';
import { useGitHub } from '../data/useGitHub';
import { emphasis, formatPeriod, plain } from '../lib/format';
import { safeUrl } from '../lib/api';

export default function HomePage() {
  const data = usePortfolio();
  const p = data.profile;
  const featured = data.projects.filter((project) => project.featured);
  const shown = (featured.length ? featured : data.projects).slice(0, 4);
  const stack = [...new Set(data.skills.flatMap((skill) => skill.tags))].slice(0, 18);

  return (
    <>
      <PageMeta description={plain(p.intro)} path="/" />
      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          {p.availability && (
            <p className="status-pill">
              <span className="pulse" aria-hidden="true" />
              {p.availability}
            </p>
          )}
          <p className="eyebrow">
            {p.role}
            {p.location && ` · ${p.location}`}
          </p>
          <h1 id="hero-title" className="hero-title">
            {emphasis(p.headline || p.name)}
          </h1>
          <p className="hero-lead">{p.intro}</p>
          <div className="hero-actions">
            <Link className="button" to="/proyectos">
              Ver proyectos <ArrowRight size={17} />
            </Link>
            <Link className="button button-ghost" to="/experiencia">
              CV online
            </Link>
            <SocialLinks profile={p} />
          </div>
        </div>
        <div className="hero-visual">
          <PerfCard />
        </div>
      </section>

      {data.metrics.length > 0 && (
        <section className="shell" aria-label="En cifras">
          <dl className="metrics">
            {data.metrics.map((metric) => (
              <div key={metric.id}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="shell section" aria-labelledby="home-projects">
        <SectionHeading
          id="home-projects"
          eyebrow="01 · Proyectos"
          title={
            <>
              Trabajo <em className="accent-serif">seleccionado</em>
            </>
          }
          link={{ to: '/proyectos', label: `Ver los ${data.projects.length} proyectos` }}
        />
        <div className="project-grid">
          {shown.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>

      <section className="section band" aria-labelledby="home-experience">
        <div className="shell split">
          <div>
            <SectionHeading
              id="home-experience"
              eyebrow="02 · Trayectoria"
              title={
                <>
                  Dónde he <em className="accent-serif">trabajado</em>
                </>
              }
            />
            <p className="muted split-lead">{p.bio.split('\n')[0]}</p>
            <Link className="arrow-link" to="/experiencia">
              Experiencia completa y CV <ArrowRight size={16} />
            </Link>
          </div>
          <ol className="role-list">
            {data.experience.map((role) => (
              <li key={role.id}>
                <span className="role-period">{formatPeriod(role.start, role.end)}</span>
                <strong>{role.role}</strong>
                <span>{role.company}</span>
              </li>
            ))}
          </ol>
        </div>
        {stack.length > 0 && (
          <div className="shell stack-strip">
            <p className="eyebrow">Stack habitual</p>
            <Tags items={stack} />
          </div>
        )}
      </section>

      <GitHubTeaser github={safeUrl(p.github)} />
      <ContactBand profile={p} />
    </>
  );
}

function GitHubTeaser({ github }: { github?: string }) {
  const { activity, loading, failed } = useGitHub();
  const unavailable = failed || (activity && !activity.available);
  return (
    <section className="shell section" aria-labelledby="home-github">
      <SectionHeading
        id="home-github"
        eyebrow="03 · En GitHub"
        title={
          <>
            Lo que estoy <em className="accent-serif">construyendo</em>
          </>
        }
        link={{ to: '/github', label: 'Repositorios y actividad' }}
      />
      {loading && <div className="skeleton-block" aria-label="Cargando actividad de GitHub" />}
      {unavailable && (
        <p className="muted">
          No he podido consultar GitHub ahora mismo.{' '}
          {github && (
            <a className="inline-link" href={github} target="_blank" rel="noreferrer">
              Ver mi perfil <ArrowUpRight size={14} />
            </a>
          )}
        </p>
      )}
      {activity?.available && (
        <div className="github-teaser">
          <div>
            <h3 className="mini-title">Últimos commits</h3>
            <CommitList commits={activity.recentCommits.slice(0, 4)} />
          </div>
          <div>
            <h3 className="mini-title">Lenguajes en mis repositorios públicos</h3>
            <LanguageBar languages={activity.languages} />
          </div>
        </div>
      )}
    </section>
  );
}
