import { CONTENT_SCHEMA_VERSION } from '../../gameSchema/current/contract';

type UnknownRecord = Record<string, unknown>;
const isRecord = (value: unknown): value is UnknownRecord => typeof value === 'object' && value !== null && !Array.isArray(value);

export const migrateAuthoringV5ToV6 = (input: UnknownRecord): UnknownRecord => {
  const project = structuredClone(input);
  const registries = isRecord(project.registries) ? project.registries : {};
  registries.crewRoles = Array.isArray(registries.crewRoles) ? registries.crewRoles : [];
  registries.npcs = Array.isArray(registries.npcs)
    ? registries.npcs.map((npc) => isRecord(npc) ? { ...npc, crewRoleId: typeof npc.crewRoleId === 'string' ? npc.crewRoleId : null } : npc)
    : [];
  project.registries = registries;
  project.authoringVersion = 6;
  project.gameSchemaVersion = CONTENT_SCHEMA_VERSION;
  return project;
};
