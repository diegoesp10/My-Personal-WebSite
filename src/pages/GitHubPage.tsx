import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight, Archive, GitFork, Github, Star } from 'lucide-react';
import { PageHeader } from '../components/Blocks';
import { CommitList, LanguageBar } from '../components/GitHubWidgets';
import { PageMeta } from '../components/PageMeta';
import { usePortfolio } from '../data/PortfolioContext';
import { languageColor, useGitHub } from '../data/useGitHub';
import { repositoryKey, safeUrl } from '../lib/api';
import { timeAgo } from '../lib/format';

export default function GitHubPage() {
  const data = usePortfolio();
  const { activity, loading, failed } = useGitHub();
  const profileUrl = safeUrl(data.profile.github);

  // A repository linked from a project gets a shortcut to its case study.
  const projectByRepository = new Map(
    data.projects.flatMap((project) =>
      project.links.map((link) => [repositoryKey(link.url), project] as const),
    ),
  );

  return (
    <>
      <PageMeta
        title="GitHub"
        description="Repositorios públicos, lenguajes y commits recientes de Diego Espina en GitHub."
        path="/github"
      />
      <PageHeader
        eyebrow="Código abierto"
        title={
          <>
            Lo que voy haciendo <em className="accent-serif">en GitHub</em>
          </>
        }
        lead="Mis repositorios públicos y la actividad más reciente, leídos directamente de GitHub. Lo que está en producción privada lo explico en las fichas de proyecto."
      >
        {profileUrl && (
          <a className="button" href={profileUrl} target="_blank" rel="noreferrer">
            <Github size={17} /> Ver perfil en GitHub <ArrowUpRight size={15} />
          </a>
        )}
      </PageHeader>

      <section className="shell section-tight">
        {loading && (
          <div className="github-layout" aria-busy="true" aria-label="Cargando actividad de GitHub">
            <div className="skeleton-block tall" />
            <div className="skeleton-block tall" />
          </div>
        )}
        {(failed || (activity && !activity.available)) && (
          <div className="notice">
            <p>
              Ahora mismo no puedo consultar GitHub. Puedes ver todo directamente en{' '}
              {profileUrl ? (
                <a className="inline-link" href={profileUrl} target="_blank" rel="noreferrer">
                  mi perfil <ArrowUpRight size={14} />
                </a>
              ) : (
                'mi perfil'
              )}
              .
            </p>
          </div>
        )}
        {activity?.available && (
          <>
            <div className="github-layout">
              <div className="github-profile">
                {activity.profile && (
                  <div className="github-identity">
                    <img src={activity.profile.avatarUrl} alt="" width={64} height={64} />
                    <div>
                      <strong>{activity.profile.name}</strong>
                      <a href={activity.profile.url} target="_blank" rel="noreferrer">
                        @{activity.profile.login}
                      </a>
                    </div>
                  </div>
                )}
                {activity.profile?.bio && <p className="muted">{activity.profile.bio}</p>}
                <dl className="github-stats">
                  <div>
                    <dt>Repositorios públicos</dt>
                    <dd>{activity.profile?.publicRepositories ?? activity.repositories.length}</dd>
                  </div>
                  <div>
                    <dt>Último push</dt>
                    <dd>
                      {activity.repositories[0] ? timeAgo(activity.repositories[0].pushedAt) : '—'}
                    </dd>
                  </div>
                </dl>
                <h2 className="mini-title">Lenguajes</h2>
                <LanguageBar languages={activity.languages} />
              </div>
              <div>
                <h2 className="mini-title">Commits recientes</h2>
                <CommitList commits={activity.recentCommits} />
              </div>
            </div>

            <h2 className="mini-title repo-title">Repositorios</h2>
            <ul className="repo-grid">
              {activity.repositories.map((repository) => {
                const project = projectByRepository.get(repositoryKey(repository.url));
                return (
                  <li key={repository.name} className="repo-card">
                    <div className="repo-card-top">
                      <a
                        href={repository.url}
                        target="_blank"
                        rel="noreferrer"
                        className="repo-name"
                      >
                        {repository.name} <ArrowUpRight size={15} />
                      </a>
                      {repository.isArchived && (
                        <span className="badge">
                          <Archive size={12} /> Archivado
                        </span>
                      )}
                    </div>
                    <p className="repo-description">
                      {repository.description || 'Sin descripción todavía.'}
                    </p>
                    <p className="repo-meta">
                      {repository.language && (
                        <span>
                          <i
                            style={{ background: languageColor(repository.language) }}
                            aria-hidden="true"
                          />
                          {repository.language}
                        </span>
                      )}
                      {repository.stars > 0 && (
                        <span>
                          <Star size={13} aria-label="Estrellas" /> {repository.stars}
                        </span>
                      )}
                      {repository.forks > 0 && (
                        <span>
                          <GitFork size={13} aria-label="Forks" /> {repository.forks}
                        </span>
                      )}
                      <span>actualizado {timeAgo(repository.pushedAt)}</span>
                    </p>
                    {project && (
                      <Link className="arrow-link small" to={`/proyectos/${project.id}`}>
                        Ficha del proyecto <ArrowRight size={14} />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="footnote">
              {activity.stale
                ? 'GitHub no responde ahora mismo; muestro los últimos datos válidos'
                : 'Datos de la API pública de GitHub'}
              {activity.retrievedAt && `, consultados ${timeAgo(activity.retrievedAt)}`}. Se
              actualizan cada 30 minutos.
            </p>
          </>
        )}
      </section>
    </>
  );
}
