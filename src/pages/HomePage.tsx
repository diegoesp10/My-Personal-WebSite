import { useRef, type CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ContactBand, SectionHeading, SocialLinks } from '../components/Blocks';
import { PortraitPlate } from '../components/DotPortrait';
import { CommitList, LanguageBar } from '../components/GitHubWidgets';
import { Link } from '../components/Link';
import { PerfCard } from '../components/PerfCard';
import { ProjectCard } from '../components/ProjectCard';
import Magnet from '../components/reactbits/Magnet';
import { StackMarquee } from '../components/StackMarquee';
import { usePortfolio } from '../data/PortfolioContext';
import { useGitHub } from '../data/useGitHub';
import { useLanguage } from '../i18n/LanguageContext';
import { safeUrl } from '../lib/api';
import { emphasis, pad, paragraphs, useFormat } from '../lib/format';
import { useHeroIntro, useRoleTimeline } from '../motion/home';
import { useSpotlight, useTilt } from '../motion/interactions';

export default function HomePage() {
  const data = usePortfolio();
  const p = data.profile;
  const { t } = useLanguage();
  const format = useFormat();
  const featured = data.projects.filter((project) => project.featured);
  const shown = (featured.length ? featured : data.projects).slice(0, 4);
  const stack = [...new Set(data.skills.flatMap((skill) => skill.tags))].slice(0, 18);
  const signature = data.skills
    .map((skill) => skill.tags[0])
    .filter(Boolean)
    .slice(0, 4);
  const hero = useRef<HTMLElement>(null);
  const skills = useRef<HTMLOListElement>(null);
  const projects = useRef<HTMLDivElement>(null);
  const roles = useRef<HTMLDivElement>(null);
  useHeroIntro(hero);
  useSpotlight(skills, 'li');
  useTilt(projects, '.project-card-link', '.project-visual');
  useRoleTimeline(roles);

  return (
    <>
      <section ref={hero} className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow" data-hero="eyebrow">
            {p.role}
            {p.location && ` · ${p.location}`}
          </p>
          <h1 id="hero-title" className="hero-title" data-hero="title">
            {emphasis(p.headline || p.name)}
          </h1>
          <p className="hero-lead" data-hero="lead">
            {p.intro}
          </p>
          <div className="hero-actions" data-hero="actions">
            <Magnet padding={70} magnetStrength={3}>
              <Link className="button button-accent" to="/contacto">
                {t.home.talk} <ArrowRight size={17} />
              </Link>
            </Magnet>
            <Magnet padding={70} magnetStrength={3}>
              <Link className="button button-ghost" to="/proyectos">
                {t.home.seeProjects}
              </Link>
            </Magnet>
            <SocialLinks profile={p} />
          </div>
          {p.availability && (
            <p className="hero-meta" data-hero="meta">
              <span>{t.home.availability}</span> {p.availability}
            </p>
          )}
        </div>
        <div className="hero-visual" data-hero="visual">
          <PortraitPlate profile={p} tags={signature} />
        </div>
        <a className="scroll-cue" href="#home-expertise" data-hero="cue">
          <span>{t.home.scroll}</span>
          <i aria-hidden="true" />
        </a>
      </section>
      <StackMarquee items={stack} />

      <section className="shell section" aria-labelledby="home-expertise">
        <SectionHeading
          id="home-expertise"
          eyebrow={t.home.expertiseEyebrow}
          title={emphasis(t.home.expertiseTitle)}
        />
        <div className="expertise">
          <div className="expertise-case" data-reveal>
            <PerfCard />
            {p.bio && <p className="muted">{paragraphs(p.bio)[0]}</p>}
          </div>
          <ol ref={skills} className="expertise-list">
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
          eyebrow={t.home.projectsEyebrow}
          title={emphasis(t.home.projectsTitle)}
          link={{ to: '/proyectos', label: t.home.allProjects(data.projects.length) }}
        />
        <div ref={projects} className="project-grid">
          {shown.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>

      <section className="section band" aria-labelledby="home-experience">
        <div ref={roles} className="shell split">
          <div>
            <SectionHeading
              id="home-experience"
              eyebrow={t.home.careerEyebrow}
              title={emphasis(t.home.careerTitle)}
            />
            <Link className="arrow-link" to="/experiencia" data-reveal>
              {t.home.fullCareer} <ArrowRight size={16} />
            </Link>
          </div>
          <div className="role-track">
            <span className="role-progress" aria-hidden="true" />
            <ol className="role-list">
              {data.experience.map((role, index) => (
                <li key={role.id} data-reveal style={{ '--i': index } as CSSProperties}>
                  <span className="role-period">{format.period(role.start, role.end)}</span>
                  <strong>{role.role}</strong>
                  <span>{role.company}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <GitHubTeaser github={safeUrl(p.github)} />
      <ContactBand profile={p} />
    </>
  );
}

function GitHubTeaser({ github }: { github?: string }) {
  const { activity, loading, failed } = useGitHub();
  const { t } = useLanguage();
  const unavailable = failed || (activity && !activity.available);
  return (
    <section className="shell section" aria-labelledby="home-github">
      <SectionHeading
        id="home-github"
        eyebrow={t.home.githubEyebrow}
        title={emphasis(t.home.githubTitle)}
        link={{ to: '/github', label: t.home.githubLink }}
      />
      {loading && <div className="skeleton-block" aria-label={t.home.githubLoading} />}
      {unavailable && (
        <p className="muted">
          {t.home.githubUnavailable}{' '}
          {github && (
            <a className="inline-link" href={github} target="_blank" rel="noreferrer">
              {t.home.githubProfile} <ArrowUpRight size={14} />
            </a>
          )}
        </p>
      )}
      {activity?.available && (
        <div className="github-teaser">
          <div data-reveal>
            <h3 className="mini-title">{t.home.latestCommits}</h3>
            <CommitList commits={activity.recentCommits.slice(0, 4)} />
          </div>
          <div data-reveal style={{ '--i': 1 } as CSSProperties}>
            <h3 className="mini-title">{t.home.languages}</h3>
            <LanguageBar languages={activity.languages} />
          </div>
        </div>
      )}
    </section>
  );
}
