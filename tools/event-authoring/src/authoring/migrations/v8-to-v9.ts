import { CONTENT_SCHEMA_VERSION } from '../../gameSchema/current/contract';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

export const migrateAuthoringV8ToV9 = (input: Record<string, unknown>): Record<string, unknown> => {
  const registries = isRecord(input.registries) ? input.registries : {};
  return { ...input, authoringVersion: 9, gameSchemaVersion: CONTENT_SCHEMA_VERSION, registries: { ...registries, devilFruits: Array.isArray(registries.devilFruits) ? registries.devilFruits : [] } };
};
