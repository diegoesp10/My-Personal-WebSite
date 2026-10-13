import { GitCommitHorizontal } from 'lucide-react';
import { languageColor } from '../data/useGitHub';
import { useLanguage } from '../i18n/LanguageContext';
import { useFormat } from '../lib/format';
import type { GitHubCommit, LanguageShare } from '../lib/types';

export function LanguageBar({ languages }: { languages: LanguageShare[] }) {
  const format = useFormat();
  const { t } = useLanguage();
  if (!languages.length) return null;
  // The aggregate bucket carries no name (the API groups the minor languages); its label is interface text.
  // "Otros" is accepted too so the page is correct before the API that stops sending it is deployed.
  const label = (name: string) => (name === '' || name === 'Otros' ? t.github.otherLanguages : name);
  return (
    <div className="language-bar">
      <div
        className="language-track"
        role="img"
        aria-label={languages.map((l) => `${label(l.name)} ${l.percentage}%`).join(', ')}
      >
        {languages.map((language) => (
          <span
            key={language.name || 'other'}
            style={{ width: `${language.percentage}%`, background: languageColor(language.name) }}
          />
        ))}
      </div>
      <ul className="language-legend">
        {languages.map((language) => (
          <li key={language.name || 'other'}>
            <i style={{ background: languageColor(language.name) }} aria-hidden="true" />
            {label(language.name)} <span>{format.number(language.percentage)} %</span>
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
