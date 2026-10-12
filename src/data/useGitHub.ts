import { useEffect, useState } from 'react';
import { request } from '../lib/api';
import type { GitHubActivity } from '../lib/types';

type State = { activity?: GitHubActivity; loading: boolean; failed: boolean };

// One request per visit: the API already caches GitHub for 30 minutes.
let pending: Promise<GitHubActivity> | undefined;

export function useGitHub(): State {
  const [state, setState] = useState<State>({ loading: true, failed: false });
  useEffect(() => {
    let active = true;
    pending ??= request<GitHubActivity>('/api/github').catch((e) => {
      pending = undefined;
      throw e;
    });
    pending
      .then((activity) => active && setState({ activity, loading: false, failed: false }))
      .catch(() => active && setState({ loading: false, failed: true }));
    return () => {
      active = false;
    };
  }, []);
  return state;
}

// Colours used by GitHub for each language, so the bars read the same as on the profile.
const languageColors: Record<string, string> = {
  'C#': '#178600',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  CSS: '#663399',
  HTML: '#e34c26',
  Python: '#3572a5',
  PowerShell: '#012456',
  Dockerfile: '#384d54',
  Shell: '#89e051',
  PHP: '#4f5d95',
  'Visual Basic .NET': '#945db7',
  TSQL: '#e38c00',
  SCSS: '#c6538c',
};

export const languageColor = (name: string) => languageColors[name] ?? 'var(--faint)';
