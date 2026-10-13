import type { Language } from '../i18n/languages';
import type { Profile } from '../lib/types';
import { englishDocuments } from './en';
import { spanishDocuments } from './es';
import type { LegalDocument } from './shared';

export { LEGAL_UPDATED, type LegalDocument, type LegalSection } from './shared';

/**
 * Legal texts of the site in a language: legal notice (LSSI-CE), privacy policy (GDPR), cookie policy and terms of
 * use. Same slugs and sections in every language; the Spanish version is the reference one.
 */
export function legalDocuments(profile: Profile, language: Language): LegalDocument[] {
  return language === 'en' ? englishDocuments(profile) : spanishDocuments(profile);
}
