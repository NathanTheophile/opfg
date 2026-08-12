#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');
const root = process.cwd();

function rel(p) { return path.relative(root, p).split(path.sep).join('/'); }
function fail(message) { throw new Error(`[D2 Wave 3] ${message}`); }
function read(p) { if (!fs.existsSync(p)) fail(`Missing ${rel(p)}`); return fs.readFileSync(p, 'utf8'); }
function write(p, content) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content, 'utf8'); }
function replaceOnce(text, needle, replacement, label) {
  const first = text.indexOf(needle);
  if (first < 0) fail(`Could not find anchor for ${label}`);
  if (text.indexOf(needle, first + needle.length) >= 0) fail(`Anchor for ${label} is not unique`);
  return text.slice(0, first) + replacement + text.slice(first + needle.length);
}
function replaceRegexOnce(text, regex, replacement, label) {
  const matches = [...text.matchAll(new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g'))];
  if (matches.length !== 1) fail(`Expected exactly one match for ${label}, found ${matches.length}`);
  return text.replace(regex, replacement);
}
function updateFile(p, transform) {
  const rawBefore = read(p);
  const before = rawBefore.replace(/\r\n/g, '\n');
  const after = transform(before);
  if (after === before) return false;
  if (!checkOnly) write(p, after);
  console.log(`${checkOnly ? 'CHECK' : 'UPDATE'} ${rel(p)}`);
  return true;
}
function writeNew(p, content) {
  if (fs.existsSync(p)) {
    const current = read(p);
    if (current === content) return false;
    fail(`Refusing to overwrite existing non-identical file ${rel(p)}`);
  }
  if (!checkOnly) write(p, content);
  console.log(`${checkOnly ? 'CHECK' : 'CREATE'} ${rel(p)}`);
  return true;
}

const files = {
  schema: path.join(root, 'src/game/content/schema.ts'),
  catalogFactory: path.join(root, 'src/game/content/catalogFactory.ts'),
  events: path.join(root, 'src/game/engine/events.ts'),
  conditions: path.join(root, 'src/game/engine/conditions.ts'),
  effects: path.join(root, 'src/game/engine/effects.ts'),
  ship: path.join(root, 'src/game/engine/ship.ts'),
  save: path.join(root, 'src/game/engine/save.ts'),
  initialState: path.join(root, 'src/game/model/initialState.ts'),
  validation: path.join(root, 'src/game/validation/validateContent.ts'),
  originRace: path.join(root, 'src/game/content/events/origins/origin_race.json'),
  originAffiliation: path.join(root, 'src/game/content/events/origins/origin_affiliation.json'),
  gameDesign: path.join(root, 'docs/GAME_DESIGN.md'),
  contentBible: path.join(root, 'docs/content/CONTENT_BIBLE.md'),
  majorTracksDoc: path.join(root, 'docs/design/MAJOR_NARRATIVE_TRACKS.md'),
  localization: path.join(root, 'docs/LOCALIZATION.md'),
};

for (const p of Object.values(files)) read(p);

const economyPath = path.join(root, 'src/game/engine/economy.ts');
const alreadyApplied = read(files.schema).includes('export const CONTENT_SCHEMA_VERSION = 11;')
  && read(files.schema).includes('majorNarrativeTracks: MajorNarrativeTrackDefinition[];')
  && fs.existsSync(economyPath);
if (alreadyApplied) {
  console.log('[D2 Wave 3] Already applied; no changes required.');
  process.exit(0);
}

console.log('D2 Wave 3 — platform foundation');
console.log(checkOnly ? 'Mode: CHECK ONLY' : 'Mode: APPLY');
console.log('');

updateFile(files.schema, (text) => {
  text = replaceOnce(text, 'export const CONTENT_SCHEMA_VERSION = 10;', 'export const CONTENT_SCHEMA_VERSION = 11;', 'schema version');

  const insertionAnchor = "export type OpeningRole =\n  typeof OPENING_ROLES[number];\n\n";
  const insertion = `${insertionAnchor}export const MAJOR_NARRATIVE_TRACK_TYPES = ['family_legacy', 'personal_affiliation'] as const;\nexport type MajorNarrativeTrackType = typeof MAJOR_NARRATIVE_TRACK_TYPES[number];\n\nexport interface MajorNarrativeChapterDefinition {\n  id: string;\n  phase: CareerPhase;\n  dueAgeMonths: number;\n}\n\nexport interface MajorNarrativeTrackDefinition {\n  id: string;\n  type: MajorNarrativeTrackType;\n  eligibility: Condition;\n  chapters: MajorNarrativeChapterDefinition[];\n}\n\nexport interface MajorTrackEventRef {\n  trackId: string;\n  chapterId: string;\n  fallback?: true;\n}\n\nexport const ITEM_CATEGORIES = ['key', 'document', 'material', 'trade_good', 'consumable', 'equipment', 'treasure', 'devil_fruit'] as const;\nexport type ItemCategory = typeof ITEM_CATEGORIES[number];\n\nexport interface ItemMarketDefinition {\n  serviceId: LocationServiceId;\n  basePriceBerries: number;\n}\n\nexport interface EconomyDefinition {\n  defaultSellRatePercent: number;\n}\n\n`;
  text = replaceOnce(text, insertionAnchor, insertion, 'major track/item type insertion');

  text = replaceOnce(text,
    "  | { type: 'hasItem'; itemId: ItemId }\n  | { type: 'berriesAtLeast'; value: number }",
    "  | { type: 'hasItem'; itemId: ItemId }\n  | { type: 'itemQuantityAtLeast'; itemId: ItemId; quantity: number }\n  | { type: 'inventoryFreeSlotsAtLeast'; value: number }\n  | { type: 'canBuyItem'; itemId: ItemId; quantity: number }\n  | { type: 'canSellItem'; itemId: ItemId; quantity: number }\n  | { type: 'berriesAtLeast'; value: number }",
    'item conditions');

  text = replaceOnce(text,
    "  | { type: 'raceIs'; raceId: RaceId }\n  | { type: 'originSeaIs'; seaId: SeaId }\n  | { type: 'affiliationIs'; affiliationId: AffiliationId }",
    "  | { type: 'raceIs'; raceId: RaceId }\n  | { type: 'racePlayableV1'; raceId: RaceId }\n  | { type: 'originSeaIs'; seaId: SeaId }\n  | { type: 'affiliationIs'; affiliationId: AffiliationId }\n  | { type: 'affiliationPlayableV1'; affiliationId: AffiliationId }",
    'origin playable conditions');

  text = replaceOnce(text,
    "  | { type: 'addItem'; itemId: ItemId; quantity: number }\n  | { type: 'removeItem'; itemId: ItemId; quantity: number }",
    "  | { type: 'addItem'; itemId: ItemId; quantity: number }\n  | { type: 'removeItem'; itemId: ItemId; quantity: number }\n  | { type: 'buyItem'; itemId: ItemId; quantity: number }\n  | { type: 'sellItem'; itemId: ItemId; quantity: number }",
    'economy effects');

  text = replaceOnce(text,
    "  | (EventBase & { kind: 'normal'; lifetimeThreadSeed?: true; replay?: { cooldownMonths: number; maxOccurrences?: number } })",
    "  | (EventBase & { kind: 'normal'; lifetimeThreadSeed?: true; majorTrack?: MajorTrackEventRef; replay?: { cooldownMonths: number; maxOccurrences?: number } })",
    'normal event majorTrack metadata');

  text = replaceOnce(text,
    "export interface ItemDefinition {\n  id: ItemId;\n  nameKey: LocalizationKey;\n}",
    "export interface ItemDefinition {\n  id: ItemId;\n  nameKey: LocalizationKey;\n  category: ItemCategory;\n  stackLimit: number;\n  market: ItemMarketDefinition | null;\n}",
    'item definition');

  text = replaceOnce(text,
    "export interface RaceDefinition { id: RaceId; nameKey: LocalizationKey; initialHealth: number; attributeModifiers: Partial<Record<StatId, number>> }\nexport interface SeaDefinition { id: SeaId; nameKey: LocalizationKey }\nexport interface AffiliationDefinition { id: AffiliationId; nameKey: LocalizationKey }",
    "export interface RaceDefinition { id: RaceId; nameKey: LocalizationKey; playableV1: boolean; initialHealth: number; attributeModifiers: Partial<Record<StatId, number>> }\nexport interface SeaDefinition { id: SeaId; nameKey: LocalizationKey }\nexport interface AffiliationDefinition { id: AffiliationId; nameKey: LocalizationKey; playableV1: boolean }",
    'playable origin definitions');

  text = replaceOnce(text,
    "  locations: LocationDefinition[];\n  traits: TraitDefinition[];\n  items: ItemDefinition[];",
    "  locations: LocationDefinition[];\n  traits: TraitDefinition[];\n  economy: EconomyDefinition;\n  items: ItemDefinition[];",
    'catalog economy field');

  text = replaceOnce(text,
    "  npcs: NpcDefinition[];\n  events: EventDefinition[];",
    "  npcs: NpcDefinition[];\n  majorNarrativeTracks: MajorNarrativeTrackDefinition[];\n  events: EventDefinition[];",
    'catalog major tracks field');
  return text;
});

updateFile(files.catalogFactory, (text) => {
  const playableRaces = new Set(['human', 'fishman', 'mink', 'giant']);
  for (const id of ['human', 'fishman', 'mink', 'giant', 'longarm', 'buccaneer']) {
    const marker = `{ id: '${id}', nameKey: raceNameKey('${id}'),`;
    const replacement = `{ id: '${id}', nameKey: raceNameKey('${id}'), playableV1: ${playableRaces.has(id) ? 'true' : 'false'},`;
    text = replaceOnce(text, marker, replacement, `race playableV1 ${id}`);
  }

  text = replaceOnce(text,
    "    affiliations: ['civilian', 'marine', 'pirate', 'revolutionary', 'bandit', 'prisoner', 'slave', 'celestial_dragon', 'royal_family'].map((id) => ({ id, nameKey: affiliationNameKey(id) })),",
    "    affiliations: ['civilian', 'marine', 'pirate', 'revolutionary', 'bandit', 'prisoner', 'slave', 'celestial_dragon', 'royal_family'].map((id) => ({ id, nameKey: affiliationNameKey(id), playableV1: ['civilian', 'marine', 'pirate', 'revolutionary', 'royal_family'].includes(id) })),",
    'affiliation playableV1');

  text = replaceOnce(text,
    "    items: [\n      { id: 'sealed_chart', nameKey: itemNameKey('sealed_chart') },\n      { id: 'mira_letter_of_passage', nameKey: itemNameKey('mira_letter_of_passage') },\n      { id: 'timber', nameKey: itemNameKey('timber') },\n      ...devilFruits.filter(({ playableV1 }) => playableV1).map(({ itemId }) => ({ id: itemId!, nameKey: itemNameKey(itemId!) })),\n    ],",
    "    economy: { defaultSellRatePercent: 50 },\n    items: [\n      { id: 'sealed_chart', nameKey: itemNameKey('sealed_chart'), category: 'document', stackLimit: 1, market: null },\n      { id: 'mira_letter_of_passage', nameKey: itemNameKey('mira_letter_of_passage'), category: 'document', stackLimit: 1, market: null },\n      { id: 'timber', nameKey: itemNameKey('timber'), category: 'material', stackLimit: 20, market: { serviceId: 'trade', basePriceBerries: 500 } },\n      ...devilFruits.filter(({ playableV1 }) => playableV1).map(({ itemId }) => ({ id: itemId!, nameKey: itemNameKey(itemId!), category: 'devil_fruit' as const, stackLimit: 1, market: null })),\n    ],",
    'economy and item definitions');

  text = replaceOnce(text,
    "    events,\n  };",
    "    majorNarrativeTracks: [],\n    events,\n  };",
    'majorNarrativeTracks catalog');
  return text;
});

updateFile(files.conditions, (text) => {
  text = replaceOnce(text,
    "import { availableCargoSlots, canAcquireShip, canRecruitNpc, countCurrentCrew, findShipDefinition } from './ship';",
    "import { availableCargoSlots, canAcquireShip, canRecruitNpc, countCurrentCrew, findShipDefinition } from './ship';\nimport { canBuyItem, canSellItem, inventoryFreeSlots, itemQuantity } from './economy';",
    'economy condition imports');

  text = replaceOnce(text,
    "    case 'hasItem':\n      return state.player.inventory.stacks.some(({ itemId }) => itemId === condition.itemId);\n    case 'berriesAtLeast':",
    "    case 'hasItem':\n      return itemQuantity(state.player.inventory.stacks, condition.itemId) > 0;\n    case 'itemQuantityAtLeast':\n      return itemQuantity(state.player.inventory.stacks, condition.itemId) >= condition.quantity;\n    case 'inventoryFreeSlotsAtLeast':\n      return inventoryFreeSlots(state.player.inventory) >= condition.value;\n    case 'canBuyItem':\n      return catalog !== undefined && canBuyItem(state, catalog, condition.itemId, condition.quantity);\n    case 'canSellItem':\n      return catalog !== undefined && canSellItem(state, catalog, condition.itemId, condition.quantity);\n    case 'berriesAtLeast':",
    'economy condition cases');

  text = replaceOnce(text,
    "    case 'raceIs':\n      return state.player.profile.raceId !== null && state.player.profile.raceId === condition.raceId;\n    case 'originSeaIs':",
    "    case 'raceIs':\n      return state.player.profile.raceId !== null && state.player.profile.raceId === condition.raceId;\n    case 'racePlayableV1':\n      return catalog?.races.find(({ id }) => id === condition.raceId)?.playableV1 === true;\n    case 'originSeaIs':",
    'race playable condition case');

  text = replaceOnce(text,
    "    case 'affiliationIs':\n      return state.player.profile.affiliationId !== null && state.player.profile.affiliationId === condition.affiliationId;\n    case 'familyStructureIs':",
    "    case 'affiliationIs':\n      return state.player.profile.affiliationId !== null && state.player.profile.affiliationId === condition.affiliationId;\n    case 'affiliationPlayableV1':\n      return catalog?.affiliations.find(({ id }) => id === condition.affiliationId)?.playableV1 === true;\n    case 'familyStructureIs':",
    'affiliation playable condition case');
  return text;
});

updateFile(files.ship, (text) => {
  text = replaceOnce(text,
    "export function addStack(stacks: ItemStack[], itemId: ItemId, quantity: number, capacity: number): void {\n  assertQuantity(quantity);\n  const existing = stacks.find((stack) => stack.itemId === itemId);\n  if (existing) {\n    existing.quantity += quantity;\n    return;\n  }\n  if (stacks.length >= capacity) throw new Error(`No free inventory slot for Item \"${itemId}\".`);\n  stacks.push({ itemId, quantity });\n}",
    "export function addStack(stacks: ItemStack[], itemId: ItemId, quantity: number, capacity: number, stackLimit = Number.MAX_SAFE_INTEGER): void {\n  assertQuantity(quantity);\n  if (!Number.isInteger(stackLimit) || stackLimit <= 0) throw new Error('Item stack limit must be a positive integer.');\n  const existing = stacks.find((stack) => stack.itemId === itemId);\n  if (existing) {\n    if (existing.quantity + quantity > stackLimit) throw new Error(`Item \"${itemId}\" exceeds stack limit ${stackLimit}.`);\n    existing.quantity += quantity;\n    return;\n  }\n  if (quantity > stackLimit) throw new Error(`Item \"${itemId}\" exceeds stack limit ${stackLimit}.`);\n  if (stacks.length >= capacity) throw new Error(`No free inventory slot for Item \"${itemId}\".`);\n  stacks.push({ itemId, quantity });\n}",
    'stack limit enforcement');
  return text;
});

const economyTs = `import type { ContentCatalog, ItemDefinition } from '../content/schema';\nimport type { GameState, InventoryState, ItemId, ItemStack } from '../model/schema';\nimport { addStack, removeStack } from './ship';\n\nexport function findItemDefinition(catalog: ContentCatalog, itemId: ItemId): ItemDefinition {\n  const definition = catalog.items.find(({ id }) => id === itemId);\n  if (!definition) throw new Error(\`Unknown Item "\${itemId}".\`);\n  return definition;\n}\n\nexport function itemQuantity(stacks: readonly ItemStack[], itemId: ItemId): number {\n  return stacks.find((stack) => stack.itemId === itemId)?.quantity ?? 0;\n}\n\nexport function inventoryFreeSlots(inventory: InventoryState): number {\n  return Math.max(0, inventory.capacity - inventory.stacks.length);\n}\n\nexport function itemBuyPrice(catalog: ContentCatalog, itemId: ItemId, quantity = 1): number {\n  assertQuantity(quantity);\n  const market = findItemDefinition(catalog, itemId).market;\n  if (market === null) throw new Error(\`Item "\${itemId}" has no generic market price.\`);\n  return market.basePriceBerries * quantity;\n}\n\nexport function itemSellPrice(catalog: ContentCatalog, itemId: ItemId, quantity = 1): number {\n  assertQuantity(quantity);\n  const definition = findItemDefinition(catalog, itemId);\n  if (definition.market === null) throw new Error(\`Item "\${itemId}" has no generic market price.\`);\n  const unit = Math.max(1, Math.floor(definition.market.basePriceBerries * catalog.economy.defaultSellRatePercent / 100));\n  return unit * quantity;\n}\n\nexport function canBuyItem(state: GameState, catalog: ContentCatalog, itemId: ItemId, quantity = 1): boolean {\n  if (!Number.isInteger(quantity) || quantity <= 0) return false;\n  const definition = catalog.items.find(({ id }) => id === itemId);\n  if (!definition?.market) return false;\n  const location = catalog.locations.find(({ id }) => id === state.locationId);\n  if (!location?.services.includes(definition.market.serviceId)) return false;\n  if (state.berries < definition.market.basePriceBerries * quantity) return false;\n  const existing = state.player.inventory.stacks.find((stack) => stack.itemId === itemId);\n  if (existing) return existing.quantity + quantity <= definition.stackLimit;\n  return state.player.inventory.stacks.length < state.player.inventory.capacity && quantity <= definition.stackLimit;\n}\n\nexport function canSellItem(state: GameState, catalog: ContentCatalog, itemId: ItemId, quantity = 1): boolean {\n  if (!Number.isInteger(quantity) || quantity <= 0) return false;\n  const definition = catalog.items.find(({ id }) => id === itemId);\n  if (!definition?.market) return false;\n  const location = catalog.locations.find(({ id }) => id === state.locationId);\n  return location?.services.includes(definition.market.serviceId) === true\n    && itemQuantity(state.player.inventory.stacks, itemId) >= quantity;\n}\n\nexport function buyItem(state: GameState, catalog: ContentCatalog, itemId: ItemId, quantity = 1): void {\n  if (!canBuyItem(state, catalog, itemId, quantity)) throw new Error(\`Item "\${itemId}" cannot be bought in the current state.\`);\n  const definition = findItemDefinition(catalog, itemId);\n  state.berries -= itemBuyPrice(catalog, itemId, quantity);\n  addStack(state.player.inventory.stacks, itemId, quantity, state.player.inventory.capacity, definition.stackLimit);\n}\n\nexport function sellItem(state: GameState, catalog: ContentCatalog, itemId: ItemId, quantity = 1): void {\n  if (!canSellItem(state, catalog, itemId, quantity)) throw new Error(\`Item "\${itemId}" cannot be sold in the current state.\`);\n  removeStack(state.player.inventory.stacks, itemId, quantity);\n  state.berries += itemSellPrice(catalog, itemId, quantity);\n}\n\nfunction assertQuantity(quantity: number): void {\n  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('Item quantity must be a positive integer.');\n}\n`;
writeNew(path.join(root, 'src/game/engine/economy.ts'), economyTs);

updateFile(files.effects, (text) => {
  text = replaceOnce(text,
    "import { ensureNpcMaterialized } from './npcNames';",
    "import { ensureNpcMaterialized } from './npcNames';\nimport { buyItem, findItemDefinition, sellItem } from './economy';",
    'economy effect imports');

  text = replaceOnce(text,
    "    case 'addItem':\n      addStack(state.player.inventory.stacks, effect.itemId, effect.quantity, state.player.inventory.capacity);\n      return;\n    case 'removeItem':\n      removeStack(state.player.inventory.stacks, effect.itemId, effect.quantity);\n      return;",
    "    case 'addItem': {\n      const definition = findItemDefinition(catalog, effect.itemId);\n      addStack(state.player.inventory.stacks, effect.itemId, effect.quantity, state.player.inventory.capacity, definition.stackLimit);\n      return;\n    }\n    case 'removeItem':\n      removeStack(state.player.inventory.stacks, effect.itemId, effect.quantity);\n      return;\n    case 'buyItem':\n      buyItem(state, catalog, effect.itemId, effect.quantity);\n      return;\n    case 'sellItem':\n      sellItem(state, catalog, effect.itemId, effect.quantity);\n      return;",
    'economy effect cases');

  text = replaceOnce(text,
    "      addStack(state.ship.cargo, effect.itemId, effect.quantity, findShipDefinition(catalog, state.ship.shipId).cargoSlots - state.passengerNpcIds.length);",
    "      addStack(state.ship.cargo, effect.itemId, effect.quantity, findShipDefinition(catalog, state.ship.shipId).cargoSlots - state.passengerNpcIds.length, findItemDefinition(catalog, effect.itemId).stackLimit);",
    'cargo stack limit');

  text = replaceOnce(text,
    "      const race = catalog.races.find(({ id }) => id === effect.raceId);\n      if (!race) throw new Error(`Unknown Race \"${effect.raceId}\".`);",
    "      const race = catalog.races.find(({ id }) => id === effect.raceId);\n      if (!race) throw new Error(`Unknown Race \"${effect.raceId}\".`);\n      if (!race.playableV1) throw new Error(`Race \"${effect.raceId}\" is locked for the current V1 content surface.`);",
    'setRace V1 invariant');

  text = replaceOnce(text,
    "    case 'setAffiliation':\n      state.player.profile.affiliationId = effect.affiliationId;\n      return;",
    "    case 'setAffiliation': {\n      const affiliation = catalog.affiliations.find(({ id }) => id === effect.affiliationId);\n      if (!affiliation) throw new Error(`Unknown Affiliation \"${effect.affiliationId}\".`);\n      if (!affiliation.playableV1) throw new Error(`Affiliation \"${effect.affiliationId}\" is locked for the current V1 content surface.`);\n      state.player.profile.affiliationId = effect.affiliationId;\n      return;\n    }",
    'setAffiliation V1 invariant');
  return text;
});

const eventsTs = `import type { ContentCatalog, EventDefinition, MajorNarrativeTrackDefinition } from '../content/schema';\ntype ScheduledDefinition = Extract<EventDefinition, { kind: 'scheduled' }>;\ntype NormalDefinition = Extract<EventDefinition, { kind: 'normal' }>;\nimport type { GameState, ScheduledEvent } from '../model/schema';\nimport { evaluateCondition } from './conditions';\nimport { nextRandom } from './rng';\nimport { materializeEventCast } from './npcNames';\nimport { needsMonthlyNavigationDecision } from './navigation';\nimport { finalizePendingSlot } from './time';\nimport { findDockableAccess } from './locations';\nimport { countFallbackStreak } from './maritime';\n\nexport const FALLBACK_EVENT_IDS = ['dead_end_on_land', 'dead_end_at_sea'] as const;\nconst SHIP_MARKET_PURCHASE_EVENT_ID = 'active_port_trade_01_ship_purchase_offer';\n\ninterface DueMajorSelection {\n  candidates: NormalDefinition[];\n  overdue: boolean;\n}\n\nexport function selectNextEvent(state: GameState, catalog: ContentCatalog): GameState {\n  if (state.careerStatus !== 'active') return { ...state, currentEventId: null };\n\n  const critical = findCriticalEvent(state, catalog.events);\n  if (critical) return selectEvent(state, catalog, critical);\n\n  if (needsMonthlyNavigationDecision(state)) return { ...state, currentEventId: null };\n\n  if (state.immediateEventQueue.length > 0) {\n    const immediateId = state.immediateEventQueue[0];\n    const immediate = catalog.events.find((event) => event.id === immediateId && event.kind === 'immediate');\n    if (!immediate) throw new Error(\`Pending Immediate Event "\${immediateId}" is missing or is not immediate.\`);\n    if (!isEligible(immediate, state, catalog)) {\n      const skipped = { ...state, immediateEventQueue: state.immediateEventQueue.slice(1) };\n      return selectNextEvent(skipped.immediateEventQueue.length === 0 ? finalizePendingSlot(skipped, catalog) : skipped, catalog);\n    }\n    return selectEvent(state, catalog, immediate);\n  }\n\n  if (state.shipMarketArrivalPending) {\n    state = { ...state, shipMarketArrivalPending: false };\n    const location = catalog.locations.find(({ id }) => id === state.locationId);\n    const purchase = catalog.events.find((event): event is NormalDefinition => event.id === SHIP_MARKET_PURCHASE_EVENT_ID && event.kind === 'normal');\n    if (\n      state.careerPhase === 'active'\n      && state.ship === null\n      && state.travelState === 'on_land'\n      && location !== undefined\n      && location.shipMarket !== 'none'\n      && purchase !== undefined\n      && purchase.majorTrack === undefined\n      && isEligible(purchase, state, catalog)\n    ) return selectEvent(state, catalog, purchase);\n  }\n\n  const major = findDueMajorNarrativeCandidates(state, catalog);\n  if (major?.overdue) return selectUniformNormal(state, catalog, state.scheduledEvents, major.candidates);\n\n  const scheduled = selectScheduledEvent(state, catalog);\n  if (scheduled.event) return selectEvent({ ...state, scheduledEvents: scheduled.entries }, catalog, scheduled.event);\n\n  if (major) return selectUniformNormal(state, catalog, scheduled.entries, major.candidates);\n\n  const candidates = catalog.events.filter((event): event is NormalDefinition =>\n    event.kind === 'normal'\n      && event.majorTrack === undefined\n      && event.id !== SHIP_MARKET_PURCHASE_EVENT_ID\n      && !FALLBACK_EVENT_IDS.includes(event.id as typeof FALLBACK_EVENT_IDS[number])\n      && isNormalOccurrenceEligible(event, state)\n      && isEligible(event, state, catalog),\n  );\n  if (candidates.length === 0) {\n    if (state.careerPhase !== 'active') return { ...state, scheduledEvents: scheduled.entries, currentEventId: null };\n    const fallbackId = state.travelState === 'at_sea' ? 'dead_end_at_sea' : 'dead_end_on_land';\n    const fallback = catalog.events.find((event) => event.id === fallbackId && event.kind === 'normal');\n    const accessible = state.travelState === 'at_sea' || findDockableAccess(catalog, state.locationId) !== undefined;\n    return fallback && accessible\n      ? selectEvent({ ...state, scheduledEvents: scheduled.entries }, catalog, fallback)\n      : { ...state, scheduledEvents: scheduled.entries, currentEventId: null };\n  }\n\n  return selectUniformNormal(state, catalog, scheduled.entries, candidates);\n}\n\nfunction findDueMajorNarrativeCandidates(state: GameState, catalog: ContentCatalog): DueMajorSelection | undefined {\n  const eligibleTracks = catalog.majorNarrativeTracks\n    .filter((track) => evaluateCondition(track.eligibility, state, catalog))\n    .map((track) => ({ track, chapter: firstIncompleteChapter(state, catalog, track) }))\n    .filter((entry): entry is { track: MajorNarrativeTrackDefinition; chapter: MajorNarrativeTrackDefinition['chapters'][number] } => entry.chapter !== undefined)\n    .filter(({ chapter }) => chapter.phase === state.careerPhase && state.ageMonths >= chapter.dueAgeMonths)\n    .sort((a, b) => a.chapter.dueAgeMonths - b.chapter.dueAgeMonths || a.track.id.localeCompare(b.track.id));\n\n  if (eligibleTracks.length === 0) return undefined;\n  const selected = eligibleTracks[0];\n  const variants = catalog.events.filter((event): event is NormalDefinition =>\n    event.kind === 'normal'\n      && event.majorTrack?.trackId === selected.track.id\n      && event.majorTrack.chapterId === selected.chapter.id\n      && isNormalOccurrenceEligible(event, state)\n      && isEligible(event, state, catalog),\n  );\n  const specialized = variants.filter((event) => event.majorTrack?.fallback !== true);\n  const fallbacks = variants.filter((event) => event.majorTrack?.fallback === true);\n  const candidates = specialized.length > 0 ? specialized : fallbacks;\n  if (candidates.length === 0) return undefined;\n  return { candidates, overdue: state.ageMonths > selected.chapter.dueAgeMonths };\n}\n\nfunction firstIncompleteChapter(state: GameState, catalog: ContentCatalog, track: MajorNarrativeTrackDefinition): MajorNarrativeTrackDefinition['chapters'][number] | undefined {\n  const eventById = new Map(catalog.events.map((event) => [event.id, event] as const));\n  const playedChapters = new Set<string>();\n  for (const { eventId } of state.history) {\n    const event = eventById.get(eventId);\n    const ref = event?.kind === 'normal' ? event.majorTrack : undefined;\n    if (ref?.trackId === track.id) playedChapters.add(ref.chapterId);\n  }\n  return track.chapters.find(({ id }) => !playedChapters.has(id));\n}\n\nfunction selectEvent(state: GameState, catalog: ContentCatalog, event: EventDefinition): GameState {\n  return materializeEventCast({ ...state, currentEventId: event.id }, catalog, event);\n}\n\nfunction selectUniformNormal(state: GameState, catalog: ContentCatalog, scheduledEvents: ScheduledEvent[], candidates: NormalDefinition[]): GameState {\n  if (candidates.length === 1) return selectEvent({ ...state, scheduledEvents }, catalog, candidates[0]);\n  const random = nextRandom(state.rngState);\n  const selected = candidates[Math.floor(random.value * candidates.length)];\n  return selectEvent({\n    ...state,\n    scheduledEvents,\n    rngState: random.nextState,\n  }, catalog, selected);\n}\n\n/** @deprecated Lifetime Threads remain optional secondary content; they are no longer a Childhood guarantee. */\nexport function hasStartedLifetimeThread(state: GameState, catalog: ContentCatalog): boolean {\n  const seedIds = new Set(catalog.events.filter((event) => event.kind === 'normal' && event.lifetimeThreadSeed === true).map(({ id }) => id));\n  return state.history.some(({ eventId }) => seedIds.has(eventId));\n}\n\nexport function findCriticalEvent(state: GameState, events: readonly EventDefinition[]): EventDefinition | undefined {\n  const critical = events.filter((event) => event.kind === 'critical');\n  if (state.player.stats.health <= 0) return critical.find(({ trigger }) => trigger.type === 'playerHealthDepleted');\n  const deadNpcId = Object.entries(state.npcs)\n    .filter(([, npc]) => npc.status !== 'dead' && npc.stats.health <= 0)\n    .map(([npcId]) => npcId).sort()[0];\n  if (deadNpcId) return critical.find(({ trigger }) => trigger.type === 'npcHealthDepleted' && trigger.npcId === deadNpcId);\n  if (state.ship !== null && state.ship.health <= 0) return critical.find(({ trigger }) => trigger.type === 'shipDestroyed');\n  if (state.ship === null && state.travelState === 'at_sea' && state.maritimeEmergency === null) return critical.find(({ trigger }) => trigger.type === 'shipMissingAtSea');\n  if (state.pendingShip !== null) return critical.find(({ trigger }) => trigger.type === 'shipReplacementPending');\n  const fallback = critical.find(({ trigger }) => trigger.type === 'fallbackStreakAtLeast' && countFallbackStreak(state, events) >= trigger.value);\n  if (fallback) return fallback;\n  return critical.find(({ trigger }) => trigger.type === 'careerAgeAtLeast' && state.careerPhase === 'active' && state.ageMonths >= trigger.value);\n}\n\nexport function isNormalOccurrenceEligible(event: NormalDefinition, state: GameState): boolean {\n  const occurrences = state.history.filter(({ eventId }) => eventId === event.id);\n  if (event.replay === undefined) return occurrences.length === 0;\n  if (event.replay.maxOccurrences !== undefined && occurrences.length >= event.replay.maxOccurrences) return false;\n  const last = occurrences.at(-1);\n  return last === undefined || state.ageMonths - last.ageMonths >= event.replay.cooldownMonths;\n}\n\nfunction selectScheduledEvent(state: GameState, catalog: ContentCatalog): { event?: EventDefinition; entries: ScheduledEvent[] } {\n  let entries = [...state.scheduledEvents];\n  const candidates: { event: EventDefinition & { kind: 'scheduled' }; entry: ScheduledEvent }[] = [];\n  for (const entry of state.scheduledEvents) {\n    if (entry.dueAgeMonths > state.ageMonths) continue;\n    const original = catalog.events.find((event): event is ScheduledDefinition => event.id === entry.eventId && event.kind === 'scheduled');\n    if (!original) continue;\n    let event = original;\n    if (original.cancelIf && evaluateCondition(original.cancelIf, state, catalog)) {\n      if (!original.fallbackEventId) {\n        entries = removeOccurrence(entries, entry);\n        continue;\n      }\n      const fallback = catalog.events.find((candidate): candidate is ScheduledDefinition => candidate.id === original.fallbackEventId && candidate.kind === 'scheduled');\n      if (!fallback) continue;\n      event = fallback;\n    }\n    const location = catalog.locations.find(({ id }) => id === state.locationId);\n    if (location?.blocksScheduledEvents && (event.scheduledReach ?? 'normal') === 'normal') continue;\n    if (!isEligible(event, state, catalog)) continue;\n    candidates.push({ event, entry });\n  }\n  candidates.sort((a, b) => b.event.priority - a.event.priority || a.entry.dueAgeMonths - b.entry.dueAgeMonths || a.event.id.localeCompare(b.event.id));\n  return { event: candidates[0]?.event, entries };\n}\n\nfunction removeOccurrence(entries: ScheduledEvent[], target: ScheduledEvent): ScheduledEvent[] {\n  const index = entries.indexOf(target);\n  return index < 0 ? entries : entries.filter((_, candidate) => candidate !== index);\n}\n\nfunction isEligible(event: EventDefinition, state: GameState, catalog: ContentCatalog): boolean {\n  return event.eligibility === undefined || evaluateCondition(event.eligibility, state, catalog);\n}\n\nexport function findCurrentEvent(state: GameState, catalog: ContentCatalog): EventDefinition | undefined {\n  return catalog.events.find(({ id }) => id === state.currentEventId);\n}\n`;
if (!checkOnly) write(files.events, eventsTs);
console.log(`${checkOnly ? 'CHECK' : 'REPLACE'} ${rel(files.events)}`);

updateFile(files.save, (text) => replaceOnce(text, 'const CURRENT_SAVE_VERSION = 19;', 'const CURRENT_SAVE_VERSION = 20;', 'save version 20'));
updateFile(files.initialState, (text) => replaceOnce(text, '    version: 19,', '    version: 20,', 'initial state version 20'));

function gateOriginChoices(filePath, conditionType, idField) {
  const raw = read(filePath);
  const data = JSON.parse(raw);
  for (const choice of data.choices ?? []) {
    choice.availableIf = { type: conditionType, [idField]: choice.id };
  }
  const after = JSON.stringify(data, null, 2) + '\n';
  if (after !== raw) {
    if (!checkOnly) write(filePath, after);
    console.log(`${checkOnly ? 'CHECK' : 'UPDATE'} ${rel(filePath)}`);
  }
}
gateOriginChoices(files.originRace, 'racePlayableV1', 'raceId');
gateOriginChoices(files.originAffiliation, 'affiliationPlayableV1', 'affiliationId');

updateFile(files.validation, (text) => {
  text = replaceOnce(text,
    "  'hasItem',\n  'berriesAtLeast',",
    "  'hasItem',\n  'itemQuantityAtLeast',\n  'inventoryFreeSlotsAtLeast',\n  'canBuyItem',\n  'canSellItem',\n  'berriesAtLeast',",
    'validator economy conditions');
  text = replaceOnce(text,
    "  'raceIs',\n  'originSeaIs',\n  'affiliationIs',",
    "  'raceIs',\n  'racePlayableV1',\n  'originSeaIs',\n  'affiliationIs',\n  'affiliationPlayableV1',",
    'validator origin playable conditions');
  text = replaceOnce(text,
    "  'addItem',\n  'removeItem',",
    "  'addItem',\n  'removeItem',\n  'buyItem',\n  'sellItem',",
    'validator economy effects');

  text = replaceOnce(text,
    "  const itemIds = collectIds(readRecords(catalog.items, 'items', errors), 'items', errors);",
    "  const items = readRecords(catalog.items, 'items', errors);\n  const itemIds = collectIds(items, 'items', errors);\n  const majorTracks = readRecords(catalog.majorNarrativeTracks, 'majorNarrativeTracks', errors);\n  const majorTrackIds = collectIds(majorTracks, 'majorNarrativeTracks', errors);",
    'validator collect items/tracks');

  text = replaceOnce(text,
    "  const references = { eventIds, choicesByEvent, outcomesByEvent, traitIds, itemIds, devilFruitIds, shipIds, crewRoleIds, npcIds, raceIds, seaIds, affiliationIds, careerAffiliationIds, careerRankIds, careerTitleIds, endingIds, familyStructureIds, socialClassIds, locationIds, scheduledEventIds, immediateEventIds };",
    "  const references = { eventIds, choicesByEvent, outcomesByEvent, traitIds, itemIds, devilFruitIds, shipIds, crewRoleIds, npcIds, raceIds, seaIds, affiliationIds, careerAffiliationIds, careerRankIds, careerTitleIds, endingIds, familyStructureIds, socialClassIds, locationIds, scheduledEventIds, immediateEventIds, majorTrackIds, majorTracks };",
    'validator references tracks');

  text = replaceOnce(text,
    "  validateNamedDefinitions(races, 'races', errors);\n  validateNamedDefinitions(seas, 'seas', errors);\n  validateNamedDefinitions(affiliations, 'affiliations', errors);",
    "  validateNamedDefinitions(races, 'races', errors);\n  races.forEach((race, index) => { if (typeof race.playableV1 !== 'boolean') errors.push({ path: `races[${index}].playableV1`, message: 'Race requires playableV1.' }); });\n  validateNamedDefinitions(seas, 'seas', errors);\n  validateNamedDefinitions(affiliations, 'affiliations', errors);\n  affiliations.forEach((affiliation, index) => { if (typeof affiliation.playableV1 !== 'boolean') errors.push({ path: `affiliations[${index}].playableV1`, message: 'Affiliation requires playableV1.' }); });",
    'validator origin playable definitions');

  text = replaceOnce(text,
    "  validateNamedDefinitions(familyStructures, 'familyStructures', errors);",
    "  validateItemEconomy(catalog, items, errors);\n  validateMajorNarrativeTracks(majorTracks, events, references, errors);\n  validateNamedDefinitions(familyStructures, 'familyStructures', errors);",
    'validator item/track calls');

  text = replaceOnce(text,
    "  immediateEventIds: Set<string>;\n}",
    "  immediateEventIds: Set<string>;\n  majorTrackIds: Set<string>;\n  majorTracks: UnknownRecord[];\n}",
    'validator references interface');

  text = replaceOnce(text,
    "    || (event.kind !== 'normal' && (event.lifetimeThreadSeed !== undefined || event.replay !== undefined))) errors.push({ path, message: 'Invalid Event kind field combination.' });",
    "    || (event.kind !== 'normal' && (event.lifetimeThreadSeed !== undefined || event.majorTrack !== undefined || event.replay !== undefined))) errors.push({ path, message: 'Invalid Event kind field combination.' });",
    'validator majorTrack kind');

  text = replaceOnce(text,
    "  if (event.kind === 'normal' && event.lifetimeThreadSeed !== undefined && event.lifetimeThreadSeed !== true) errors.push({ path: `${path}.lifetimeThreadSeed`, message: 'lifetimeThreadSeed must be true when present.' });",
    "  if (event.kind === 'normal' && event.lifetimeThreadSeed !== undefined && event.lifetimeThreadSeed !== true) errors.push({ path: `${path}.lifetimeThreadSeed`, message: 'lifetimeThreadSeed must be true when present.' });\n  if (event.majorTrack !== undefined) {\n    if (event.kind !== 'normal' || !isRecord(event.majorTrack)) errors.push({ path: `${path}.majorTrack`, message: 'majorTrack is valid only on Normal Events and must be an object.' });\n    else {\n      const trackId = validateReference(event.majorTrack.trackId, references.majorTrackIds, 'Major Track ID', `${path}.majorTrack.trackId`, errors);\n      const track = trackId ? references.majorTracks.find((candidate) => candidate.id === trackId) : undefined;\n      if (track && Array.isArray(track.chapters)) {\n        const chapterIds = new Set(track.chapters.filter(isRecord).map((chapter) => stringValue(chapter.id)).filter((id): id is string => id !== undefined));\n        validateReference(event.majorTrack.chapterId, chapterIds, 'Major Track chapter ID', `${path}.majorTrack.chapterId`, errors);\n      }\n      if (event.majorTrack.fallback !== undefined && event.majorTrack.fallback !== true) errors.push({ path: `${path}.majorTrack.fallback`, message: 'majorTrack.fallback must be true when present.' });\n      if (event.replay !== undefined) errors.push({ path: `${path}.majorTrack`, message: 'Major Track Events cannot be replayable.' });\n      if (event.lifetimeThreadSeed === true) errors.push({ path: `${path}.majorTrack`, message: 'Major Track Events cannot also be lifetimeThreadSeed.' });\n      if (event.openingRole !== undefined) errors.push({ path: `${path}.majorTrack`, message: 'Major Track Events cannot also use legacy openingRole.' });\n    }\n  }",
    'validator majorTrack metadata');

  text = replaceOnce(text,
    "  if (['berriesAtLeast', 'crewSizeAtLeast', 'shipHealthAtLeast', 'shipHealthAtMost', 'shipCrewCapacityAtLeast', 'shipCargoSpaceAtLeast'].includes(type) && !isNonNegativeNumber(value.value)) {",
    "  if (['berriesAtLeast', 'inventoryFreeSlotsAtLeast', 'crewSizeAtLeast', 'shipHealthAtLeast', 'shipHealthAtMost', 'shipCrewCapacityAtLeast', 'shipCargoSpaceAtLeast'].includes(type) && !isNonNegativeNumber(value.value)) {",
    'validator numeric condition set');

  text = replaceOnce(text,
    "  if (type === 'raceIs') validateReference(value.raceId, references.raceIds, 'RaceId', path, errors);",
    "  if (type === 'raceIs' || type === 'racePlayableV1') validateReference(value.raceId, references.raceIds, 'RaceId', path, errors);",
    'validator race playable reference');
  text = replaceOnce(text,
    "  if (type === 'affiliationIs') validateReference(value.affiliationId, references.affiliationIds, 'AffiliationId', path, errors);",
    "  if (type === 'affiliationIs' || type === 'affiliationPlayableV1') validateReference(value.affiliationId, references.affiliationIds, 'AffiliationId', path, errors);",
    'validator affiliation playable reference');

  const conditionInsertAnchor = "  if (type === 'hasChosen') {";
  const conditionInsert = "  if (type === 'itemQuantityAtLeast' || type === 'canBuyItem' || type === 'canSellItem') {\n    validateReference(value.itemId, references.itemIds, 'ItemId', path, errors);\n    if (!Number.isInteger(value.quantity) || (value.quantity as number) <= 0) errors.push({ path, message: `${type} quantity must be a positive integer.` });\n  }\n" + conditionInsertAnchor;
  text = replaceOnce(text, conditionInsertAnchor, conditionInsert, 'validator item conditions');

  text = replaceOnce(text,
    "  if (type === 'addItem' || type === 'removeItem') {\n    validateReference(effect.itemId, references.itemIds, 'ItemId', path, errors);\n    validatePositiveQuantity(effect.quantity, path, errors);\n  }",
    "  if (['addItem', 'removeItem', 'buyItem', 'sellItem'].includes(type)) {\n    validateReference(effect.itemId, references.itemIds, 'ItemId', path, errors);\n    validatePositiveQuantity(effect.quantity, path, errors);\n  }",
    'validator item effects');

  const helperAnchor = "export function assertValidContent(catalog: unknown): void {";
  const helpers = `function validateItemEconomy(catalog: UnknownRecord, items: UnknownRecord[], errors: ContentValidationError[]): void {\n  const economy = catalog.economy;\n  if (!isRecord(economy) || !Number.isInteger(economy.defaultSellRatePercent) || (economy.defaultSellRatePercent as number) < 0 || (economy.defaultSellRatePercent as number) > 100) {\n    errors.push({ path: 'economy.defaultSellRatePercent', message: 'Economy defaultSellRatePercent must be an integer from 0 to 100.' });\n  }\n  const categories = new Set(['key', 'document', 'material', 'trade_good', 'consumable', 'equipment', 'treasure', 'devil_fruit']);\n  items.forEach((item, index) => {\n    const path = \`items[\${index}]\`;\n    if (!categories.has(String(item.category))) errors.push({ path: \`\${path}.category\`, message: 'Invalid Item category.' });\n    if (!Number.isInteger(item.stackLimit) || (item.stackLimit as number) <= 0) errors.push({ path: \`\${path}.stackLimit\`, message: 'Item stackLimit must be a positive integer.' });\n    if (item.market !== null) {\n      if (!isRecord(item.market)) errors.push({ path: \`\${path}.market\`, message: 'Item market must be null or an object.' });\n      else {\n        if (!VALID_LOCATION_SERVICES.has(String(item.market.serviceId))) errors.push({ path: \`\${path}.market.serviceId\`, message: 'Unknown market service.' });\n        if (!Number.isInteger(item.market.basePriceBerries) || (item.market.basePriceBerries as number) <= 0) errors.push({ path: \`\${path}.market.basePriceBerries\`, message: 'Item basePriceBerries must be a positive integer.' });\n      }\n    }\n  });\n}\n\nfunction validateMajorNarrativeTracks(tracks: UnknownRecord[], events: UnknownRecord[], references: References, errors: ContentValidationError[]): void {\n  const validTypes = new Set(['family_legacy', 'personal_affiliation']);\n  tracks.forEach((track, index) => {\n    const path = \`majorNarrativeTracks[\${index}]\`;\n    if (!validTypes.has(String(track.type))) errors.push({ path: \`\${path}.type\`, message: 'Invalid Major Narrative Track type.' });\n    validateCondition(track.eligibility, \`\${path}.eligibility\`, references, errors);\n    const chapters = readRecords(track.chapters, \`\${path}.chapters\`, errors);\n    const chapterIds = collectIds(chapters, \`\${path}.chapters\`, errors);\n    let previousDue = -1;\n    chapters.forEach((chapter, chapterIndex) => {\n      const chapterPath = \`\${path}.chapters[\${chapterIndex}]\`;\n      if (!['origins', 'childhood', 'active'].includes(String(chapter.phase))) errors.push({ path: \`\${chapterPath}.phase\`, message: 'Invalid chapter phase.' });\n      if (!Number.isInteger(chapter.dueAgeMonths) || (chapter.dueAgeMonths as number) < 0) errors.push({ path: \`\${chapterPath}.dueAgeMonths\`, message: 'Chapter dueAgeMonths must be a non-negative integer.' });\n      else if ((chapter.dueAgeMonths as number) <= previousDue) errors.push({ path: \`\${chapterPath}.dueAgeMonths\`, message: 'Major Track chapter checkpoints must be strictly increasing.' });\n      previousDue = Number(chapter.dueAgeMonths);\n    });\n    if (track.type === 'family_legacy') {\n      const childhood = chapters.filter((chapter) => chapter.phase === 'childhood');\n      if (childhood.length !== 5) errors.push({ path: \`\${path}.chapters\`, message: 'Family Legacy Track must define exactly 5 Childhood chapters.' });\n      if (childhood.some((chapter) => Number(chapter.dueAgeMonths) >= 180)) errors.push({ path: \`\${path}.chapters\`, message: 'Family Childhood chapters must be due before age 15.' });\n    }\n    for (const chapterId of chapterIds) {\n      const variants = events.filter((event) => isRecord(event.majorTrack) && event.majorTrack.trackId === track.id && event.majorTrack.chapterId === chapterId);\n      if (variants.length === 0) continue; // infrastructure may exist before content production\n      const fallbacks = variants.filter((event) => isRecord(event.majorTrack) && event.majorTrack.fallback === true);\n      if (fallbacks.length !== 1) errors.push({ path: \`\${path}.chapters\`, message: \`Chapter "\${chapterId}" must have exactly one fallback once variants exist.\` });\n    }\n  });\n}\n\n` + helperAnchor;
  text = replaceOnce(text, helperAnchor, helpers, 'validator helper functions');
  return text;
});

const economyDoc = `# OPFG — Economy & Items\n\n> **Status: validated D2 engine/design authority for the V2 content rebuild.**\n\n## 1. Purpose\n\nThe V2 rebuild must stop treating Items and Berrys as mostly decorative Effect payloads. Items are persistent narrative/gameplay assets and Berrys are a real constrained currency used by authored Events and generic market interactions.\n\nThis remains a narrative life-sim economy, not a trading simulator. There is no inflation model, auction house, daily upkeep or autonomous NPC economy in V1.\n\n## 2. Currency\n\n- The only V1 currency is **Berrys**.\n- Berrys can never become negative.\n- Bounty is **not money** and is never automatically paid to the player.\n- Reputation is not purchasing power.\n- Social class represents the player's **family environment**, not cash carried by the child. A wealthy Childhood profile does not automatically receive personal Berrys.\n- Income and exceptional expenses remain Event-driven.\n\n## 3. Item model\n\nEvery Item definition declares:\n\n- category;\n- stack limit;\n- optional generic market definition.\n\nV1 categories:\n\n- key;\n- document;\n- material;\n- trade_good;\n- consumable;\n- equipment;\n- treasure;\n- devil_fruit.\n\nAn Item with \`market: null\` has no generic buy/sell price. It may still be exchanged, stolen, rewarded or valued by authored Events. This is the default for quest documents, unique story objects and Devil Fruits.\n\n## 4. Inventory\n\nThe personal inventory remains slot-based and separate from ship cargo. One distinct Item type consumes one slot; quantity lives in a stack. Stack limits are now defined by the Item itself and enforced by the engine.\n\nThe current personal capacity remains **2 slots** until a later explicit inventory-expansion design decision. This makes carried objects meaningful and prevents inventory from becoming an unlimited archive.\n\nNo generic \"use item\" button is required in V1. Events consume or test Items declaratively. Equipment may unlock Choices through Item Conditions before a dedicated equipment subsystem is justified.\n\n## 5. Generic market contract\n\nA marketable Item declares:\n\n- a required Location service;\n- a base purchase price in Berrys.\n\nA generic purchase requires all of:\n\n- the current Location exposes that service;\n- enough Berrys;\n- enough inventory/stack capacity.\n\nGeneric resale uses **50% of base purchase price**, rounded down per unit with a minimum of 1 Berry for an item that has a market price.\n\nThe engine exposes atomic \`buyItem\` / \`sellItem\` Effects so money and inventory cannot partially update.\n\nAuthored exceptional deals may still use explicit narrative Effects when the fiction requires a special price, gift, theft, debt or barter.\n\n## 6. Authoring conditions\n\nV2 supports:\n\n- \`hasItem\`;\n- \`itemQuantityAtLeast\`;\n- \`inventoryFreeSlotsAtLeast\`;\n- \`canBuyItem\`;\n- \`canSellItem\`;\n- \`berriesAtLeast\`.\n\nThis is enough for Event-driven shops, bribes, travel preparation, tools, documents, materials and resource tradeoffs without adding a generic shop screen.\n\n## 7. Initial price anchor\n\nOnly existing generic material \`timber\` receives a baseline generic market price in this foundation pass: **500 Berrys per unit** at Locations with the \`trade\` service.\n\nExisting unique documents and Devil Fruit Items remain non-market by default. Future V2 Item batches must establish their prices deliberately rather than inheriting arbitrary values from legacy Events.\n\n## 8. Future extension points\n\nBefore Active content production, the economy may add:\n\n- ship purchase prices;\n- weapons/tools/medical/food catalogs;\n- black-market-only goods;\n- cargo-focused trade goods;\n- authored inventory-capacity upgrades.\n\nThese extensions must preserve the principle that the economy supports narrative choices rather than replacing them with passive simulation.\n`;
writeNew(path.join(root, 'docs/design/ECONOMY_AND_ITEMS.md'), economyDoc);

updateFile(files.gameDesign, (text) => {
  if (text.includes('[Economy & Items](design/ECONOMY_AND_ITEMS.md)')) return text;
  const anchor = '- [Carrières, réputation et Endings](design/CAREER_AND_ENDINGS.md) ;';
  return replaceOnce(text, anchor, `${anchor}\n- [Economy & Items](design/ECONOMY_AND_ITEMS.md) ;`, 'GAME_DESIGN authority delegation');
});

updateFile(files.contentBible, (text) => {
  if (text.includes('## 15. D2 V2 economy handoff')) return text;
  return text.trimEnd() + `\n\n## 15. D2 V2 economy handoff\n\nThe specialized authority for Item persistence, stack limits, Berrys and generic market pricing is [Economy & Items](../design/ECONOMY_AND_ITEMS.md).\n\nFor V2 production:\n\n- do not invent item prices independently in batches when a generic market definition exists;\n- use atomic \`buyItem\` / \`sellItem\` for ordinary generic transactions;\n- unique story objects and Devil Fruits remain non-market unless explicitly designed otherwise;\n- Childhood social class is household context, not an automatic personal wallet.\n`;
});

updateFile(files.localization, (text) => {
  text = replaceOnce(text, 'CONTENT_SCHEMA_VERSION = 10', 'CONTENT_SCHEMA_VERSION = 11', 'LOCALIZATION schema version');
  text = replaceOnce(text, 'GameState.version = 19', 'GameState.version = 20', 'LOCALIZATION save version');
  return text;
});

updateFile(files.majorTracksDoc, (text) => {
  if (text.includes('## Implementation checkpoint — Wave 3')) return text;
  return text.trimEnd() + `\n\n## Implementation checkpoint — Wave 3\n\nContent Schema 11 implements the generic Major Narrative Track contract without adding Saga state to GameState. Track progression is reconstructed from History; Major variants remain Normal Events but are excluded from the ordinary Normal pool.\n\nPriority is:\n\n1. Critical / system gates;\n2. Immediate;\n3. overdue Major chapter;\n4. due Scheduled;\n5. newly due Major chapter;\n6. ordinary Normal.\n\nA chapter selects specialized eligible variants first and uses its single fallback only when no specialized variant is currently eligible. The D1.9 opening selector and mandatory Lifetime Thread selection guarantee are removed from runtime orchestration.\n`;
});

const testMajor = `import { describe, expect, it } from 'vitest';\nimport { createContentCatalog } from '../content/catalogFactory';\nimport type { EventDefinition } from '../content/schema';\nimport { createInitialGameState } from '../model/initialState';\nimport { selectNextEvent } from './events';\n\nfunction deterministicEvent(id: string, chapterId: string, fallback = false, eligibility?: EventDefinition['eligibility']): EventDefinition {\n  return {\n    id, kind: 'normal', titleKey: 'event.origin_name.title', textKey: 'event.origin_name.text', eligibility,\n    majorTrack: { trackId: 'family_marine', chapterId, ...(fallback ? { fallback: true as const } : {}) },\n    choices: [{ id: 'ok', textKey: 'event.origin_name.choice.confirm.text', resolution: { type: 'deterministic', outcome: { id: 'done', textKey: 'event.origin_name.choice.confirm.outcome.named.text', effects: [] } } }],\n  };\n}\n\ndescribe('Major Narrative Track selection', () => {\n  it('prefers a specialized current-state variant over fallback', () => {\n    const events = [\n      deterministicEvent('marine_c1_fallback', 'childhood_01', true),\n      deterministicEvent('marine_c1_fishman', 'childhood_01', false, { type: 'raceIs', raceId: 'fishman' }),\n    ];\n    const catalog = createContentCatalog(events);\n    catalog.majorNarrativeTracks = [{\n      id: 'family_marine', type: 'family_legacy', eligibility: { type: 'affiliationIs', affiliationId: 'marine' },\n      chapters: [\n        { id: 'childhood_01', phase: 'childhood', dueAgeMonths: 12 },\n        { id: 'childhood_02', phase: 'childhood', dueAgeMonths: 48 },\n        { id: 'childhood_03', phase: 'childhood', dueAgeMonths: 84 },\n        { id: 'childhood_04', phase: 'childhood', dueAgeMonths: 120 },\n        { id: 'childhood_05', phase: 'childhood', dueAgeMonths: 156 },\n      ],\n    }];\n    const state = createInitialGameState(123);\n    state.careerPhase = 'childhood'; state.ageMonths = 12; state.player.profile.affiliationId = 'marine'; state.player.profile.raceId = 'fishman';\n    expect(selectNextEvent(state, catalog).currentEventId).toBe('marine_c1_fishman');\n  });\n\n  it('uses fallback when no specialized variant is eligible', () => {\n    const events = [\n      deterministicEvent('marine_c1_fallback', 'childhood_01', true),\n      deterministicEvent('marine_c1_fishman', 'childhood_01', false, { type: 'raceIs', raceId: 'fishman' }),\n    ];\n    const catalog = createContentCatalog(events);\n    catalog.majorNarrativeTracks = [{ id: 'family_marine', type: 'family_legacy', eligibility: { type: 'affiliationIs', affiliationId: 'marine' }, chapters: [\n      { id: 'childhood_01', phase: 'childhood', dueAgeMonths: 12 }, { id: 'childhood_02', phase: 'childhood', dueAgeMonths: 48 }, { id: 'childhood_03', phase: 'childhood', dueAgeMonths: 84 }, { id: 'childhood_04', phase: 'childhood', dueAgeMonths: 120 }, { id: 'childhood_05', phase: 'childhood', dueAgeMonths: 156 },\n    ] }];\n    const state = createInitialGameState(123);\n    state.careerPhase = 'childhood'; state.ageMonths = 12; state.player.profile.affiliationId = 'marine'; state.player.profile.raceId = 'human';\n    expect(selectNextEvent(state, catalog).currentEventId).toBe('marine_c1_fallback');\n  });\n});\n`;
writeNew(path.join(root, 'src/game/engine/majorNarrative.test.ts'), testMajor);

const testEconomy = `import { describe, expect, it } from 'vitest';\nimport { createContentCatalog } from '../content/catalogFactory';\nimport { createInitialGameState } from '../model/initialState';\nimport { buyItem, canBuyItem, itemSellPrice, sellItem } from './economy';\n\ndescribe('V2 item economy', () => {\n  it('buys and resells a market item atomically', () => {\n    const catalog = createContentCatalog([]);\n    const state = createInitialGameState(1);\n    state.locationId = catalog.locations.find((location) => location.services.includes('trade'))!.id;\n    state.berries = 1000;\n    expect(canBuyItem(state, catalog, 'timber', 1)).toBe(true);\n    buyItem(state, catalog, 'timber', 1);\n    expect(state.berries).toBe(500);\n    expect(state.player.inventory.stacks).toEqual([{ itemId: 'timber', quantity: 1 }]);\n    expect(itemSellPrice(catalog, 'timber', 1)).toBe(250);\n    sellItem(state, catalog, 'timber', 1);\n    expect(state.berries).toBe(750);\n    expect(state.player.inventory.stacks).toEqual([]);\n  });\n});\n`;
writeNew(path.join(root, 'src/game/engine/economy.test.ts'), testEconomy);

console.log('');
console.log(checkOnly ? '[D2 Wave 3] Preflight successful; no files were changed.' : '[D2 Wave 3] Applied successfully.');
