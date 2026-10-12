// Mirrors the JSON contract of the API (camelCase). Keep in sync with Portfolio.Domain.
export type Profile = {
  name: string;
  role: string;
  headline: string;
  intro: string;
  bio: string;
  personal: string;
  location: string;
  availability: string;
  languages: string;
  email: string;
  github: string;
  linkedin: string;
  portrait: string;
};
export type ProjectLink = { label: string; url: string };
export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  details: string;
  year: string;
  status: string;
  url: string;
  image: string;
  tags: string[];
  art: string;
  featured: boolean;
  highlights: string[];
  links: ProjectLink[];
};
export type Experience = {
  id: string;
  role: string;
  company: string;
  companyUrl: string;
  start: string;
  end: string;
  location: string;
  summary: string;
  highlights: string[];
  stack: string[];
};
export type Education = {
  id: string;
  title: string;
  center: string;
  location: string;
  start: string;
  end: string;
};
export type Entry = { id: string; title: string; date: string; category: string; text: string };
export type Skill = { id: string; title: string; description: string; tags: string[] };
export type Metric = { id: string; value: string; label: string };
export type Portfolio = {
  revision: string;
  profile: Profile;
  projects: Project[];
  experience: Experience[];
  education: Education[];
  entries: Entry[];
  skills: Skill[];
  metrics: Metric[];
};

export type GitHubProfile = {
  login: string;
  name: string;
  avatarUrl: string;
  url: string;
  bio: string;
  publicRepositories: number;
  followers: number;
};
export type GitHubRepository = {
  name: string;
  description: string;
  url: string;
  homepage: string;
  language: string;
  stars: number;
  forks: number;
  isFork: boolean;
  isArchived: boolean;
  pushedAt: string;
  topics: string[];
};
export type GitHubCommit = {
  repository: string;
  message: string;
  sha: string;
  url: string;
  date: string;
};
export type LanguageShare = { name: string; percentage: number };
export type GitHubActivity = {
  available: boolean;
  stale: boolean;
  user: string;
  retrievedAt: string | null;
  profile: GitHubProfile | null;
  repositories: GitHubRepository[];
  recentCommits: GitHubCommit[];
  languages: LanguageShare[];
};
