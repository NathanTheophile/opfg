import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../content/definitions';
import type { EventDefinition, ItemDefinition } from '../content/schema';

const legacyRoots = {
  family_civilian: {
    family_civilian_05_livelihood_fallback: 'civilian_workshop_toolkit',
    family_civilian_05_workshop_inheritance: 'civilian_workshop_toolkit',
    family_civilian_05_business_stewardship: 'civilian_trust_ledger',
    family_civilian_05_neighborhood_name: 'civilian_trust_ledger',
    family_civilian_05_adapted_place: 'civilian_workshop_cat',
  },
  family_marine: {
    family_marine_13_on_your_terms: 'family_marine_field_compass',
    family_marine_13_your_name_on_roll: 'family_marine_field_compass',
    family_marine_13_what_remains_of_him: 'family_marine_service_journal',
    family_marine_13_our_name_is_not_theirs: 'marine_courtyard_hound',
    family_marine_13_wear_it_better: 'family_marine_service_journal',
  },
  family_pirate: {
    family_pirate_13_mothers_salt_chart: 'family_pirate_salt_chart',
    family_pirate_13_no_innocents_code: 'family_pirate_black_flag_patch',
    family_pirate_13_return_the_share: 'pirate_safe_harbor_gull',
    family_pirate_13_flag_means_mine: 'family_pirate_black_flag_patch',
    family_pirate_13_safe_harbor_key: 'pirate_safe_harbor_gull',
  },
  family_revolutionary: {
    family_revolutionary_13_mothers_unclaimed_post: 'revolutionary_handoff_notebook',
    family_revolutionary_13_invitation_not_guardianship: 'revolutionary_handoff_notebook',
    family_revolutionary_13_two_keys_two_paths: 'revolutionary_boundary_keys',
    family_revolutionary_13_relief_without_debt: 'revolutionary_boundary_keys',
    family_revolutionary_13_minor_courier_boundary: 'revolutionary_courier_ferret',
  },
  family_royal: {
    family_royal_13_seal_without_throne: 'family_royal_plain_seal',
    family_royal_13_pay_the_cost: 'family_royal_plain_seal',
    family_royal_13_symbol_or_voice: 'family_royal_unmarked_travel_boots',
    family_royal_13_walk_beyond_gate: 'family_royal_unmarked_travel_boots',
    family_royal_13_family_not_institution: 'royal_palace_hound',
  },
} as const;

const rootGateHashes: Record<string, string> = {
  family_civilian_05_livelihood_fallback: 'd31f326f95a329cccdcda879fc151e2164680e4762bb9d7ef26c7c69ca7c98ba',
  family_civilian_05_workshop_inheritance: '04c1c1729178fd81e376e260232dadc67e9be456acb04a56b651b4db185a05f3',
  family_civilian_05_business_stewardship: '0da6a4404c18b56c6bdd6c0616a655a62b1b72b738d36590c7391427f26b67a4',
  family_civilian_05_neighborhood_name: 'dca7b0bce4e7ee40badb353239d5788cd83cb350900dca6c5857dbf5932474a0',
  family_civilian_05_adapted_place: 'df6a267c561133cefabb77f828c1fab24257e3c347616eba7ef916b9c5768960',
  family_marine_13_on_your_terms: 'a6a464ebc9b556e1ff979039ff8aef096df4c79eaca6381c838510fb54ce5066',
  family_marine_13_your_name_on_roll: 'c4093fd0af27ef2f394e80546f4f51d917aff66e549763834526fdb337423c31',
  family_marine_13_what_remains_of_him: '6668f51644fb31207f121c647204817f8ad5a2576c5cdc191c8f6371aa789021',
  family_marine_13_our_name_is_not_theirs: '207237eedb358d0da11b12654b835bee157121374f9e3c655f8407e0754375c1',
  family_marine_13_wear_it_better: '43c0de6be384c2532ce418bb493164fc9b52ff4875faa581613709f7c35d8486',
  family_pirate_13_mothers_salt_chart: '6ecd91d07228b9366834c3e70e9f33377245fa15b0413b9c45d64146f4cccf42',
  family_pirate_13_no_innocents_code: '1cdf052f932ef8bce4b935f77bfc6fda789bbd2f7ecfc025dcb4c2b308e0acab',
  family_pirate_13_return_the_share: '62137eded16e91cc3be8878693785dff9c630bda4c29da3287ac5f4d78b400a9',
  family_pirate_13_flag_means_mine: '95b0b234702c2a32cc1afb6b68451bd0ab6bd380f3a56eacb8c146969c3d256e',
  family_pirate_13_safe_harbor_key: 'f4162b8e7bc43a04afb16b43323ce5cd7aefc18bbba5eb8789e7f82d8e81d0ea',
  family_revolutionary_13_mothers_unclaimed_post: 'fdf6613002ff70acfd0c394d1aaaafc013e9c71608988f68dabb12345f22e65c',
  family_revolutionary_13_invitation_not_guardianship: '8c098ecabbead92aa60ac1ec7139ef79102aa5dd1998ce6c10acca41233e0860',
  family_revolutionary_13_two_keys_two_paths: '2ebe32231bac0b8600084bc339991621eaeca4edd278a759158da49b54f76632',
  family_revolutionary_13_relief_without_debt: 'd48100490389eea6c9c0bbb2baaa5bc437d5549dae33352b89a8c793b79f858e',
  family_revolutionary_13_minor_courier_boundary: 'f6719daa89db68a6f1109ef8b0cea4c1b09638569e69d6dee3b8e688c3a29170',
  family_royal_13_seal_without_throne: '74600d90f576dad63cafeff95614d3bca2a003567cb4624fa3932ade9c19f6fd',
  family_royal_13_pay_the_cost: '79b6ea4add8881e359216b34c59051b3c80ca7709332c5a4d8dc181831b2aba4',
  family_royal_13_symbol_or_voice: '50fcdb13782f656823a9e860df227b101e8883556402372bb78ec824ce45b147',
  family_royal_13_walk_beyond_gate: 'd278e65a5c48608ca96d6b6635c2f50dd2f9c3ecb11556ebb4b638820cb0c9d3',
  family_royal_13_family_not_institution: '40caed673e2d18e4a552cd275e7b5224b4da7db5a9861feb434df233932b6681',
};

const eventById = new Map(contentCatalog.events.map((event) => [event.id, event]));
const itemById = new Map(contentCatalog.items.map((item) => [item.id, item]));

function terminalOutcomes(rootId: string): { eventId: string; choiceId: string; itemIds: string[] }[] {
  const terminals: { eventId: string; choiceId: string; itemIds: string[] }[] = [];
  const seen = new Set<string>();

  function visit(eventId: string) {
    if (seen.has(eventId)) return;
    seen.add(eventId);
    const event = eventById.get(eventId);
    expect(event, eventId).toBeDefined();

    for (const choice of event!.choices) {
      for (const outcome of choice.resolution.type === 'deterministic' ? [choice.resolution.outcome] : Object.values(choice.resolution.outcomes)) {
        const nextIds = outcome.effects.filter((effect) => effect.type === 'queueImmediateEvent').map((effect) => effect.eventId);
        if (nextIds.length === 0) {
          terminals.push({
            eventId,
            choiceId: choice.id,
            itemIds: outcome.effects.filter((effect) => effect.type === 'addItem').map((effect) => effect.itemId),
          });
        } else {
          nextIds.forEach(visit);
        }
      }
    }
  }

  visit(rootId);
  return terminals;
}

function netModifiers(item: ItemDefinition): number {
  return Object.values(item.modifiers ?? {}).reduce((sum, value) => sum + value, 0);
}

function gateHash(rootId: string): string {
  const familyId = Object.keys(legacyRoots).find((id) => rootId.startsWith(id));
  expect(familyId, rootId).toBeDefined();
  const source = JSON.parse(readFileSync(`content-authoring/sagas/${familyId}.authoring.json`, 'utf8')) as { events: EventDefinition[] };
  const event = source.events.find(({ id }) => id === rootId);
  expect(event, rootId).toBeDefined();
  expect(event!.kind, rootId).toBe('normal');
  const normalEvent = event as EventDefinition & {
    majorTrack: { selectionPriority?: number; parentNodeIds?: string[] };
  };
  const gate = {
    eligibility: normalEvent.eligibility ?? null,
    selectionPriority: normalEvent.majorTrack.selectionPriority ?? null,
    parentNodeIds: normalEvent.majorTrack.parentNodeIds ?? [],
  };
  return createHash('sha256').update(JSON.stringify(gate)).digest('hex');
}

describe('Family L5 legacy rewards', () => {
  it('covers exactly the 25 locked rare L5 roots', () => {
    const roots = Object.values(legacyRoots).flatMap((family) => Object.keys(family));
    expect(roots).toHaveLength(25);
    expect(new Set(roots).size).toBe(25);
    expect(Object.keys(rootGateHashes).sort()).toEqual([...roots].sort());
  });

  it('guarantees the assigned legacy reward on every terminal outcome', () => {
    for (const family of Object.values(legacyRoots)) {
      for (const [rootId, itemId] of Object.entries(family)) {
        const terminals = terminalOutcomes(rootId);
        expect(terminals.length, rootId).toBeGreaterThan(0);
        for (const terminal of terminals) {
          expect(terminal.itemIds, `${rootId} -> ${terminal.eventId}/${terminal.choiceId}`).toContain(itemId);
        }
      }
    }
  });

  it('keeps each Family to exactly two Equipment legacy rewards and one Companion legacy reward', () => {
    for (const [familyId, family] of Object.entries(legacyRoots)) {
      const rewards = [...new Set(Object.values(family))].map((itemId) => itemById.get(itemId)!);
      expect(rewards, familyId).toHaveLength(3);
      expect(rewards.filter(({ category }) => category === 'equipment').map(({ id }) => id).sort(), familyId).toHaveLength(2);
      expect(rewards.filter(({ companion }) => companion === true).map(({ id }) => id), familyId).toHaveLength(1);
    }
  });

  it('defines each legacy reward as unique and at least +3 net modifiers', () => {
    const itemIds = new Set(Object.values(legacyRoots).flatMap((family) => Object.values(family)));
    expect(itemIds.size).toBe(15);
    for (const itemId of itemIds) {
      const item = itemById.get(itemId);
      expect(item, itemId).toBeDefined();
      expect(item!.unique, itemId).toBe(true);
      expect(item!.market, itemId).toBeNull();
      expect(netModifiers(item!), itemId).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps Companion legacy rewards as animal Items, not NPC or crew state', () => {
    const companionIds = Object.values(legacyRoots)
      .flatMap((family) => [...new Set(Object.values(family))])
      .filter((itemId) => itemById.get(itemId)?.companion === true);

    expect(companionIds).toHaveLength(5);
    for (const itemId of companionIds) {
      expect(itemById.get(itemId)?.category, itemId).toBe('item');
      expect(contentCatalog.npcs.some((npc) => npc.id === itemId), itemId).toBe(false);
      expect(contentCatalog.crewRoles.some((role) => role.id === itemId), itemId).toBe(false);
    }
  });

  it('does not alter locked root eligibility, priority, or parent links', () => {
    for (const [rootId, expectedHash] of Object.entries(rootGateHashes)) {
      expect(gateHash(rootId), rootId).toBe(expectedHash);
    }
  });
});
