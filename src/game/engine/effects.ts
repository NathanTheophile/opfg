import type { Effect } from '../content/schema';
import type { ChoiceId, EventId, GameState, NpcState } from '../model/schema';
import { createDefaultNpcState } from '../model/npcState';

export interface EffectContext {
  sourceEventId: EventId;
  sourceChoiceId: ChoiceId;
}

export function applyEffects(state: GameState, effects: Effect[], context: EffectContext): GameState {
  const next: GameState = {
    ...state,
    player: {
      ...state.player,
      stats: { ...state.player.stats },
      traits: [...state.player.traits],
    },
    ship: { ...state.ship },
    flags: [...state.flags],
    items: [...state.items],
    npcs: Object.fromEntries(
      Object.entries(state.npcs).map(([npcId, npc]) => [npcId, { ...npc, stats: { ...npc.stats } }]),
    ),
    history: [...state.history],
    scheduledEvents: [...state.scheduledEvents],
  };

  for (const effect of effects) applyEffect(next, effect, context);
  return next;
}

function applyEffect(state: GameState, effect: Effect, context: EffectContext): void {
  switch (effect.type) {
    case 'setFlag':
      if (!state.flags.includes(effect.flagId)) state.flags.push(effect.flagId);
      return;
    case 'clearFlag':
      state.flags = state.flags.filter((flagId) => flagId !== effect.flagId);
      return;
    case 'addItem':
      if (!state.items.includes(effect.itemId)) state.items.push(effect.itemId);
      return;
    case 'removeItem':
      state.items = state.items.filter((itemId) => itemId !== effect.itemId);
      return;
    case 'addTrait':
      if (!state.player.traits.includes(effect.traitId)) state.player.traits.push(effect.traitId);
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
    case 'modifyShipCondition':
      state.ship.condition = clamp(state.ship.condition + effect.amount, 0, 3);
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
