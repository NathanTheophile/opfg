import type { ChoiceDefinition } from '../content/schema';
import type { Condition } from '../content/schema';
import type { GameState } from '../model/schema';

export interface ChoiceState {
  visible: boolean;
  available: boolean;
}

export function evaluateCondition(condition: Condition, state: GameState): boolean {
  switch (condition.type) {
    case 'all':
      return condition.conditions.every((entry) => evaluateCondition(entry, state));
    case 'any':
      return condition.conditions.some((entry) => evaluateCondition(entry, state));
    case 'not':
      return !evaluateCondition(condition.condition, state);
    case 'hasTrait':
      return state.player.traits.includes(condition.traitId);
    case 'statAtLeast':
      return state.player.stats[condition.statId] >= condition.value;
    case 'hasFlag':
      return state.flags.includes(condition.flagId);
    case 'hasItem':
      return state.items.includes(condition.itemId);
    case 'locationIs':
      return state.locationId === condition.locationId;
    case 'isAtSea':
      return state.travelState === 'at_sea';
    case 'isOnLand':
      return state.travelState === 'on_land';
    case 'careerPhaseIs':
      return state.careerPhase === condition.phase;
    case 'ageAtLeastMonths':
      return state.ageMonths >= condition.value;
    case 'ageAtMostMonths':
      return state.ageMonths <= condition.value;
    case 'shipConditionAtLeast':
      return state.ship.condition >= condition.value;
    case 'shipConditionAtMost':
      return state.ship.condition <= condition.value;
    case 'npcStatusIs':
      return state.npcs[condition.npcId]?.status === condition.status;
    case 'npcRelationshipAtLeast':
      return (state.npcs[condition.npcId]?.relationship ?? Number.NEGATIVE_INFINITY) >= condition.value;
    case 'hasChosen':
      return state.history.some(
        (entry) => entry.eventId === condition.eventId && entry.choiceId === condition.choiceId,
      );
    case 'monthAtLeast':
      return state.month >= condition.value;
  }
}

export function getChoiceState(choice: ChoiceDefinition, state: GameState): ChoiceState {
  const visible = choice.visibleIf === undefined || evaluateCondition(choice.visibleIf, state);
  return {
    visible,
    available: visible && (choice.availableIf === undefined || evaluateCondition(choice.availableIf, state)),
  };
}
