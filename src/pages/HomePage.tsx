import type { CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ContactBand, SectionHeading, SocialLinks, Tags } from '../components/Blocks';
import { PortraitPlate } from '../components/DotPortrait';
import { CommitList, LanguageBar } from '../components/GitHubWidgets';
import { Link } from '../components/Link';
import { PerfCard } from '../components/PerfCard';
import { ProjectCard } from '../components/ProjectCard';
import { usePortfolio } from '../data/PortfolioContext';
import { useGitHub } from '../data/useGitHub';
import { safeUrl } from '../lib/api';
import { emphasis, formatPeriod, pad, paragraphs } from '../lib/format';

const delay = (step: number) => ({ '--d': step }) as CSSProperties;

export default function HomePage() {
  const data = usePortfolio();
  const p = data.profile;
  const featured = data.projects.filter((project) => project.featured);
  const shown = (featured.length ? featured : data.projects).slice(0, 4);
  const stack = [...new Set(data.skills.flatMap((skill) => skill.tags))].slice(0, 18);
  const signature = data.skills
    .map((skill) => skill.tags[0])
    .filter(Boolean)
    .slice(0, 4);

  return (
    <>
      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow hero-rise" style={delay(0)}>
            {p.role}
            {p.location && ` · ${p.location}`}
          </p>
          <h1 id="hero-title" className="hero-title hero-rise" style={delay(1)}>
            {emphasis(p.headline || p.name)}
          </h1>
          <p className="hero-lead hero-rise" style={delay(2)}>
            {p.intro}
          </p>
          <div className="hero-actions hero-rise" style={delay(3)}>
            <Link className="button button-accent" to="/contacto">
              Hablemos <ArrowRight size={17} />
            </Link>
            <Link className="button button-ghost" to="/proyectos">
              Ver proyectos
            </Link>
            <SocialLinks profile={p} />
          </div>
          {p.availability && (
            <p className="hero-meta hero-rise" style={delay(4)}>
              <span>Modalidad</span> {p.availability}
            </p>
          )}
        </div>
        <div className="hero-visual hero-rise" style={delay(2)}>
          <PortraitPlate profile={p} tags={signature} />
        </div>
      </section>

      <section className="shell section" aria-labelledby="home-expertise">
        <SectionHeading
          id="home-expertise"
          eyebrow="01 · Especialidad"
          title={
            <>
              Backend que se mide, <em className="accent-serif">no que se supone</em>
            </>
          }
        />
        <div className="expertise">
          <div className="expertise-case" data-reveal>
            <PerfCard />
            {p.bio && <p className="muted">{paragraphs(p.bio)[0]}</p>}
          </div>
          <ol className="expertise-list">
            {data.skills.map((skill, index) => (
              <li key={skill.id} data-reveal style={{ '--i': index } as CSSProperties}>
                <span className="expertise-index">{pad(index + 1)}</span>
                <div>
                  <h3>{skill.title}</h3>
                  {skill.description && <p>{skill.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="shell section section-flush-top" aria-labelledby="home-projects">
        <SectionHeading
          id="home-projects"
          eyebrow="02 · Proyectos"
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
              eyebrow="03 · Trayectoria"
              title={
                <>
                  Dónde he <em className="accent-serif">trabajado</em>
                </>
              }
            />
            <Link className="arrow-link" to="/experiencia" data-reveal>
              Experiencia completa y CV <ArrowRight size={16} />
            </Link>
          </div>
          <ol className="role-list">
            {data.experience.map((role, index) => (
              <li key={role.id} data-reveal style={{ '--i': index } as CSSProperties}>
                <span className="role-period">{formatPeriod(role.start, role.end)}</span>
                <strong>{role.role}</strong>
                <span>{role.company}</span>
              </li>
            ))}
          </ol>
        </div>
        {stack.length > 0 && (
          <div className="shell stack-strip" data-reveal>
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
        eyebrow="04 · En GitHub"
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
          <div data-reveal>
            <h3 className="mini-title">Últimos commits</h3>
            <CommitList commits={activity.recentCommits.slice(0, 4)} />
          </div>
          <div data-reveal style={{ '--i': 1 } as CSSProperties}>
            <h3 className="mini-title">Lenguajes en mis repositorios públicos</h3>
            <LanguageBar languages={activity.languages} />
          </div>
        </div>
      )}
    </section>
  );
}
