#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

BASELINE = "a144cf7590893c11dbefb4ea49889e80d3b7e5c7"

class PatchError(RuntimeError):
    pass

def run(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, text=True, capture_output=True, check=check)

def replace_once(root: Path, rel: str, old: str, new: str) -> None:
    path = root / rel
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise PatchError(f"{rel}: expected exactly 1 match, found {count}: {old[:90]!r}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")

def replace_all(root: Path, rel: str, old: str, new: str, expected: int) -> None:
    path = root / rel
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != expected:
        raise PatchError(f"{rel}: expected {expected} matches, found {count}: {old[:90]!r}")
    path.write_text(text.replace(old, new), encoding="utf-8")

def regex_once(root: Path, rel: str, pattern: str, repl: str, flags: int = re.S) -> None:
    path = root / rel
    text = path.read_text(encoding="utf-8")
    next_text, count = re.subn(pattern, repl, text, count=1, flags=flags)
    if count != 1:
        raise PatchError(f"{rel}: regex expected exactly 1 match, found {count}: {pattern[:100]!r}")
    path.write_text(next_text, encoding="utf-8")

def ensure_repo(root: Path, allow_head_drift: bool) -> str:
    if not (root / ".git").exists():
        raise PatchError(f"{root} is not a Git checkout.")
    head = run("git", "-C", str(root), "rev-parse", "HEAD").stdout.strip()
    if head != BASELINE and not allow_head_drift:
        raise PatchError(
            f"HEAD mismatch: expected {BASELINE}, got {head}. "
            "Re-run with --allow-head-drift only after reviewing conflicts."
        )
    return head

def apply(root: Path) -> None:
    # Model / persistent state.
    replace_once(
        root, "src/game/model/schema.ts",
        "  equipment: [ItemStack | null, ItemStack | null];\n  logPose: ItemStack | null;\n  powers: PowerState;",
        "  equipment: [ItemStack | null, ItemStack | null];\n  logPose: ItemStack | null;\n  companion: ItemStack | null;\n  powers: PowerState;",
    )
    replace_once(root, "src/game/model/schema.ts", "  companionNpcId: NpcId | null;\n", "")

    replace_once(root, "src/game/model/initialState.ts", "    version: 21,", "    version: 22,")
    replace_once(
        root, "src/game/model/initialState.ts",
        "      equipment: [null, null],\n      logPose: null,\n      powers:",
        "      equipment: [null, null],\n      logPose: null,\n      companion: null,\n      powers:",
    )
    replace_once(root, "src/game/model/initialState.ts", "    companionNpcId: null,\n", "")

    # Content schema: Companion remains category=item and reuses modifiers.
    replace_once(root, "src/game/content/schema.ts", "export const CONTENT_SCHEMA_VERSION = 14;", "export const CONTENT_SCHEMA_VERSION = 15;")
    replace_once(
        root, "src/game/content/schema.ts",
        "  | { type: 'activeCompanionIs'; npcId: NpcId }",
        "  | { type: 'activeCompanionIs'; itemId: ItemId }",
    )
    replace_once(
        root, "src/game/content/schema.ts",
        "  unique?: boolean;\n  logPoseType?: LogPoseType;",
        "  unique?: boolean;\n  logPoseType?: LogPoseType;\n  /** Dedicated active animal-object slot; Companion is never an NPC. */\n  companion?: true;",
    )
    replace_once(
        root, "src/game/content/schema.ts",
        "  initialStats: NpcStats;\n  companionCapable?: boolean;\n  companionModifiers?: Partial<Record<NpcStatId, number>>;",
        "  initialStats: NpcStats;",
    )

    # Conditions.
    replace_once(
        root, "src/game/engine/conditions.ts",
        "    case 'hasActiveCompanion':\n      return state.companionNpcId !== null;\n    case 'activeCompanionIs':\n      return state.companionNpcId === condition.npcId;",
        "    case 'hasActiveCompanion':\n      return state.player.companion !== null;\n    case 'activeCompanionIs':\n      return state.player.companion?.itemId === condition.itemId;",
    )

    # Effective stats: Equipment + active Companion, each exactly once.
    (root / "src/game/engine/stats.ts").write_text(
r"""import type { ContentCatalog } from '../content/schema';
import type { GameState, NpcId, NpcStatId, PlayerStats } from '../model/schema';

const clampD20Stat = (value: number) => Math.max(0, Math.min(50, value));

export function activePlayerStatModifier(state: GameState, catalog: ContentCatalog, statId: keyof PlayerStats): number {
  const equipmentModifier = state.player.equipment.reduce((sum, stack, index) => {
    const definition = catalog.items.find(({ id }) => id === stack?.itemId);
    return sum + (index === 1 && definition?.twoHanded ? 0 : definition?.modifiers?.[statId] ?? 0);
  }, 0);
  const companionDefinition = state.player.companion
    ? catalog.items.find(({ id }) => id === state.player.companion?.itemId)
    : undefined;
  const companionModifier = companionDefinition?.companion === true
    ? companionDefinition.modifiers?.[statId] ?? 0
    : 0;
  return equipmentModifier + companionModifier;
}

export function effectivePlayerStat(state: GameState, catalog: ContentCatalog, statId: keyof PlayerStats): number {
  const value = state.player.stats[statId] + activePlayerStatModifier(state, catalog, statId);
  return statId === 'health' ? Math.max(1, value) : clampD20Stat(value);
}

export function effectiveNpcStat(state: GameState, _catalog: ContentCatalog, npcId: NpcId, statId: NpcStatId): number {
  const npc = state.npcs[npcId];
  if (!npc) throw new Error(`Unknown NPC "${npcId}".`);
  return statId === 'health' ? Math.max(0, npc.stats[statId]) : clampD20Stat(npc.stats[statId]);
}
""", encoding="utf-8")

    (root / "src/game/engine/health.ts").write_text(
r"""import type { ContentCatalog } from '../content/schema';
import type { GameState } from '../model/schema';
import { activePlayerStatModifier } from './stats';

export function getPlayerMaxHealth(state: GameState, catalog: ContentCatalog): number {
  const raceId = state.player.profile.raceId;
  if (raceId === null) throw new Error('Cannot determine Player maximum Health before Race is set.');

  const race = catalog.races.find(({ id }) => id === raceId);
  if (!race) throw new Error(`Unknown Player Race "${raceId}".`);
  return Math.max(1, race.initialHealth + activePlayerStatModifier(state, catalog, 'health'));
}

export function modifyPlayerHealth(state: GameState, catalog: ContentCatalog, amount: number): void {
  const maximum = getPlayerMaxHealth(state, catalog);
  state.player.stats.health = Math.min(maximum, Math.max(0, state.player.stats.health + amount));
}
""", encoding="utf-8")

    # Inventory adds a dedicated Companion slot. No auto-activation.
    (root / "src/game/engine/inventory.ts").write_text(
r"""import type { ContentCatalog } from '../content/schema';
import type { GameState, ItemId, ItemStack } from '../model/schema';
import { getPlayerMaxHealth } from './health';

export type StorageSlot =
  | { type: 'pocket'; index: 0 | 1 }
  | { type: 'cargo'; index: number }
  | { type: 'equipment'; index: 0 | 1 }
  | { type: 'logPose' }
  | { type: 'companion' };

export function equipFromStorage(state: GameState, catalog: ContentCatalog, source: { type: 'pocket' | 'cargo'; index: number }): boolean {
  const stacks = source.type === 'pocket' ? state.player.inventory.stacks : state.ship?.cargo;
  const stack = stacks?.[source.index];
  const definition = stack && catalog.items.find(({ id }) => id === stack.itemId);
  if (!stack || definition?.category !== 'equipment') return false;
  if (definition.unique && state.player.equipment.some((entry) => entry?.itemId === stack.itemId)) return false;
  const free = state.player.equipment.flatMap((entry, index) => entry === null ? [index as 0 | 1] : []);
  if (free.length < (definition.twoHanded ? 2 : 1)) return false;
  const equipped = takeOne(stack, stacks!);
  state.player.equipment[free[0]] = equipped;
  if (definition.twoHanded) state.player.equipment[free[1]] = { ...equipped, provenance: equipped.provenance.map((batch) => ({ ...batch })) };
  return true;
}

export function unequipToPocket(state: GameState, catalog: ContentCatalog, index: 0 | 1): boolean {
  const stack = state.player.equipment[index];
  if (!stack || state.player.inventory.stacks.length >= 2) return false;
  const definition = catalog.items.find(({ id }) => id === stack.itemId);
  state.player.equipment = definition?.twoHanded ? [null, null] : state.player.equipment.map((entry, slot) => slot === index ? null : entry) as GameState['player']['equipment'];
  state.player.inventory.stacks.push(stack);
  clampCurrentHealth(state, catalog);
  return true;
}

export function moveItem(state: GameState, catalog: ContentCatalog, source: StorageSlot, destination: StorageSlot): boolean {
  if (sameSlot(source, destination)) return true;
  const snapshot = structuredClone(state);
  try {
    const sourceStack = slotValue(state, source);
    if (!sourceStack) return false;
    if (destination.type === 'equipment') return moveToEquipment(state, catalog, source, destination.index);
    if (destination.type === 'logPose') return moveToLogPose(state, catalog, source);
    if (destination.type === 'companion') return moveToCompanion(state, catalog, source);
    if (source.type === 'equipment') return moveEquipmentToStorage(state, catalog, source.index, destination);
    if (source.type === 'logPose') return moveLogPoseToStorage(state, destination);
    if (source.type === 'companion') return moveCompanionToStorage(state, catalog, destination);
    return swapStorage(state, catalog, source, destination);
  } catch {
    Object.assign(state, snapshot);
    return false;
  }
}

function moveToEquipment(state: GameState, catalog: ContentCatalog, source: StorageSlot, destinationIndex: 0 | 1): boolean {
  if (source.type !== 'pocket' && source.type !== 'cargo') return false;
  const stacks = storage(state, source.type);
  const stack = stacks?.[source.index];
  const definition = stack && catalog.items.find(({ id }) => id === stack.itemId);
  if (!stack || definition?.category !== 'equipment' || state.player.equipment[destinationIndex] !== null) return false;
  if (definition.unique && state.player.equipment.some((entry) => entry?.itemId === stack.itemId)) return false;
  if (definition.twoHanded && state.player.equipment.some((entry) => entry !== null)) return false;
  const equipped = takeOne(stack, stacks!);
  state.player.equipment[destinationIndex] = equipped;
  if (definition.twoHanded) state.player.equipment[destinationIndex === 0 ? 1 : 0] = structuredClone(equipped);
  return true;
}

function moveEquipmentToStorage(state: GameState, catalog: ContentCatalog, index: 0 | 1, destination: StorageSlot): boolean {
  if (destination.type !== 'pocket' && destination.type !== 'cargo') return false;
  const equipped = state.player.equipment[index];
  const target = storage(state, destination.type);
  if (!equipped || !target || destination.index > target.length || (target[destination.index] && target.length >= capacity(state, catalog, destination.type))) return false;
  const definition = catalog.items.find(({ id }) => id === equipped.itemId);
  const displaced = target[destination.index] ?? null;
  if (displaced) return false;
  target.splice(destination.index, 0, equipped);
  state.player.equipment = definition?.twoHanded ? [null, null] : state.player.equipment.map((entry, slot) => slot === index ? null : entry) as GameState['player']['equipment'];
  clampCurrentHealth(state, catalog);
  return true;
}

function moveToLogPose(state: GameState, catalog: ContentCatalog, source: StorageSlot): boolean {
  if (state.player.logPose || (source.type !== 'pocket' && source.type !== 'cargo')) return false;
  return activateLogPose(state, catalog, source);
}

function moveLogPoseToStorage(state: GameState, destination: StorageSlot): boolean {
  if ((destination.type !== 'pocket' && destination.type !== 'cargo') || !state.player.logPose) return false;
  const target = storage(state, destination.type);
  if (!target || target[destination.index]) return false;
  target.splice(destination.index, 0, state.player.logPose);
  state.player.logPose = null;
  return true;
}

function moveToCompanion(state: GameState, catalog: ContentCatalog, source: StorageSlot): boolean {
  if (source.type !== 'pocket' && source.type !== 'cargo') return false;
  const stacks = storage(state, source.type);
  const stack = stacks?.[source.index];
  const definition = stack && catalog.items.find(({ id }) => id === stack.itemId);
  if (!stack || definition?.companion !== true) return false;

  const active = state.player.companion;
  if (active) {
    const activeDefinition = catalog.items.find(({ id }) => id === active.itemId);
    if (!activeDefinition || activeDefinition.companion !== true) return false;

    if (stack.quantity === 1) {
      stacks![source.index] = active;
      state.player.companion = stack;
      clampCurrentHealth(state, catalog);
      return true;
    }

    const existing = stacks!.find((entry, index) => index !== source.index && entry.itemId === active.itemId);
    if (existing) {
      if (existing.quantity + active.quantity > activeDefinition.stackLimit) return false;
    } else if (stacks!.length >= capacity(state, catalog, source.type)) {
      return false;
    }

    const incoming = takeOne(stack, stacks!);
    if (existing) mergeStack(existing, active);
    else stacks!.push(active);
    state.player.companion = incoming;
  } else {
    state.player.companion = takeOne(stack, stacks!);
  }

  clampCurrentHealth(state, catalog);
  return true;
}

function moveCompanionToStorage(state: GameState, catalog: ContentCatalog, destination: StorageSlot): boolean {
  if ((destination.type !== 'pocket' && destination.type !== 'cargo') || !state.player.companion) return false;
  const target = storage(state, destination.type);
  if (!target || target[destination.index] || destination.index > target.length || target.length >= capacity(state, catalog, destination.type)) return false;
  target.splice(destination.index, 0, state.player.companion);
  state.player.companion = null;
  clampCurrentHealth(state, catalog);
  return true;
}

function swapStorage(state: GameState, catalog: ContentCatalog, source: StorageSlot, destination: StorageSlot): boolean {
  if ((source.type !== 'pocket' && source.type !== 'cargo') || (destination.type !== 'pocket' && destination.type !== 'cargo')) return false;
  const from = storage(state, source.type);
  const to = storage(state, destination.type);
  if (!from || !to || !from[source.index] || destination.index > to.length) return false;
  if (from === to) {
    const displaced = from[destination.index];
    from[destination.index] = from[source.index];
    if (displaced) from[source.index] = displaced;
    else from.splice(source.index, 1);
    return true;
  }
  const incoming = from[source.index];
  const displaced = to[destination.index];
  if (!displaced && to.length >= capacity(state, catalog, destination.type)) return false;
  if (displaced) from[source.index] = displaced;
  else from.splice(source.index, 1);
  if (displaced) to[destination.index] = incoming;
  else to.splice(destination.index, 0, incoming);
  return true;
}

function storage(state: GameState, type: 'pocket' | 'cargo') { return type === 'pocket' ? state.player.inventory.stacks : state.ship?.cargo; }
function capacity(state: GameState, catalog: ContentCatalog, type: 'pocket' | 'cargo') { return type === 'pocket' ? 2 : shipCapacity(state, catalog); }
function slotValue(state: GameState, slot: StorageSlot) {
  if (slot.type === 'pocket' || slot.type === 'cargo') return storage(state, slot.type)?.[slot.index] ?? null;
  if (slot.type === 'equipment') return state.player.equipment[slot.index];
  return slot.type === 'logPose' ? state.player.logPose : state.player.companion;
}
function sameSlot(left: StorageSlot, right: StorageSlot) { return left.type === right.type && ('index' in left ? 'index' in right && left.index === right.index : !('index' in right)); }

export function activateLogPose(state: GameState, catalog: ContentCatalog, source: { type: 'pocket' | 'cargo'; index: number }): boolean {
  if (state.player.logPose !== null) return false;
  const stacks = source.type === 'pocket' ? state.player.inventory.stacks : state.ship?.cargo;
  const stack = stacks?.[source.index];
  if (!stack || !catalog.items.find(({ id }) => id === stack.itemId)?.logPoseType) return false;
  state.player.logPose = takeOne(stack, stacks!);
  return true;
}

export function tryAutoPlaceReward(state: GameState, catalog: ContentCatalog, itemId: ItemId, quantity = 1, locationId = state.locationId): boolean {
  const definition = catalog.items.find(({ id }) => id === itemId);
  if (!definition || quantity <= 0 || (definition.unique && ownsUsableCopy(state, itemId))) return definition?.unique === true;
  if (definition.category === 'equipment' && quantity === 1) {
    const temp: ItemStack = { itemId, quantity: 1, provenance: [{ locationId, quantity: 1 }] };
    state.player.inventory.stacks.push(temp);
    if (equipFromStorage(state, catalog, { type: 'pocket', index: state.player.inventory.stacks.length - 1 })) return true;
    state.player.inventory.stacks.pop();
  }
  const destination = state.player.inventory.stacks.length < 2 ? state.player.inventory.stacks : state.ship && state.ship.cargo.length < shipCapacity(state, catalog) ? state.ship.cargo : undefined;
  if (!destination) return false;
  destination.push({ itemId, quantity, provenance: [{ locationId, quantity }] });
  return true;
}

export function activeLogPoseNavigationBonus(state: GameState, catalog: ContentCatalog): number {
  return state.player.logPose && catalog.items.find(({ id }) => id === state.player.logPose?.itemId)?.logPoseType ? 3 : 0;
}

export function resolveOverflow(state: GameState, catalog: ContentCatalog, action: { type: 'discardStored'; storage: 'pocket' | 'cargo'; index: number } | { type: 'abandonIncoming' }): void {
  const incoming = state.pendingOverflow;
  if (!incoming) throw new Error('No pending overflow reward.');
  if (action.type === 'abandonIncoming') {
    if (incoming.mandatory) throw new Error('Mandatory reward cannot be abandoned.');
    state.pendingOverflow = null;
    return;
  }
  const stacks = action.storage === 'pocket' ? state.player.inventory.stacks : state.ship?.cargo;
  if (!stacks?.[action.index]) throw new Error('Overflow discard target is unavailable.');
  stacks.splice(action.index, 1);
  state.pendingOverflow = null;
  if (!tryAutoPlaceReward(state, catalog, incoming.itemId, incoming.quantity, incoming.locationId ?? state.locationId)) throw new Error('Incoming reward still cannot be placed after discard.');
}

function ownsUsableCopy(state: GameState, itemId: ItemId): boolean {
  return [...state.player.inventory.stacks, ...(state.ship?.cargo ?? []), ...state.player.equipment.filter((entry): entry is ItemStack => entry !== null), ...(state.player.logPose ? [state.player.logPose] : []), ...(state.player.companion ? [state.player.companion] : [])].some((stack) => stack.itemId === itemId);
}

function shipCapacity(state: GameState, catalog: ContentCatalog): number {
  return catalog.ships.find(({ id }) => id === state.ship?.shipId)?.cargoSlots ?? 0;
}

function takeOne(stack: ItemStack, stacks: ItemStack[]): ItemStack {
  const batch = stack.provenance[0];
  const result = { itemId: stack.itemId, quantity: 1, provenance: [{ locationId: batch.locationId, quantity: 1 }] };
  stack.quantity--;
  batch.quantity--;
  if (batch.quantity === 0) stack.provenance.shift();
  if (stack.quantity === 0) stacks.splice(stacks.indexOf(stack), 1);
  return result;
}

function mergeStack(target: ItemStack, incoming: ItemStack): void {
  target.quantity += incoming.quantity;
  for (const batch of incoming.provenance) {
    const existing = target.provenance.find(({ locationId }) => locationId === batch.locationId);
    if (existing) existing.quantity += batch.quantity;
    else target.provenance.push({ ...batch });
  }
}

function clampCurrentHealth(state: GameState, catalog: ContentCatalog): void {
  if (state.player.profile.raceId === null) return;
  state.player.stats.health = Math.max(1, Math.min(state.player.stats.health, getPlayerMaxHealth(state, catalog)));
}
""", encoding="utf-8")

    # NPC systems no longer know Companions.
    replace_once(root, "src/game/engine/crewPowers.ts", ", NpcId", "")
    regex_once(
        root, "src/game/engine/crewPowers.ts",
        r"\nexport function isCompanionCandidate[\s\S]*?\nexport function setActiveCompanion[\s\S]*?\n}\n?$",
        "\n",
    )

    replace_once(
        root, "src/game/engine/maritime.ts",
        "  if (state.companionNpcId && state.npcs[state.companionNpcId]) state.npcs[state.companionNpcId] = { ...state.npcs[state.companionNpcId], status: 'dead', stats: { ...state.npcs[state.companionNpcId].stats, health: 0 } };\n",
        "",
    )
    replace_once(root, "src/game/engine/maritime.ts", "  state.companionNpcId = null;\n", "")

    replace_once(
        root, "src/game/engine/effects.ts",
        "      logPose: state.player.logPose ? { ...state.player.logPose, provenance: state.player.logPose.provenance.map((batch) => ({ ...batch })) } : null,\n      powers:",
        "      logPose: state.player.logPose ? { ...state.player.logPose, provenance: state.player.logPose.provenance.map((batch) => ({ ...batch })) } : null,\n      companion: state.player.companion ? { ...state.player.companion, provenance: state.player.companion.provenance.map((batch) => ({ ...batch })) } : null,\n      powers:",
    )
    replace_once(
        root, "src/game/engine/effects.ts",
        "      if (state.companionNpcId === npcId && (effect.status === 'dead' || effect.status === 'departed')) state.companionNpcId = null;\n",
        "",
    )

    # Save 21 -> 22. Legacy active NPC companion is deliberately deactivated:
    # there is no authoritative NPC->Item mapping to invent.
    replace_once(root, "src/game/engine/save.ts", "export const CURRENT_SAVE_VERSION = 21;", "export const CURRENT_SAVE_VERSION = 22;")
    replace_once(
        root, "src/game/engine/save.ts",
        "  const logPose = readOptionalStack(value.player.logPose);\n  if (equipment === null || logPose === undefined) return null;",
        "  const logPose = readOptionalStack(value.player.logPose);\n  const companion = readOptionalStack(value.player.companion);\n  if (equipment === null || logPose === undefined || companion === undefined || (companion !== null && companion.quantity !== 1)) return null;",
    )
    replace_once(
        root, "src/game/engine/save.ts",
        "  if (!isNullableString(value.companionNpcId) || !isRecord(value.crewRoleLastUsedYear) || !Object.values(value.crewRoleLastUsedYear).every(isNonNegativeInteger)) return null;",
        "  if (!isRecord(value.crewRoleLastUsedYear) || !Object.values(value.crewRoleLastUsedYear).every(isNonNegativeInteger)) return null;",
    )
    replace_once(
        root, "src/game/engine/save.ts",
        "      equipment,\n      logPose,\n      powers: playerPowers,",
        "      equipment,\n      logPose,\n      companion,\n      powers: playerPowers,",
    )
    replace_once(root, "src/game/engine/save.ts", "    companionNpcId: value.companionNpcId,\n", "")
    replace_once(
        root, "src/game/engine/save.ts",
        "  if (isRecord(migrated) && migrated.version === 18) {\n    const npcs = isRecord(migrated.npcs)\n      ? Object.fromEntries(Object.entries(migrated.npcs).map(([id, npc]) => [id, isRecord(npc) ? { ...npc, displayName: null } : npc]))\n      : migrated.npcs;\n    migrated = { ...migrated, version: 19, npcs };\n  }\n  return migrated;",
        "  if (isRecord(migrated) && migrated.version === 18) {\n    const npcs = isRecord(migrated.npcs)\n      ? Object.fromEntries(Object.entries(migrated.npcs).map(([id, npc]) => [id, isRecord(npc) ? { ...npc, displayName: null } : npc]))\n      : migrated.npcs;\n    migrated = { ...migrated, version: 19, npcs };\n  }\n  if (isRecord(migrated) && migrated.version === 21 && isRecord(migrated.player)) {\n    const { companionNpcId: _legacyCompanionNpcId, ...withoutLegacyCompanion } = migrated;\n    migrated = {\n      ...withoutLegacyCompanion,\n      version: 22,\n      player: { ...migrated.player, companion: null },\n    };\n  }\n  return migrated;",
    )

    # Content validation.
    replace_once(
        root, "src/game/validation/validateContent.ts",
        "  const companionNpcIds = new Set(npcs.filter((npc) => npc.companionCapable === true).map((npc) => String(npc.id)));",
        "  const companionItemIds = new Set(items.filter((item) => item.companion === true).map((item) => String(item.id)));",
    )
    replace_once(
        root, "src/game/validation/validateContent.ts",
        "npcIds, companionNpcIds, raceIds",
        "npcIds, companionItemIds, raceIds",
    )
    replace_once(root, "src/game/validation/validateContent.ts", "  companionNpcIds: Set<string>;", "  companionItemIds: Set<string>;")
    replace_once(
        root, "src/game/validation/validateContent.ts",
        "  if (type === 'activeCompanionIs') validateReference(value.npcId, references.companionNpcIds, 'companion-capable NpcId', path, errors);",
        "  if (type === 'activeCompanionIs') validateReference(value.itemId, references.companionItemIds, 'Companion ItemId', path, errors);",
    )
    replace_once(
        root, "src/game/validation/validateContent.ts",
        "    const equipmentOnly = ['modifiers', 'weapon', 'twoHanded'];\n    if (item.category === 'item' && equipmentOnly.some((field) => item[field] !== undefined)) errors.push({ path, message: 'Equipment-only fields are forbidden on item.' });\n    if (item.modifiers !== undefined) {\n      if (!isRecord(item.modifiers)) errors.push({ path: `${path}.modifiers`, message: 'Equipment modifiers must be an object.' });\n      else Object.entries(item.modifiers).forEach(([statId, amount]) => {\n        if (statId !== 'health') validateStat(statId, `${path}.modifiers.${statId}`, errors);\n        if (typeof amount !== 'number' || !Number.isFinite(amount)) errors.push({ path: `${path}.modifiers.${statId}`, message: 'Equipment modifier must be finite.' });\n      });\n    }",
        "    const equipmentOnly = ['weapon', 'twoHanded'];\n    if (item.category === 'item' && equipmentOnly.some((field) => item[field] !== undefined)) errors.push({ path, message: 'Equipment-only fields are forbidden on item.' });\n    if (item.companion !== undefined && item.companion !== true) errors.push({ path: `${path}.companion`, message: 'companion metadata may only be true when present.' });\n    if (item.companion === true && item.category !== 'item') errors.push({ path: `${path}.companion`, message: 'Companion must use Item category item.' });\n    if (item.companion === true && item.logPoseType !== undefined) errors.push({ path, message: 'Companion and Log Pose metadata are mutually exclusive.' });\n    if (item.modifiers !== undefined) {\n      if (item.category !== 'equipment' && item.companion !== true) errors.push({ path: `${path}.modifiers`, message: 'Modifiers require Equipment or Companion Item.' });\n      if (!isRecord(item.modifiers)) errors.push({ path: `${path}.modifiers`, message: 'Active Item modifiers must be an object.' });\n      else Object.entries(item.modifiers).forEach(([statId, amount]) => {\n        if (statId !== 'health') validateStat(statId, `${path}.modifiers.${statId}`, errors);\n        if (typeof amount !== 'number' || !Number.isFinite(amount)) errors.push({ path: `${path}.modifiers.${statId}`, message: 'Active Item modifier must be finite.' });\n      });\n    }",
    )
    regex_once(
        root, "src/game/validation/validateContent.ts",
        r"\n    if \(npc\.companionCapable !== undefined[\s\S]*?\n    if \(!isRecord\(npc\.initialStats\)\)",
        "\n    if (!isRecord(npc.initialStats))",
    )

    # HUD: Companion is the dedicated Item slot and uses the same slot interaction model.
    replace_once(root, "src/features/event-ui/TopWorldHud.tsx", "import { useState } from 'react';\n", "")
    replace_once(root, "src/features/event-ui/TopWorldHud.tsx", "import { isCompanionCandidate } from '@/game/engine/crewPowers';\n", "")
    replace_once(root, "src/features/event-ui/TopWorldHud.tsx", "  onSelectCompanion?: (npcId: string | null) => void;\n", "")
    replace_once(
        root, "src/features/event-ui/TopWorldHud.tsx",
        "function storageKey(slot: StorageSlot): string { return slot.type === 'logPose' ? 'logPose' : `${slot.type}-${slot.index}`; }",
        "function storageKey(slot: StorageSlot): string { return slot.type === 'logPose' || slot.type === 'companion' ? slot.type : `${slot.type}-${slot.index}`; }",
    )
    replace_once(
        root, "src/features/event-ui/TopWorldHud.tsx",
        "export function ShipHudPanel({ state, catalog, translate, selectedStorageSlot, onStorageSlot, onSelectCompanion }: TopWorldHudProps) {\n  const [companionPickerOpen, setCompanionPickerOpen] = useState(false);",
        "export function ShipHudPanel({ state, catalog, translate, selectedStorageSlot, onStorageSlot }: TopWorldHudProps) {",
    )
    regex_once(
        root, "src/features/event-ui/TopWorldHud.tsx",
        r"  const activeCompanion = state\.companionNpcId[\s\S]*?\.sort\(\(left, right\) => left\.localeCompare\(right\)\);\n",
        """  const activeCompanion = state.player.companion;
  const activeCompanionDefinition = activeCompanion
    ? catalog.items.find(({ id }) => id === activeCompanion.itemId)
    : undefined;
  const activeCompanionLabel = activeCompanion ? getItemLabel(activeCompanion, catalog, translate) : null;
  const activeCompanionBonus = activeCompanionDefinition?.companion === true
    ? Object.entries(activeCompanionDefinition.modifiers ?? {})
        .filter(([, amount]) => amount !== 0)
        .map(([statId, amount]) => `${Number(amount) > 0 ? '+' : ''}${amount} ${translate(`stat.${statId}`)}`)
        .join(' · ')
    : '';
""",
    )
    regex_once(
        root, "src/features/event-ui/TopWorldHud.tsx",
        r"""          <div className="opfg-hud-companion">[\s\S]*?          </div>\n        </div>\n      </div>\n    </Panel>""",
        """          <ContextTooltip
            className="opfg-hud-slot-wrap"
            title={translate('ui.companion.title')}
            detail={activeCompanionLabel
              ? [activeCompanionLabel, activeCompanionBonus].filter(Boolean).join(' · ')
              : translate('ui.companion.empty')}
            side="bottom"
            focusable
          >
            <button
              type="button"
              className={`opfg-hud-slot ${activeCompanion ? 'is-filled' : 'is-empty'}`}
              aria-label={activeCompanionLabel ?? translate('ui.companion.empty')}
              {...interactionProps({ type: 'companion' }, selectedStorageSlot, onStorageSlot)}
            >
              <UserRound className="size-4" aria-hidden="true" />
            </button>
          </ContextTooltip>
        </div>
      </div>
    </Panel>""",
    )

    # Event UI no longer has an NPC Companion action.
    replace_once(
        root, "src/features/event-ui/EventPreview.tsx",
        "import { setActiveCompanion, useCrewRolePower } from '@/game/engine/crewPowers';",
        "import { useCrewRolePower } from '@/game/engine/crewPowers';",
    )
    regex_once(
        root, "src/features/event-ui/EventPreview.tsx",
        r"\n\s*onSelectCompanion: \(npcId: string \| null\) => session\.applySystemAction\(\(next\) => setActiveCompanion\(next, catalog, npcId\)\),",
        "",
    )

    # Debug owned quantities include the active Companion Item. Give Item already uses the Item catalog.
    replace_once(
        root, "src/features/dev-ui/GameplayDebugPanel.tsx",
        "  if (state.player.logPose) add(state.player.logPose.itemId, state.player.logPose.quantity);\n",
        "  if (state.player.logPose) add(state.player.logPose.itemId, state.player.logPose.quantity);\n  if (state.player.companion) add(state.player.companion.itemId, state.player.companion.quantity);\n",
    )

    # Existing D2.6 regression file: remove obsolete NPC-Companion assumptions.
    replace_once(
        root, "src/game/engine/d26Systems.test.ts",
        "import { effectiveNpcStat, effectivePlayerStat } from './stats';",
        "import { effectivePlayerStat } from './stats';",
    )
    replace_once(
        root, "src/game/engine/d26Systems.test.ts",
        "import { canUseCrewRolePower, navigatorDestinations, setActiveCompanion, useCrewRolePower } from './crewPowers';",
        "import { canUseCrewRolePower, navigatorDestinations, useCrewRolePower } from './crewPowers';",
    )
    replace_once(
        root, "src/game/engine/d26Systems.test.ts",
        "  it('uses Save 21 and rejects Save 20', () => {",
        "  it('uses Save 22 and rejects Save 20', () => {",
    )
    regex_once(
        root, "src/game/engine/d26Systems.test.ts",
        r"""  it\('wrecks cargo, passengers and companion but preserves Log Pose',[\s\S]*?\n  \}\);\n""",
        """  it('wrecks cargo and passengers but preserves active Item slots', () => {
    const state = createInitialGameState();
    state.ship = { shipId: 'sloop', name: 'Test', health: 0, cargo: [{ itemId: 'timber', quantity: 1, provenance: [{ locationId: null, quantity: 1 }] }] };
    state.npcs.guest = createDefaultNpcState();
    state.passengerNpcIds = ['guest'];
    state.player.logPose = { itemId: 'paradise_log_pose', quantity: 1, provenance: [{ locationId: null, quantity: 1 }] };
    state.player.companion = { itemId: 'sealed_chart', quantity: 1, provenance: [{ locationId: null, quantity: 1 }] };

    beginMaritimeEmergency(state, contentCatalog, 'accident');

    expect(state.ship).toBeNull();
    expect(state.npcs.guest.status).toBe('dead');
    expect(state.player.logPose?.itemId).toBe('paradise_log_pose');
    expect(state.player.companion?.itemId).toBe('sealed_chart');
  });
""",
    )
    regex_once(
        root, "src/game/engine/d26Systems.test.ts",
        r"""  it\('selects only living companion-capable NPCs[\s\S]*?  it\('applies active companion modifiers only to crew NPCs',[\s\S]*?\n  \}\);\n""",
        "",
    )

    # Dedicated architecture/regression tests.
    test_path = root / "src/game/engine/companionItems.test.ts"
    if test_path.exists():
        raise PatchError(f"{test_path.relative_to(root)} already exists; refusing to overwrite.")
    test_path.write_text(COMPANION_TESTS, encoding="utf-8")

COMPANION_TESTS = r"""import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../content/definitions';
import { createInitialGameState } from '../model/initialState';
import { createDefaultNpcState } from '../model/npcState';
import type { ContentCatalog } from '../content/schema';
import { evaluateCondition } from './conditions';
import { applyEffects } from './effects';
import { moveItem } from './inventory';
import { deserializeGameState, serializeGameState } from './save';
import { canUseCrewRolePower } from './crewPowers';
import { countCurrentCrew } from './ship';
import { effectivePlayerStat } from './stats';
import { validateContent } from '../validation/validateContent';

const stack = (itemId: string) => ({
  itemId,
  quantity: 1,
  provenance: [{ locationId: null, quantity: 1 }],
});

function withCompanions(): ContentCatalog {
  const catalog = structuredClone(contentCatalog);
  catalog.items.push(
    {
      id: 'test_puppy',
      nameKey: 'item.sealed_chart.name',
      category: 'item',
      stackLimit: 1,
      market: null,
      unique: true,
      companion: true,
      modifiers: { morale: 2 },
    },
    {
      id: 'test_gull',
      nameKey: 'item.sealed_chart.name',
      category: 'item',
      stackLimit: 1,
      market: null,
      unique: true,
      companion: true,
      modifiers: { navigation: 1 },
    },
    {
      id: 'test_charm',
      nameKey: 'item.sealed_chart.name',
      category: 'equipment',
      stackLimit: 1,
      market: null,
      modifiers: { morale: 3 },
    },
  );
  return catalog;
}

describe('Companion Item architecture', () => {
  it('models Companion as an Item, never an NPC definition', () => {
    const catalog = withCompanions();
    expect(catalog.items.find(({ id }) => id === 'test_puppy')).toMatchObject({ category: 'item', companion: true });
    expect(catalog.npcs.some(({ id }) => id === 'test_puppy')).toBe(false);
  });

  it('allows several Companion Items to be owned simultaneously', () => {
    const state = createInitialGameState();
    state.player.inventory.stacks = [stack('test_puppy'), stack('test_gull')];
    expect(state.player.inventory.stacks.map(({ itemId }) => itemId)).toEqual(['test_puppy', 'test_gull']);
  });

  it('activates exactly one Companion and swaps it atomically', () => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    state.player.inventory.stacks = [stack('test_puppy'), stack('test_gull')];

    expect(moveItem(state, catalog, { type: 'pocket', index: 0 }, { type: 'companion' })).toBe(true);
    expect(state.player.companion?.itemId).toBe('test_puppy');
    expect(state.player.inventory.stacks.map(({ itemId }) => itemId)).toEqual(['test_gull']);

    expect(moveItem(state, catalog, { type: 'pocket', index: 0 }, { type: 'companion' })).toBe(true);
    expect(state.player.companion?.itemId).toBe('test_gull');
    expect(state.player.inventory.stacks.map(({ itemId }) => itemId)).toEqual(['test_puppy']);
  });

  it('unequips the active Companion back to storage', () => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    state.player.inventory.stacks = [stack('test_puppy')];
    moveItem(state, catalog, { type: 'pocket', index: 0 }, { type: 'companion' });

    expect(moveItem(state, catalog, { type: 'companion' }, { type: 'pocket', index: 0 })).toBe(true);
    expect(state.player.companion).toBeNull();
    expect(state.player.inventory.stacks[0].itemId).toBe('test_puppy');
  });

  it('applies the active Companion bonus exactly once without mutating base Stats', () => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    state.player.inventory.stacks = [stack('test_puppy')];
    moveItem(state, catalog, { type: 'pocket', index: 0 }, { type: 'companion' });

    expect(state.player.stats.morale).toBe(25);
    expect(effectivePlayerStat(state, catalog, 'morale')).toBe(27);
    expect(effectivePlayerStat(state, catalog, 'morale')).toBe(27);
    expect(state.player.stats.morale).toBe(25);
  });

  it('removes the Companion bonus when unequipped', () => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    state.player.inventory.stacks = [stack('test_puppy')];
    moveItem(state, catalog, { type: 'pocket', index: 0 }, { type: 'companion' });
    moveItem(state, catalog, { type: 'companion' }, { type: 'pocket', index: 0 });

    expect(effectivePlayerStat(state, catalog, 'morale')).toBe(25);
  });

  it('combines Equipment and Companion modifiers without sharing slots', () => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    state.player.equipment[0] = stack('test_charm');
    state.player.companion = stack('test_puppy');

    expect(effectivePlayerStat(state, catalog, 'morale')).toBe(30);
    expect(state.player.equipment[0]?.itemId).toBe('test_charm');
    expect(state.player.companion?.itemId).toBe('test_puppy');
  });

  it('does not consume crew capacity', () => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    state.ship = { shipId: 'dinghy', name: 'Test', health: 18, cargo: [] };
    state.player.companion = stack('test_puppy');

    expect(countCurrentCrew(state)).toBe(0);
    expect(catalog.ships.find(({ id }) => id === 'dinghy')?.crewCapacity).toBe(1);
  });

  it('does not create NpcState while activating or swapping', () => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    const beforeNpcIds = Object.keys(state.npcs);
    state.player.inventory.stacks = [stack('test_puppy'), stack('test_gull')];

    moveItem(state, catalog, { type: 'pocket', index: 0 }, { type: 'companion' });
    moveItem(state, catalog, { type: 'pocket', index: 0 }, { type: 'companion' });

    expect(Object.keys(state.npcs)).toEqual(beforeNpcIds);
  });

  it('evaluates hasActiveCompanion against the Item slot', () => {
    const state = createInitialGameState();
    expect(evaluateCondition({ type: 'hasActiveCompanion' }, state)).toBe(false);
    state.player.companion = stack('test_puppy');
    expect(evaluateCondition({ type: 'hasActiveCompanion' }, state)).toBe(true);
  });

  it('evaluates activeCompanionIs with ItemId', () => {
    const state = createInitialGameState();
    state.player.companion = stack('test_puppy');
    expect(evaluateCondition({ type: 'activeCompanionIs', itemId: 'test_puppy' }, state)).toBe(true);
    expect(evaluateCondition({ type: 'activeCompanionIs', itemId: 'test_gull' }, state)).toBe(false);
  });

  it('preserves the active Companion through save/load', () => {
    const state = createInitialGameState();
    state.player.companion = stack('test_puppy');
    expect(deserializeGameState(serializeGameState(state))?.player.companion).toEqual(stack('test_puppy'));
  });

  it('migrates Save 21 to Save 22 without keeping the legacy NPC-Companion model', () => {
    const current = createInitialGameState();
    const { companion: _companion, ...legacyPlayer } = current.player;
    const legacy = {
      ...current,
      version: 21,
      player: legacyPlayer,
      companionNpcId: 'mira',
    };

    const migrated = deserializeGameState(JSON.stringify(legacy));
    expect(migrated?.version).toBe(22);
    expect(migrated?.player.companion).toBeNull();
    expect(migrated && 'companionNpcId' in migrated).toBe(false);
  });

  it.each(['dead', 'departed'] as const)('NPC %s does not affect the active Companion Item', (status) => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    state.player.companion = stack('test_puppy');
    state.npcs.mira = { ...createDefaultNpcState(), status: 'known' };

    const next = applyEffects(
      state,
      catalog,
      [{ type: 'setNpcStatus', npcId: 'mira', status, allowWithoutLeadership: true }],
      { sourceEventId: 'test', sourceChoiceId: 'test' },
    );

    expect(next.npcs.mira.status).toBe(status);
    expect(next.player.companion?.itemId).toBe('test_puppy');
  });

  it('keeps Crew powers independent from Companion Items', () => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    state.player.companion = stack('test_puppy');
    state.npcs.mira = { ...createDefaultNpcState(), status: 'crew' };

    expect(countCurrentCrew(state)).toBe(1);
    expect(canUseCrewRolePower(state, catalog, 'navigator')).toBe(true);
  });

  it('validates activeCompanionIs against Companion Item IDs, not NPC IDs', () => {
    const catalog = withCompanions();
    const event = catalog.events.find(({ kind }) => kind === 'normal');
    expect(event).toBeDefined();

    event!.eligibility = { type: 'activeCompanionIs', itemId: 'test_puppy' };
    expect(validateContent(catalog).some(({ message }) => message.includes('Companion ItemId'))).toBe(false);

    event!.eligibility = { type: 'activeCompanionIs', itemId: 'mira' };
    expect(validateContent(catalog).some(({ message }) => message.includes('Companion ItemId'))).toBe(true);
  });
});
"""

def verify(root: Path) -> int:
    commands = [
        ("npm test", ["npm", "test"]),
        ("npm run validate-content", ["npm", "run", "validate-content"]),
        ("npm run build", ["npm", "run", "build"]),
    ]
    failed = False
    for label, args in commands:
        print(f"\n== {label} ==")
        proc = subprocess.run(args, cwd=root, text=True)
        if proc.returncode != 0:
            failed = True
    print("\n== git grep -n -i companion ==")
    subprocess.run(["git", "grep", "-n", "-i", "companion"], cwd=root)
    return 1 if failed else 0

def main() -> int:
    parser = argparse.ArgumentParser(description="Apply STAB_PATCH_COMPANION_ITEM_ARCH_01 without commit/push.")
    parser.add_argument("repo", nargs="?", default=".", help="Path to NathanTheophile/opfg checkout")
    parser.add_argument("--allow-head-drift", action="store_true", help="Allow a HEAD other than the audited baseline; snippet guards still apply.")
    parser.add_argument("--verify", action="store_true", help="Run npm test, validate-content, build, and final Companion grep after applying.")
    args = parser.parse_args()

    root = Path(args.repo).resolve()
    try:
        head = ensure_repo(root, args.allow_head_drift)
        print(f"HEAD before patch: {head}")
        status = run("git", "-C", str(root), "status", "--short").stdout
        print("Worktree before patch:")
        print(status if status else "(clean)")
        apply(root)
        print("Patch applied. No commit/push/PR performed.")
        print(run("git", "-C", str(root), "status", "--short").stdout)
        if args.verify:
            return verify(root)
        print("Run with --verify, or manually run: npm test && npm run validate-content && npm run build")
        return 0
    except (PatchError, subprocess.CalledProcessError, OSError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

if __name__ == "__main__":
    raise SystemExit(main())
