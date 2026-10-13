import type { ReactNode } from 'react';
import type { Profile } from '../lib/types';

export type LegalSection = { id: string; title: string; body: ReactNode };
export type LegalDocument = {
  slug: string;
  title: string;
  /** Name in the legal navigation. */
  short: string;
  lead: string;
  sections: LegalSection[];
};

/** Date of the last review of these texts (yyyy-MM-dd), in every language. Update it whenever a text changes. */
export const LEGAL_UPDATED = '2026-10-13';

/** The contact e-mail of the content as a link, or a generic name when there is none. */
export const ContactEmail = ({ profile, fallback }: { profile: Profile; fallback: string }) =>
  profile.email ? <a href={`mailto:${profile.email}`}>{profile.email}</a> : <>{fallback}</>;
