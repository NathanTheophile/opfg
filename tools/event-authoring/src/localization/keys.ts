import type { ChoiceDefinition, EventDefinition, LocalizationKey, Outcome, Resolution } from '../gameSchema/current/contract';

export const eventTitleKey = (eventId: string): LocalizationKey => `event.${eventId}.title`;
export const eventTextKey = (eventId: string): LocalizationKey => `event.${eventId}.text`;
export const eventKeys = (eventId: string) => ({ titleKey: eventTitleKey(eventId), textKey: eventTextKey(eventId) });
export const choiceKey = (eventId: string, choiceId: string): LocalizationKey => `event.${eventId}.choice.${choiceId}.text`;
export const choicePlaceholderKey = (eventId: string, choiceId: string): LocalizationKey => `event.${eventId}.choice.${choiceId}.placeholder`;
export const modifierLabelKey = (eventId: string, choiceId: string, index: number): LocalizationKey => `event.${eventId}.choice.${choiceId}.modifier.${index}.label`;
export const outcomeKey = (eventId: string, choiceId: string, outcomeId: string): LocalizationKey => `event.${eventId}.choice.${choiceId}.outcome.${outcomeId}.text`;
export const traitNameKey = (id: string): LocalizationKey => `trait.${id}.name`;
export const traitDescriptionKey = (id: string): LocalizationKey => `trait.${id}.description`;
export const itemNameKey = (id: string): LocalizationKey => `item.${id}.name`;
export const raceNameKey = (id: string): LocalizationKey => `race.${id}.name`;
export const seaNameKey = (id: string): LocalizationKey => `sea.${id}.name`;
export const affiliationNameKey = (id: string): LocalizationKey => `affiliation.${id}.name`;
export const npcNameKey = (id: string): LocalizationKey => `npc.${id}.name`;

const normalizedOutcome = (eventId: string, choiceId: string, outcome: Outcome): Outcome => ({
  ...outcome,
  textKey: outcomeKey(eventId, choiceId, outcome.id),
});

const normalizedResolution = (eventId: string, choiceId: string, resolution: Resolution): Resolution => resolution.type === 'deterministic'
  ? { ...resolution, outcome: normalizedOutcome(eventId, choiceId, resolution.outcome) }
  : {
    ...resolution,
    modifiers: resolution.modifiers?.map((modifier, index) => ({ ...modifier, displayLabelKey: modifierLabelKey(eventId, choiceId, index) })),
    outcomes: {
      criticalFailure: normalizedOutcome(eventId, choiceId, resolution.outcomes.criticalFailure),
      failure: normalizedOutcome(eventId, choiceId, resolution.outcomes.failure),
      success: normalizedOutcome(eventId, choiceId, resolution.outcomes.success),
      criticalSuccess: normalizedOutcome(eventId, choiceId, resolution.outcomes.criticalSuccess),
    },
  };

export const normalizeEventLocalizationKeys = (event: EventDefinition): EventDefinition => ({
  ...event,
  ...eventKeys(event.id),
  choices: event.choices.map((choice): ChoiceDefinition => ({
    ...choice,
    textKey: choiceKey(event.id, choice.id),
    input: choice.input ? { ...choice.input, placeholderKey: choice.input.placeholderKey ? choicePlaceholderKey(event.id, choice.id) : undefined } : undefined,
    resolution: normalizedResolution(event.id, choice.id, choice.resolution),
  })),
});

export const collectEventLocalizationKeys = (event: EventDefinition): LocalizationKey[] => {
  const keys = [event.titleKey, event.textKey];
  for (const choice of event.choices) {
    keys.push(choice.textKey);
    if (choice.input?.placeholderKey) keys.push(choice.input.placeholderKey);
    if (choice.resolution.type === 'dice') for (const modifier of choice.resolution.modifiers ?? []) keys.push(modifier.displayLabelKey);
    const outcomes = choice.resolution.type === 'deterministic' ? [choice.resolution.outcome] : Object.values(choice.resolution.outcomes);
    for (const outcome of outcomes) keys.push(outcome.textKey);
  }
  return [...new Set(keys)];
};

export const mapEventLocalizationKeys = (from: EventDefinition, to: EventDefinition): Array<[LocalizationKey, LocalizationKey]> => {
  const pairs: Array<[LocalizationKey, LocalizationKey]> = [[from.titleKey, to.titleKey], [from.textKey, to.textKey]];
  const count = Math.min(from.choices.length, to.choices.length);
  for (let i = 0; i < count; i += 1) {
    const a = from.choices[i]; const b = to.choices[i];
    pairs.push([a.textKey, b.textKey]);
    if (a.input?.placeholderKey && b.input?.placeholderKey) pairs.push([a.input.placeholderKey, b.input.placeholderKey]);
    if (a.resolution.type === 'dice' && b.resolution.type === 'dice') {
      for (let j = 0; j < Math.min(a.resolution.modifiers?.length ?? 0, b.resolution.modifiers?.length ?? 0); j += 1) {
        pairs.push([a.resolution.modifiers![j].displayLabelKey, b.resolution.modifiers![j].displayLabelKey]);
      }
    }
    if (a.resolution.type === b.resolution.type) {
      const ao = a.resolution.type === 'deterministic' ? [a.resolution.outcome] : Object.values(a.resolution.outcomes);
      const bo = b.resolution.type === 'deterministic' ? [b.resolution.outcome] : Object.values(b.resolution.outcomes);
      for (let j = 0; j < Math.min(ao.length, bo.length); j += 1) pairs.push([ao[j].textKey, bo[j].textKey]);
    }
  }
  return pairs;
};

