import { Link } from '../components/Link';
import { ArrowRight, ArrowUpRight, Archive, GitFork, Github, Star } from 'lucide-react';
import { PageHeader } from '../components/Blocks';
import { CommitList, LanguageBar } from '../components/GitHubWidgets';
import { usePortfolio } from '../data/PortfolioContext';
import { languageColor, useGitHub } from '../data/useGitHub';
import { repositoryKey, safeUrl } from '../lib/api';
import { useLanguage } from '../i18n/LanguageContext';
import { emphasis, useFormat } from '../lib/format';

export default function GitHubPage() {
  const data = usePortfolio();
  const { activity, loading, failed } = useGitHub();
  const { t } = useLanguage();
  const format = useFormat();
  const profileUrl = safeUrl(data.profile.github);

  // A repository linked from a project gets a shortcut to its case study.
  const projectByRepository = new Map(
    data.projects.flatMap((project) =>
      project.links.map((link) => [repositoryKey(link.url), project] as const),
    ),
  );

  return (
    <>
      <PageHeader eyebrow={t.github.eyebrow} title={emphasis(t.github.title)} lead={t.github.lead}>
        {profileUrl && (
          <a className="button" href={profileUrl} target="_blank" rel="noreferrer">
            <Github size={17} /> {t.github.profile} <ArrowUpRight size={15} />
          </a>
        )}
      </PageHeader>

      <section className="shell section-tight">
        {loading && (
          <div className="github-layout" aria-busy="true" aria-label={t.github.loading}>
            <div className="skeleton-block tall" />
            <div className="skeleton-block tall" />
          </div>
        )}
        {(failed || (activity && !activity.available)) && (
          <div className="notice">
            <p>
              {t.github.unavailable}{' '}
              {profileUrl ? (
                <a className="inline-link" href={profileUrl} target="_blank" rel="noreferrer">
                  {t.github.myProfile} <ArrowUpRight size={14} />
                </a>
              ) : (
                t.github.myProfile
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
                    <dt>{t.github.repositories}</dt>
                    <dd>{activity.profile?.publicRepositories ?? activity.repositories.length}</dd>
                  </div>
                  <div>
                    <dt>{t.github.lastPush}</dt>
                    <dd>
                      {activity.repositories[0]
                        ? format.timeAgo(activity.repositories[0].pushedAt)
                        : '—'}
                    </dd>
                  </div>
                </dl>
                <h2 className="mini-title">{t.github.languages}</h2>
                <LanguageBar languages={activity.languages} />
              </div>
              <div>
                <h2 className="mini-title">{t.github.commits}</h2>
                <CommitList commits={activity.recentCommits} />
              </div>
            </div>

            <h2 className="mini-title repo-title">{t.github.repositoriesTitle}</h2>
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
                          <Archive size={12} /> {t.github.archived}
                        </span>
                      )}
                    </div>
                    <p className="repo-description">
                      {repository.description || t.github.noDescription}
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
                          <Star size={13} aria-label={t.github.stars} /> {repository.stars}
                        </span>
                      )}
                      {repository.forks > 0 && (
                        <span>
                          <GitFork size={13} aria-label={t.github.forks} /> {repository.forks}
                        </span>
                      )}
                      <span>{t.github.updated(format.timeAgo(repository.pushedAt))}</span>
                    </p>
                    {project && (
                      <Link className="arrow-link small" to={`/proyectos/${project.id}`}>
                        {t.github.caseStudy} <ArrowRight size={14} />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="footnote">
              {activity.stale ? t.github.stale : t.github.source}
              {activity.retrievedAt && t.github.retrieved(format.timeAgo(activity.retrievedAt))}
              {t.github.refresh}
            </p>
          </>
        )}
      </section>
    </>
  );
}
