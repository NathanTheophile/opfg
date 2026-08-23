export const migrateAuthoringV1ToV2 = (input: Record<string, unknown>): Record<string, unknown> => ({
  ...structuredClone(input),
  authoringVersion: 2,
});

