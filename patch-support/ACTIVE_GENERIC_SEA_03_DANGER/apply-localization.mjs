import fs from 'node:fs';
import path from 'node:path';

const batch = 'ACTIVE_GENERIC_SEA_03_DANGER';
const support = path.join('patch-support', batch);
for (const locale of ['fr', 'en']) {
  const targetPath = path.join('src', 'game', 'localization', 'locales', `${locale}.json`);
  const fragmentPath = path.join(support, `localization.${locale}.json`);
  const target = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  const fragment = JSON.parse(fs.readFileSync(fragmentPath, 'utf8'));
  for (const [key, value] of Object.entries(fragment)) {
    if (Object.hasOwn(target, key) && target[key] !== value) {
      throw new Error(`[${batch}] localization collision for ${locale}:${key}`);
    }
    target[key] = value;
  }
  fs.writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`, 'utf8');
  console.log(`[${batch}] merged ${Object.keys(fragment).length} ${locale.toUpperCase()} keys into ${targetPath}`);
}
