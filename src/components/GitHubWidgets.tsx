import { GitCommitHorizontal } from 'lucide-react';
import { languageColor } from '../data/useGitHub';
import { useLanguage } from '../i18n/LanguageContext';
import { useFormat } from '../lib/format';
import type { GitHubCommit, LanguageShare } from '../lib/types';

export function LanguageBar({ languages }: { languages: LanguageShare[] }) {
  const format = useFormat();
  if (!languages.length) return null;
  return (
    <div className="language-bar">
      <div
        className="language-track"
        role="img"
        aria-label={languages.map((l) => `${l.name} ${l.percentage}%`).join(', ')}
      >
        {languages.map((language) => (
          <span
            key={language.name}
            style={{ width: `${language.percentage}%`, background: languageColor(language.name) }}
          />
        ))}
      </div>
      <ul className="language-legend">
        {languages.map((language) => (
          <li key={language.name}>
            <i style={{ background: languageColor(language.name) }} aria-hidden="true" />
            {language.name} <span>{format.number(language.percentage)} %</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CommitList({ commits }: { commits: GitHubCommit[] }) {
  const { t } = useLanguage();
  const format = useFormat();
  if (!commits.length) return <p className="muted">{t.github.noCommits}</p>;
  return (
    <ol className="commit-list">
      {commits.map((commit) => (
        <li key={commit.repository + commit.sha}>
          <GitCommitHorizontal size={18} aria-hidden="true" className="commit-icon" />
          <div>
            <a href={commit.url} target="_blank" rel="noreferrer" className="commit-message">
              {commit.message}
            </a>
            <p className="commit-meta">
              <span>{commit.repository}</span>
              <code>{commit.sha}</code>
              <time dateTime={commit.date}>{format.timeAgo(commit.date)}</time>
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
