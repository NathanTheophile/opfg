import { migrateAuthoringV1ToV2 } from '../../authoring/migrations/v1-to-v2';
import { migrateAuthoringV2ToV3 } from '../../authoring/migrations/v2-to-v3';
import { migrateAuthoringV3ToV4 } from '../../authoring/migrations/v3-to-v4';
import { migrateAuthoringV4ToV5 } from '../../authoring/migrations/v4-to-v5';
import { migrateAuthoringV5ToV6 } from '../../authoring/migrations/v5-to-v6';
import { migrateAuthoringV6ToV7 } from '../../authoring/migrations/v6-to-v7';
import { migrateAuthoringV7ToV8 } from '../../authoring/migrations/v7-to-v8';
import { migrateAuthoringV8ToV9 } from '../../authoring/migrations/v8-to-v9';
import { AUTHORING_VERSION, type AuthoringProject } from '../../authoring/types';
import { CONTENT_SCHEMA_VERSION } from '../current/contract';
import { validateEventDefinitionsShape } from '../current/validator';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
export interface MigrationResult { project: AuthoringProject; migrated: boolean; reviewEventIds: string[]; warnings: string[]; }

export const migrateImportedProject = (input: unknown): MigrationResult => {
  if (!isRecord(input)) throw new Error('Project file must contain a JSON object.');
  let raw = structuredClone(input); let authoringVersion = Number(raw.authoringVersion ?? 0); let migrated = false;
  const reviewEventIds: string[] = []; const warnings: string[] = [];
  while (authoringVersion < AUTHORING_VERSION) {
    if (authoringVersion === 1) { raw = migrateAuthoringV1ToV2(raw); authoringVersion = 2; migrated = true; continue; }
    if (authoringVersion === 2) { const result = migrateAuthoringV2ToV3(raw); raw = result.project; reviewEventIds.push(...result.reviewEventIds); authoringVersion = 3; migrated = true; continue; }
    if (authoringVersion === 3) { const result = migrateAuthoringV3ToV4(raw); raw = result.project; reviewEventIds.push(...result.reviewEventIds); warnings.push(...result.warnings); authoringVersion = 4; migrated = true; continue; }
    if (authoringVersion === 4) { raw = migrateAuthoringV4ToV5(raw); authoringVersion = 5; migrated = true; continue; }
    if (authoringVersion === 5) { raw = migrateAuthoringV5ToV6(raw); authoringVersion = 6; migrated = true; continue; }
    if (authoringVersion === 6) { raw = migrateAuthoringV6ToV7(raw); authoringVersion = 7; migrated = true; continue; }
    if (authoringVersion === 7) { raw = migrateAuthoringV7ToV8(raw); authoringVersion = 8; migrated = true; continue; }
    if (authoringVersion === 8) { raw = migrateAuthoringV8ToV9(raw); authoringVersion = 9; migrated = true; continue; }
    throw new Error(`No migration registered from authoringVersion ${authoringVersion}.`);
  }
  if (authoringVersion > AUTHORING_VERSION) throw new Error(`Project uses newer authoringVersion ${authoringVersion}; editor supports ${AUTHORING_VERSION}.`);
  const gameVersion = Number(raw.gameSchemaVersion ?? 0);
  if (gameVersion !== CONTENT_SCHEMA_VERSION) throw new Error(`Project uses unsupported gameSchemaVersion ${gameVersion}; editor supports ${CONTENT_SCHEMA_VERSION}.`);
  if (!Array.isArray(raw.nodes) || !Array.isArray(raw.edges) || !isRecord(raw.registries) || !isRecord(raw.localization) || !isRecord(raw.metadata)) throw new Error('Malformed AuthoringProject: nodes, edges, registries, localization and metadata are required.');
  if (raw.sourceLocale !== 'fr' || !Array.isArray(raw.supportedLocales) || !raw.supportedLocales.includes('fr')) throw new Error('Malformed AuthoringProject: sourceLocale must be fr and supportedLocales must include fr.');
  const shapeIssues = validateEventDefinitionsShape(raw.events);
  if (shapeIssues.length) throw new Error(`Malformed game data (${shapeIssues.length} issue(s)): ${shapeIssues.slice(0, 5).map((x) => `${x.path}: ${x.message}`).join(' | ')}`);
  return { project: raw as unknown as AuthoringProject, migrated, reviewEventIds: [...new Set(reviewEventIds)], warnings };
};
