import type { AuthoringProject } from '../types';

export const migrateAuthoringV11ToV12 = (input: unknown): unknown => {
  const project = structuredClone(input) as Partial<AuthoringProject> & {
    registries?: Record<string, unknown>;
    authoringVersion?: number;
    gameSchemaVersion?: number;
  };

  if (project.registries && !Array.isArray(project.registries.majorNarrativeTracks)) {
    project.registries.majorNarrativeTracks = [];
  }

  project.authoringVersion = 12;
  project.gameSchemaVersion = 14;
  return project;
};
