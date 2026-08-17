# Apply / validate

Patch source HEAD: `7d2d4805f07dc00990bedd51e3c673cb65fceafd`.

From repository root after extracting this archive:

```bash
node tools/active-generic-sea-04-nav-hazard/validate-batch.mjs
node tools/active-generic-sea-04-nav-hazard/apply-localization.mjs --check
node tools/active-generic-sea-04-nav-hazard/apply-localization.mjs
npx vitest run tests/activeGenericSea04NavHazard.test.ts
npm run validate-content
npm test
npm run build
```

No commit, push, or PR is part of this handoff.
