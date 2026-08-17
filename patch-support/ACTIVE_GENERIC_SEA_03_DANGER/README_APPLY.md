# Apply ACTIVE_GENERIC_SEA_03_DANGER

1. Extract this ZIP at the repository root (it only adds the isolated batch, its manifest and namespaced support files).
2. Merge the FR/EN namespaced keys:
   `node patch-support/ACTIVE_GENERIC_SEA_03_DANGER/apply-localization.mjs`
3. Run the batch-local static check:
   `node patch-support/ACTIVE_GENERIC_SEA_03_DANGER/verify-batch.mjs`
4. Run repository validation:
   `npm run validate-content`
   `npm test`
   `npm run build`

The runtime event catalogue uses `import.meta.glob('./events/**/*.json')`, so no shared catalogue edit is required for the new Event directory.
