import { CONTENT_SCHEMA_VERSION } from '../../gameSchema/current/contract';

type RecordValue = Record<string, unknown>;
const isRecord = (value: unknown): value is RecordValue => typeof value === 'object' && value !== null && !Array.isArray(value);

export function migrateAuthoringV10ToV11(input: RecordValue): RecordValue {
  const migrated = renameContracts(structuredClone(input)) as RecordValue;
  const registries = isRecord(migrated.registries) ? migrated.registries : {};
  const careerRanks = Array.isArray(registries.marineRanks) ? registries.marineRanks : [];
  const locations = Array.isArray(registries.locations) ? registries.locations.map(migrateLocation) : [];
  const devilFruits = Array.isArray(registries.devilFruits) ? registries.devilFruits.map(migrateFruit) : [];
  const { marineRanks: _legacy, ...remaining } = registries;
  return { ...migrated, authoringVersion: 11, gameSchemaVersion: CONTENT_SCHEMA_VERSION, registries: { ...remaining, careerRanks, locations, devilFruits } };
}

function renameContracts(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(renameContracts);
  if (!isRecord(value)) return value;
  const renamed = Object.fromEntries(Object.entries(value).map(([key, child]) => [key, renameContracts(child)]));
  if (renamed.type === 'marineRankIs') renamed.type = 'careerRankIs';
  if (renamed.type === 'marineRankAtLeast') renamed.type = 'careerRankAtLeast';
  if (renamed.type === 'setMarineRank') renamed.type = 'setCareerRank';
  return renamed;
}

function migrateLocation(value: unknown): unknown {
  if (!isRecord(value)) return value;
  return { ...value, nameKey: value.nameKey ?? `location.${String(value.id)}.name`, seaId: value.seaId ?? '', type: value.type ?? 'island', parentLocationId: value.parentLocationId ?? null, canBeBirthLocation: value.canBeBirthLocation === true, shipMarket: value.allowsShipSale === true ? 'full' : 'none', services: Array.isArray(value.services) ? value.services : [], tags: Array.isArray(value.tags) ? value.tags : [] };
}

function migrateFruit(value: unknown): unknown {
  if (!isRecord(value)) return value;
  const playableV1 = typeof value.itemId === 'string' && value.itemId.length > 0;
  return { ...value, playableV1, itemId: playableV1 ? value.itemId : null };
}
