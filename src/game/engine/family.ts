import type { ContentCatalog, NpcDefinition, NpcFamilyRole, NpcSex } from '../content/schema';
import type { GameState, NpcId } from '../model/schema';

export function getSingleParentSex(state: GameState, catalog: ContentCatalog): NpcSex | null {
  const affiliationId = state.player.profile.affiliationId;
  if (affiliationId === null) return null;
  return catalog.affiliations.find(({ id }) => id === affiliationId)?.singleParentSex ?? null;
}

export function getOriginParentDefinition(
  catalog: ContentCatalog,
  role: NpcFamilyRole,
): NpcDefinition | undefined {
  return catalog.npcs.find((npc) => npc.familyRole === role);
}

export function getOriginParentNpcId(
  catalog: ContentCatalog,
  role: NpcFamilyRole,
): NpcId | null {
  return getOriginParentDefinition(catalog, role)?.id ?? null;
}

function isStructurallyPresent(
  state: GameState,
  catalog: ContentCatalog,
  parent: NpcDefinition,
): boolean {
  switch (state.player.profile.familyStructureId) {
    case 'two_parents':
      return true;
    case 'single_parent':
      return getSingleParentSex(state, catalog) === parent.sex;
    case 'orphan':
    case null:
      return false;
    default:
      return false;
  }
}

export function isOriginParentPresent(
  state: GameState,
  catalog: ContentCatalog,
  role: NpcFamilyRole,
): boolean {
  const parent = getOriginParentDefinition(catalog, role);
  if (parent === undefined || !isStructurallyPresent(state, catalog, parent)) return false;

  const runtime = state.npcs[parent.id];
  return runtime === undefined || runtime.status === 'known' || runtime.status === 'crew';
}

export function getPresentOriginParentNpcIds(
  state: GameState,
  catalog: ContentCatalog,
): NpcId[] {
  return (['father', 'mother'] as const).flatMap((role) => {
    if (!isOriginParentPresent(state, catalog, role)) return [];
    const npcId = getOriginParentNpcId(catalog, role);
    return npcId === null ? [] : [npcId];
  });
}
