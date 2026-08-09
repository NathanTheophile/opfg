import { CONTENT_SCHEMA_VERSION } from '../../gameSchema/current/contract';

type UnknownRecord = Record<string, unknown>;
const isRecord = (value: unknown): value is UnknownRecord => typeof value === 'object' && value !== null && !Array.isArray(value);

export const migrateAuthoringV4ToV5 = (input: UnknownRecord): UnknownRecord => {
  const project = structuredClone(input);
  migrateValue(project.events);
  const registries = isRecord(project.registries) ? project.registries : {};
  registries.ships = Array.isArray(registries.ships) ? registries.ships : [];
  registries.locations = Array.isArray(registries.locations)
    ? registries.locations.map((location) => isRecord(location) ? { ...location, allowsShipSale: location.allowsShipSale === true } : location)
    : [];
  project.registries = registries;
  project.authoringVersion = 5;
  project.gameSchemaVersion = CONTENT_SCHEMA_VERSION;
  return project;
};

function migrateValue(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(migrateValue);
    return;
  }
  if (!isRecord(value)) return;
  if (value.type === 'shipConditionAtLeast') {
    value.type = 'shipHealthAtLeast';
    if (typeof value.value === 'number') value.value *= 10;
  } else if (value.type === 'shipConditionAtMost') {
    value.type = 'shipHealthAtMost';
    if (typeof value.value === 'number') value.value *= 10;
  } else if (value.type === 'modifyShipCondition') {
    value.type = 'modifyShipHealth';
    if (typeof value.amount === 'number') value.amount *= 10;
  } else if ((value.type === 'addItem' || value.type === 'removeItem') && value.quantity === undefined) {
    value.quantity = 1;
  }
  Object.values(value).forEach(migrateValue);
}
