import type { Experience, Portfolio, Profile, Project } from './types';

/** Only show mobility information explicitly enabled in the profile. */
export const mobilityDetails = (profile: Profile): string[] =>
  [
    profile.hasDrivingLicense && 'Carnet de conducir',
    profile.hasOwnVehicle && 'Vehículo propio',
  ].filter((item): item is string => Boolean(item));

/** Position in which a project was done; undefined for personal projects. */
export const positionOf = (data: Portfolio, project: Project): Experience | undefined =>
  project.experienceId
    ? data.experience.find((item) => item.id === project.experienceId)
    : undefined;

/** Short company name: «Adico · Asturiana de Desarrollos…» → «Adico». */
export const companyName = (company: string) => company.split(' · ')[0].trim();

/** Anchor of a position on the experience page. */
export const positionAnchor = (id: string) => `etapa-${id}`;
