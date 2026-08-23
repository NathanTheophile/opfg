export function migrateAuthoringV7ToV8(raw: Record<string, unknown>): Record<string, unknown> {
  const registries = typeof raw.registries === 'object' && raw.registries !== null
    ? structuredClone(raw.registries) as Record<string, unknown>
    : {};
  const locations = Array.isArray(registries.locations) ? registries.locations.map((entry) => ({
    ...(entry as Record<string, unknown>),
    allowsDocking: false,
  })) : [];
  return { ...raw, authoringVersion: 8, registries: { ...registries, locations } };
}
