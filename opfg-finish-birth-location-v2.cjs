const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function read(p) {
  return fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
}

function write(p, s) {
  fs.writeFileSync(p, s.replace(/\r\n/g, '\n'), 'utf8');
}

function fail(message) {
  console.error(`\nERREUR: ${message}`);
  process.exit(1);
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: false });
  if (r.error) fail(r.error.message);
  if (r.status !== 0) process.exit(r.status ?? 1);
}

if (!fs.existsSync('package.json') || !fs.existsSync('src/game/engine/resolution.ts')) {
  fail('Lance ce script depuis la racine du repo OPFG.');
}

console.log('[1/7] Runtime Birth Location');

const resolutionPath = 'src/game/engine/resolution.ts';
let resolution = read(resolutionPath);

if (!resolution.includes("import { nextRandom } from './rng';")) {
  const anchor = "import { applyEffects } from './effects';\n";
  if (!resolution.includes(anchor)) fail('resolution.ts: import applyEffects introuvable.');
  resolution = resolution.replace(anchor, anchor + "import { nextRandom } from './rng';\n");
}

if (!resolution.includes('const afterSystemResolution =')) {
  const oldBlock = `  const afterEffects = applyEffects(state, catalog, outcome.effects, {
    sourceEventId: event.id,
    sourceChoiceId: choiceId,
  });
  let resolvedState: GameState = {
    ...afterEffects,
    history: [
      ...afterEffects.history,
      { eventId: event.id, choiceId, outcomeId: outcome.id, ageMonths: afterEffects.ageMonths },
    ],
    scheduledEvents: consumeScheduledEntry(afterEffects, catalog, event, state.ageMonths),
  };
`;

  const newBlock = `  const afterEffects = applyEffects(state, catalog, outcome.effects, {
    sourceEventId: event.id,
    sourceChoiceId: choiceId,
  });
  const afterSystemResolution =
    event.id === 'origin_sea'
      ? assignRandomBirthLocation(afterEffects, catalog)
      : afterEffects;
  let resolvedState: GameState = {
    ...afterSystemResolution,
    history: [
      ...afterSystemResolution.history,
      { eventId: event.id, choiceId, outcomeId: outcome.id, ageMonths: afterSystemResolution.ageMonths },
    ],
    scheduledEvents: consumeScheduledEntry(afterSystemResolution, catalog, event, state.ageMonths),
  };
`;

  if (!resolution.includes(oldBlock)) fail('resolution.ts: bloc finalizeOutcome attendu introuvable.');
  resolution = resolution.replace(oldBlock, newBlock);
}

if (!resolution.includes('function assignRandomBirthLocation(')) {
  const anchor = 'function applyChoiceInput(';
  const i = resolution.indexOf(anchor);
  if (i < 0) fail('resolution.ts: applyChoiceInput introuvable.');

  const helper = `function assignRandomBirthLocation(state: GameState, catalog: ContentCatalog): GameState {
  const seaId = state.player.profile.originSeaId;
  if (seaId === null) {
    throw new Error('Cannot assign a Birth Location before originSeaId is set.');
  }

  const candidates = catalog.locations
    .filter((location) => location.canBeBirthLocation && location.seaId === seaId)
    .map((location) => location.id)
    .sort();

  if (candidates.length !== 8) {
    throw new Error(\`Expected exactly 8 Birth Locations for "\${seaId}", found \${candidates.length}.\`);
  }

  const random = nextRandom(state.rngState);
  const locationId = candidates[Math.floor(random.value * candidates.length)];

  return {
    ...state,
    rngState: random.nextState,
    locationId,
    travelState: 'on_land',
  };
}

`;

  resolution = resolution.slice(0, i) + helper + resolution.slice(i);
}

write(resolutionPath, resolution);

console.log('[2/7] Origins transition + suppression origin_birthplace');

const transitionPath = 'src/game/content/events/origins/origin_to_childhood.json';
const transition = JSON.parse(read(transitionPath));

if (transition.eligibility?.type !== 'all' || !Array.isArray(transition.eligibility.conditions)) {
  fail('origin_to_childhood.json: eligibility inattendue.');
}
const played = transition.eligibility.conditions.find((c) => c.type === 'hasPlayed');
if (!played) fail('origin_to_childhood.json: hasPlayed introuvable.');
played.eventId = 'origin_sea';

if (!transition.choices?.[0]?.resolution?.outcome) {
  fail('origin_to_childhood.json: outcome introuvable.');
}
transition.choices[0].resolution.outcome.effects = [
  { type: 'setCareerPhase', phase: 'childhood' },
];
write(transitionPath, JSON.stringify(transition, null, 2) + '\n');

const birthplacePath = 'src/game/content/events/origins/origin_birthplace.json';
if (fs.existsSync(birthplacePath)) {
  fs.unlinkSync(birthplacePath);
  console.log('  origin_birthplace.json supprimé');
}

console.log('[3/7] Locales');

const localeDir = 'src/game/localization/locales';
for (const file of fs.readdirSync(localeDir).filter((f) => f.endsWith('.json'))) {
  const p = path.join(localeDir, file);
  const data = JSON.parse(read(p));
  let removed = 0;
  for (const key of Object.keys(data)) {
    if (key.startsWith('event.origin_birthplace.')) {
      delete data[key];
      removed++;
    }
  }
  write(p, JSON.stringify(data, null, 2) + '\n');
  console.log(`  ${file}: ${removed} clé(s) supprimée(s)`);
}

console.log('[4/7] Tests Origins');

const originsRulesPath = 'tests/originsRules.test.ts';
let originsRules = read(originsRulesPath);
originsRules = originsRules.replace(
  "import { evaluateCondition, getChoiceState } from '../src/game/engine/conditions';",
  "import { evaluateCondition } from '../src/game/engine/conditions';"
);
originsRules = originsRules.replace(
  "it('exposes new profile dimensions to Conditions and only the compatible birthplace Choice'",
  "it('exposes new profile dimensions to Conditions'"
);
originsRules = originsRules.replace(
  /\n    const birthplace = contentCatalog\.events\.find\(\(\{ id \}\) => id === 'origin_birthplace'\)!;\n    expect\(birthplace\.choices\.filter\(\(choice\) => getChoiceState\(choice, state, contentCatalog\)\.visible\)\.map\(\(\{ id \}\) => id\)\)\.toEqual\(\['north_blue_port'\]\);/,
  ''
);
if (originsRules.includes('origin_birthplace') || originsRules.includes('getChoiceState')) {
  fail('originsRules.test.ts: ancien test birthplace encore présent.');
}
write(originsRulesPath, originsRules);

const gameSessionPath = 'tests/gameSession.test.ts';
let gameSession = read(gameSessionPath);

const oldFlow = `    expect(session.gameState?.currentEventId).toBe('origin_birthplace');
    expect(() => choose(session, 'west_blue_port')).toThrow('is not available');

    session = choose(session, 'east_blue_port');
    session = choose(session, 'begin_childhood');
`;

const newFlow = `    expect(session.gameState?.currentEventId).toBe('origin_to_childhood');

    const birthLocation = contentCatalog.locations.find(({ id }) => id === session.gameState?.locationId);
    expect(birthLocation).toMatchObject({ seaId: 'east_blue', canBeBirthLocation: true });

    session = choose(session, 'begin_childhood');
`;

if (gameSession.includes(oldFlow)) {
  gameSession = gameSession.replace(oldFlow, newFlow);
} else if (gameSession.includes('origin_birthplace') || gameSession.includes("choose(session, 'east_blue_port')")) {
  fail('gameSession.test.ts: bloc Origins inattendu.');
}
gameSession = gameSession.replace("      locationId: 'foosha_village',", "      locationId: expect.any(String),");
write(gameSessionPath, gameSession);

const originsCareerPath = 'tests/originsCareer.test.ts';
let originsCareer = read(originsCareerPath);
originsCareer = originsCareer.replace("      locationId: 'foosha_village',", "      locationId: expect.any(String),");
write(originsCareerPath, originsCareer);

const eventCatalogPath = 'tests/eventCatalog.test.ts';
let eventCatalog = read(eventCatalogPath);
eventCatalog = eventCatalog
  .split('\n')
  .filter((line) => !line.includes("'origin_birthplace'"))
  .join('\n');
write(eventCatalogPath, eventCatalog);

console.log('[5/7] GAME_DESIGN');

const gdPath = 'docs/GAME_DESIGN.md';
let gd = read(gdPath);

gd = gd.replace(
  '**Nom → Race → Structure familiale → Affiliation familiale → Niveau social → Mer d’origine → Lieu de naissance**',
  '**Nom → Race → Structure familiale → Affiliation familiale → Niveau social → Mer d’origine**'
);

const yearZero = 'Il n’existe aucun Event « année 0 ».';
if (gd.includes(yearZero) && !gd.includes('8 Birth Locations valides de cette Blue')) {
  gd = gd.replace(
    yearZero,
    yearZero + ' Après le choix de la mer d’origine, le système sélectionne immédiatement et de manière seedée uniforme le lieu de naissance parmi les **8 Birth Locations valides de cette Blue** ; ce choix n’est pas présenté comme un Event ou une question au joueur.'
  );
}

const oldBirthParagraph = 'Le lieu de naissance est une vraie Location du catalogue rattachée à la mer choisie ; il devient la `locationId` du joueur sans modifier ses statistiques.';
const newBirthParagraph = 'Après le choix de la mer, le runtime tire de manière seedée uniforme une vraie Location parmi les exactement **8 Locations `canBeBirthLocation`** de la Blue choisie. Cette Location devient immédiatement la `locationId` du joueur sans modifier ses statistiques.';
gd = gd.replace(oldBirthParagraph, newBirthParagraph);

write(gdPath, gd);

console.log('[6/7] Contrôle résidus');

const textExtensions = new Set(['.ts', '.tsx', '.js', '.cjs', '.mjs', '.json', '.md']);
const hits = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p);
    } else if (textExtensions.has(path.extname(entry.name))) {
      const s = read(p);
      if (s.includes('origin_birthplace')) hits.push(p);
    }
  }
}

for (const root of ['src', 'tests', 'scripts', 'docs']) walk(root);

if (hits.length) {
  console.error('Références origin_birthplace restantes:');
  hits.forEach((p) => console.error(`  ${p}`));
  process.exit(1);
}
console.log('  zéro référence origin_birthplace');

console.log('[7/7] Validation');
run('npm.cmd', ['run', 'validate-content']);
run('npm.cmd', ['test']);
run('npm.cmd', ['run', 'build']);

console.log('\nOK — Birth Location fix terminé, tests et build verts.');
