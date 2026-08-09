export function migrateAuthoringV6ToV7(raw: Record<string, unknown>): Record<string, unknown> {
  const registries = typeof raw.registries === 'object' && raw.registries !== null
    ? structuredClone(raw.registries) as Record<string, unknown>
    : {};
  const races = Array.isArray(registries.races) ? registries.races.map((entry) => ({
    ...(entry as Record<string, unknown>),
    initialHealth: 35,
    attributeModifiers: {},
  })) : [];
  const locations = Array.isArray(registries.locations) ? registries.locations.map((entry) => ({
    ...(entry as Record<string, unknown>),
    seaId: null,
  })) : [];
  return {
    ...raw,
    authoringVersion: 7,
    registries: { ...registries, races, locations, familyStructures: [], socialClasses: [] },
  };
}
