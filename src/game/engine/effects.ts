import type { ContentCatalog, Effect } from '../content/schema';
import type { ChoiceId, EventId, GameState, NpcState } from '../model/schema';
import { createDefaultNpcState } from '../model/npcState';
import { addStack, canAcquireShip, cloneInventory, cloneShip, findShipDefinition, removeStack } from './ship';

export interface EffectContext {
  sourceEventId: EventId;
  sourceChoiceId: ChoiceId;
}

export function applyEffects(state: GameState, catalog: ContentCatalog, effects: Effect[], context: EffectContext): GameState {
  const next: GameState = {
    ...state,
    player: {
      ...state.player,
      profile: { ...state.player.profile },
      stats: { ...state.player.stats },
      traits: [...state.player.traits],
      inventory: cloneInventory(state.player.inventory),
    },
    ship: cloneShip(state.ship),
    pendingShip: cloneShip(state.pendingShip),
    flags: [...state.flags],
    berries: state.berries,
    npcs: Object.fromEntries(
      Object.entries(state.npcs).map(([npcId, npc]) => [npcId, { ...npc, stats: { ...npc.stats } }]),
    ),
    history: [...state.history],
    scheduledEvents: [...state.scheduledEvents],
  };

  for (const effect of effects) applyEffect(next, catalog, effect, context);
  return next;
}

function applyEffect(state: GameState, catalog: ContentCatalog, effect: Effect, context: EffectContext): void {
  switch (effect.type) {
    case 'setFlag':
      if (!state.flags.includes(effect.flagId)) state.flags.push(effect.flagId);
      return;
    case 'clearFlag':
      state.flags = state.flags.filter((flagId) => flagId !== effect.flagId);
      return;
    case 'addItem':
      addStack(state.player.inventory.stacks, effect.itemId, effect.quantity, state.player.inventory.capacity);
      return;
    case 'removeItem':
      removeStack(state.player.inventory.stacks, effect.itemId, effect.quantity);
      return;
    case 'addTrait':
      if (state.player.traits.includes(effect.traitId)) return;
      const definition = catalog.traits.find(({ id }) => id === effect.traitId);
      if (definition?.oppositeTraitId && state.player.traits.includes(definition.oppositeTraitId)) return;
      state.player.traits.push(effect.traitId);
      return;
    case 'removeTrait':
      state.player.traits = state.player.traits.filter((traitId) => traitId !== effect.traitId);
      return;
    case 'modifyStat': {
      const currentValue = state.player.stats[effect.statId];
      if (currentValue === null) throw new Error(`Cannot modify inactive stat "${effect.statId}".`);
      state.player.stats[effect.statId] = clamp(currentValue + effect.amount, 0, 50);
      return;
    }
    case 'acquireShip': {
      if (!canAcquireShip(state, catalog, effect.shipId)) throw new Error(`Ship "${effect.shipId}" cannot accommodate the current crew or cargo.`);
      if (effect.name.trim().length === 0) throw new Error('Acquired ship requires a name.');
      const definition = findShipDefinition(catalog, effect.shipId);
      const health = effect.health ?? definition.maxHealth;
      if (!Number.isFinite(health) || health <= 0 || health > definition.maxHealth) throw new Error(`Invalid initial health for Ship "${effect.shipId}".`);
      const acquired = { shipId: effect.shipId, name: effect.name.trim(), health, cargo: [] };
      if (state.ship === null) state.ship = acquired;
      else state.pendingShip = acquired;
      return;
    }
    case 'modifyShipHealth': {
      if (state.ship === null) throw new Error('Cannot modify ship health without a ship.');
      const maximum = findShipDefinition(catalog, state.ship.shipId).maxHealth;
      state.ship.health = clamp(state.ship.health + effect.amount, 0, maximum);
      return;
    }
    case 'addCargoItem': {
      if (state.ship === null) throw new Error('Cannot add cargo without a ship.');
      addStack(state.ship.cargo, effect.itemId, effect.quantity, findShipDefinition(catalog, state.ship.shipId).cargoSlots);
      return;
    }
    case 'removeCargoItem':
      if (state.ship === null) throw new Error('Cannot remove cargo without a ship.');
      removeStack(state.ship.cargo, effect.itemId, effect.quantity);
      return;
    case 'resolveShipReplacement': {
      if (state.ship === null || state.pendingShip === null) throw new Error('No pending ship replacement to resolve.');
      if (effect.disposition === 'destroy' && state.travelState !== 'on_land') throw new Error('A ship can only be destroyed on land during replacement.');
      if (effect.disposition === 'sell') {
        const location = catalog.locations.find(({ id }) => id === state.locationId);
        if (!location?.allowsShipSale) throw new Error('Current Location does not allow ship sales.');
        const proceeds = effect.berries ?? 0;
        if (!Number.isInteger(proceeds) || proceeds < 0) throw new Error('Ship sale Berrys must be a non-negative integer.');
        state.berries += proceeds;
      }
      state.pendingShip.cargo = state.ship.cargo.map((stack) => ({ ...stack }));
      state.ship = state.pendingShip;
      state.pendingShip = null;
      return;
    }
    case 'modifyBerries': {
      if (!Number.isInteger(effect.amount) || state.berries + effect.amount < 0) throw new Error('Berrys cannot become negative.');
      state.berries += effect.amount;
      return;
    }
    case 'loseShip':
      state.ship = state.pendingShip;
      state.pendingShip = null;
      state.locationId = effect.locationId;
      state.travelState = effect.travelState;
      return;
    case 'moveToLocation':
      state.locationId = effect.locationId;
      state.travelState = effect.travelState;
      return;
    case 'setNpcStatus':
      state.npcs[effect.npcId] = { ...getNpcState(state, effect.npcId), status: effect.status };
      return;
    case 'modifyNpcRelationship': {
      const npc = getNpcState(state, effect.npcId);
      state.npcs[effect.npcId] = {
        ...npc,
        relationship: clamp(npc.relationship + effect.amount, -100, 100),
      };
      return;
    }
    case 'modifyNpcStat': {
      const npc = getNpcState(state, effect.npcId);
      state.npcs[effect.npcId] = {
        ...npc,
        stats: {
          ...npc.stats,
          [effect.statId]: clamp(npc.stats[effect.statId] + effect.amount, 0, 50),
        },
      };
      return;
    }
    case 'scheduleEvent':
      state.scheduledEvents.push({
        eventId: effect.eventId,
        dueAgeMonths: state.ageMonths + effect.delayMonths,
        sourceEventId: context.sourceEventId,
        sourceChoiceId: context.sourceChoiceId,
      });
      return;
    case 'setCareerPhase':
      state.careerPhase = effect.phase;
      return;
    case 'setRace':
      state.player.profile.raceId = effect.raceId;
      return;
    case 'setOriginSea':
      state.player.profile.originSeaId = effect.seaId;
      return;
    case 'setAffiliation':
      state.player.profile.affiliationId = effect.affiliationId;
      return;
    case 'endCareer':
      state.careerStatus = 'ended';
      state.careerEndReason = effect.reason;
      state.currentEventId = null;
  }
}

function getNpcState(state: GameState, npcId: string): NpcState {
  return state.npcs[npcId] ?? createDefaultNpcState();
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
