import { CONTENT_SCHEMA_VERSION } from '../../gameSchema/current/contract';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

export const migrateAuthoringV9ToV10 = (input: Record<string, unknown>): Record<string, unknown> => {
  const registries = isRecord(input.registries) ? input.registries : {};
  return { ...input, authoringVersion: 10, gameSchemaVersion: CONTENT_SCHEMA_VERSION, registries: { ...registries, careerAffiliations: [], marineRanks: [], careerTitles: [], endings: [] } };
};
