import type { Language } from '../i18n/languages';

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
  hasDrivingLicense: boolean;
  hasOwnVehicle: boolean;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  portrait: string;
};
export type ProjectSection = { title: string; text: string };
export type ProjectLink = { label: string; url: string };
export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  details: string;
  sections?: ProjectSection[];
  year: string;
  status: string;
  url: string;
  image: string;
  tags: string[];
  art: string;
  featured: boolean;
  highlights: string[];
  links: ProjectLink[];
  /** Id of the position (experience) in which it was done; empty for personal projects. */
  experienceId: string;
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

export type DailyVisits = { date: string; visits: number; visitors: number };
export type VisitLocation = {
  country: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  visits: number;
  visitors: number;
  lastSeen: string;
};
export type NamedCount = { name: string; count: number };
export type RecentVisit = { country: string; city: string; path: string; at: string };
export type VisitorSummary = {
  enabled: boolean;
  since: string | null;
  visits: number;
  visitors: number;
  online: number;
  today: DailyVisits | null;
  days: DailyVisits[];
  locations: VisitLocation[];
  countries: NamedCount[];
  pages: NamedCount[];
  referrers: NamedCount[];
  recent: RecentVisit[];
};

/** Search and social metadata of a page (GET /api/seo/page). `url` is the canonical address; null when not indexed. */
export type PageMetadata = {
  title: string;
  description: string;
  url: string | null;
  image: string;
  imageAlt: string;
  type: string;
  indexable: boolean;
  siteName: string;
  published: string | null;
  structuredData: Record<string, unknown> | null;
  /** Language of the page (es, en) and its Open Graph locale (es_ES, en_US). */
  language: ApiLanguage;
  locale: string;
  /** The page in each language it exists in, plus x-default; empty for pages that are not indexed. */
  alternates: { language: string; url: string }[];
};

export type ApiLanguage = Language;
export type ApiProblem = {
  type: string;
  title: string;
  status: number;
  detail: string;
  error: string;
  code: string;
  traceId: string;
  language: ApiLanguage;
};
export type ErrorRecord = {
  id: string;
  occurredAt: string;
  code: string;
  status: number | null;
  traceId: string;
  method: string;
  endpoint: string;
  exceptionType: string | null;
  message: string;
  source?: 'http' | 'dependency' | 'background' | 'storage';
};
export type ErrorHistory = { language: ApiLanguage; entries: ErrorRecord[]; message: string };
