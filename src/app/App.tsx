import { useState } from 'react';
import { contentCatalog } from '../game/content/definitions';
import { getChoiceState } from '../game/engine/conditions';
import { getDicePreview } from '../game/engine/dice';
import { findCurrentEvent, selectNextEvent } from '../game/engine/events';
import { resolveChoice } from '../game/engine/resolution';
import type { ChoiceResolutionResult } from '../game/engine/resolution';
import { clearGameState, loadGameState, saveGameState } from '../game/engine/save';
import { createInitialGameState } from '../game/model/initialState';
import type { GameState, NpcStatId } from '../game/model/schema';
import type { DiceResult, StatId } from '../game/content/schema';
import { assertValidContent } from '../game/validation/validateContent';
import { loadLocale, saveLocale, supportedLocales, t, type LocaleId } from '../game/localization';

assertValidContent(contentCatalog);

let fallbackSeed = Date.now() >>> 0;

const STAT_LABEL_KEYS: Record<StatId, string> = {
  health: 'stat.health', morale: 'stat.morale', strength: 'stat.strength', agility: 'stat.agility', observation: 'stat.observation',
  intelligence: 'stat.intelligence', navigation: 'stat.navigation', charisma: 'stat.charisma', luck: 'stat.luck', awakening: 'stat.awakening',
};

const RESULT_LABEL_KEYS: Record<DiceResult, string> = {
  criticalFailure: 'dice.criticalFailure', failure: 'dice.failure', success: 'dice.success', criticalSuccess: 'dice.criticalSuccess',
};

const NPC_STAT_LABEL_KEYS: Record<NpcStatId, string> = {
  health: 'stat.health', morale: 'stat.morale', strength: 'stat.strength', observation: 'stat.observation',
  intelligence: 'stat.intelligence', luck: 'stat.luck', loyalty: 'npcStat.loyalty', calm: 'npcStat.calm',
};

const NPC_STAT_IDS = Object.keys(NPC_STAT_LABEL_KEYS) as NpcStatId[];

function generateCareerSeed(): number {
  if (globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
  }
  fallbackSeed = (fallbackSeed + 0x6d2b79f5) >>> 0;
  return fallbackSeed;
}

function createNewCareer(seed: number = generateCareerSeed()): GameState {
  return selectNextEvent(createInitialGameState(seed), contentCatalog);
}

export function App() {
  const [locale, setLocale] = useState<LocaleId>(() => loadLocale(window.localStorage, navigator.language));
  const [savedGame, setSavedGame] = useState<GameState | null>(() => loadGameState(window.localStorage));
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [lastResolution, setLastResolution] = useState<ChoiceResolutionResult | null>(null);
  const [choiceInput, setChoiceInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const translate = (key: string) => t(key, locale, { playerName: gameState?.player.profile.name ?? '' });
  const changeLocale = (nextLocale: LocaleId) => { saveLocale(window.localStorage, nextLocale); setLocale(nextLocale); };
  const languageSelector = <div>{translate('ui.language')}: {supportedLocales.map((entry) => <button key={entry} type="button" disabled={locale === entry} onClick={() => changeLocale(entry)}>{entry.toUpperCase()}</button>)}</div>;

  const startCareer = (restart: boolean) => {
    if (restart) clearGameState(window.localStorage);
    const state = createNewCareer();
    saveGameState(window.localStorage, state);
    setSavedGame(state);
    setGameState(state);
    setLastResolution(null);
    setChoiceInput('');
    setInputError(null);
  };

  const continueCareer = () => {
    if (!savedGame) return;
    setGameState(savedGame);
    setLastResolution(null);
  };

  if (!gameState) {
    return (
      <main>
        <h1>{translate('ui.app.title')}</h1>
        {languageSelector}
        {savedGame ? (
          <>
            <button type="button" onClick={continueCareer}>{translate('ui.action.continueCareer')}</button>
            <button type="button" onClick={() => startCareer(true)}>{translate('ui.action.restartCareer')}</button>
          </>
        ) : (
          <button type="button" onClick={() => startCareer(false)}>{translate('ui.action.newCareer')}</button>
        )}
      </main>
    );
  }

  const currentEvent = findCurrentEvent(gameState, contentCatalog);
  const choose = (eventId: string, choiceId: string, input?: string) => {
    let result: ChoiceResolutionResult;
    try {
      result = resolveChoice(gameState, contentCatalog, eventId, choiceId, input);
    } catch {
      setInputError(translate('ui.invalidInput'));
      return;
    }
    saveGameState(window.localStorage, result.state);
    setSavedGame(result.state);
    setGameState(result.state);
    setLastResolution(result);
    setChoiceInput('');
    setInputError(null);
  };

  return (
    <main>
      <h1>{translate('ui.app.title')}</h1>
      {languageSelector}
      <p>{translate('ui.month')}: {Math.max(0, gameState.ageMonths - 180)}</p>
      <p>Slot: {gameState.slotInMonth}</p>
      <p>{translate('ui.age')}: {Math.floor(gameState.ageMonths / 12)} {translate('ui.years')}, {gameState.ageMonths % 12} {translate('ui.month').toLowerCase()}</p>
      <p>{translate('ui.phase')}: {translate(`phase.${gameState.careerPhase}`)}</p>
      <p>{translate('ui.travel')}: {translate(`travel.${gameState.travelState}`)}</p>
      <p>{translate('ui.location')}: {gameState.locationId}</p>
      <p>{translate('ui.ship')}: {gameState.ship ? `${gameState.ship.name} (${gameState.ship.health} HP)` : '—'}</p>
      <p>{translate('ui.career')}: {translate(`careerStatus.${gameState.careerStatus}`)}</p>
      <p>{translate('ui.careerEnd')}: {gameState.careerEndReason ? translate(`careerEndReason.${gameState.careerEndReason}`) : '—'}</p>
      <button type="button" onClick={() => startCareer(true)}>{translate('ui.action.restartCareer')}</button>

      <section>
        <h2>{translate('ui.profile.title')}</h2>
        <h3>{translate('ui.profile.identity')}</h3>
        <p>{translate('ui.field.name')}: {gameState.player.profile.name ?? '—'}</p>
        <p>{translate('ui.field.race')}: {gameState.player.profile.raceId ? translate(contentCatalog.races.find(({ id }) => id === gameState.player.profile.raceId)?.nameKey ?? '') : '—'}</p>
        <p>{translate('ui.field.originSea')}: {gameState.player.profile.originSeaId ? translate(contentCatalog.seas.find(({ id }) => id === gameState.player.profile.originSeaId)?.nameKey ?? '') : '—'}</p>
        <p>{translate('ui.field.affiliation')}: {gameState.player.profile.affiliationId ? translate(contentCatalog.affiliations.find(({ id }) => id === gameState.player.profile.affiliationId)?.nameKey ?? '') : '—'}</p>
        <h3>{translate('ui.profile.stats')}</h3>
        {(Object.keys(STAT_LABEL_KEYS) as StatId[]).map((statId) => <p key={statId}>{translate(STAT_LABEL_KEYS[statId])}: {gameState.player.stats[statId] ?? '—'}</p>)}
        <h3>{translate('ui.profile.traits')}</h3>
        {gameState.player.traits.length === 0 ? (
          <p>{translate('ui.profile.none')}</p>
        ) : gameState.player.traits.map((traitId) => {
          const trait = contentCatalog.traits.find(({ id }) => id === traitId);
          return trait ? (
            <div key={trait.id}>
              <strong>{translate(trait.nameKey)}</strong>
              <p>{translate(trait.descriptionKey)}</p>
            </div>
          ) : null;
        })}
      </section>

      <section>
        <h2>{translate('ui.npcProfiles')}</h2>
        {Object.entries(gameState.npcs).map(([npcId, npc]) => {
          const definition = contentCatalog.npcs.find(({ id }) => id === npcId);
          return (
            <div key={npcId}>
              <h3>{definition ? translate(definition.nameKey) : npcId}</h3>
              <p>{translate('ui.status')}: {translate(`npcStatus.${npc.status}`)}</p>
              <p>{translate('ui.relationship')}: {npc.relationship > 0 ? '+' : ''}{npc.relationship}</p>
              <h4>{translate('ui.profile.stats')}</h4>
              {NPC_STAT_IDS.map((statId) => (
                <p key={statId}>{translate(NPC_STAT_LABEL_KEYS[statId])}: {npc.stats[statId]}</p>
              ))}
            </div>
          );
        })}
      </section>

      <section>
        <h2>{translate('ui.currentEvent')}</h2>
        {currentEvent ? (
          <>
            <h3>{translate(currentEvent.titleKey)}</h3>
            <p>{translate(currentEvent.textKey)}</p>
            <h4>{translate('ui.choices')}</h4>
            {inputError && <p role="alert">{inputError}</p>}
            {currentEvent.choices.map((choice) => {
              const choiceState = getChoiceState(choice, gameState);
              if (!choiceState.visible) return null;
              const preview = choice.resolution.type === 'dice'
                ? getDicePreview(choice.resolution, gameState, contentCatalog)
                : null;
              const dicePrefix = preview === null
                ? ''
                : preview.available
                  ? `[${translate(STAT_LABEL_KEYS[preview.statId])} — ${Math.round(preview.successProbability * 100)} %] `
                  : `[${translate(STAT_LABEL_KEYS[preview.statId])} — ${translate('ui.inactive')}] `;

              return (
                <div key={choice.id}>
                  {choice.input?.type === 'text' && (
                    <input
                      type="text"
                      aria-label={choice.input.target}
                      value={choiceInput}
                      minLength={choice.input.minLength}
                      maxLength={choice.input.maxLength}
                      placeholder={choice.input.placeholderKey ? translate(choice.input.placeholderKey) : undefined}
                      onChange={(event) => setChoiceInput(event.target.value)}
                    />
                  )}
                  <button
                    type="button"
                    disabled={!choiceState.available}
                    onClick={() => choose(currentEvent.id, choice.id, choice.input ? choiceInput : undefined)}
                  >
                    {dicePrefix}{translate(choice.textKey)}
                  </button>
                </div>
              );
            })}
          </>
        ) : (
          <p>{translate(gameState.careerStatus === 'ended' ? 'ui.careerComplete' : 'ui.noEvent')}</p>
        )}
      </section>

      {lastResolution && (
        <section>
          <h2>{translate('ui.lastResolution')}</h2>
          {lastResolution.dice && (
            <>
              <p>{translate('ui.d20')}: {lastResolution.dice.rawRoll}</p>
              {lastResolution.dice.statValue !== null && (
                <p>
                  {translate(STAT_LABEL_KEYS[lastResolution.dice.statId])}: {lastResolution.dice.statModifier >= 0 ? '+' : ''}
                  {lastResolution.dice.statModifier}
                </p>
              )}
              {lastResolution.dice.conditionalModifiers.map((modifier, index) => (
                <p key={`${modifier.labelKey}-${index}`}>
                  {translate(modifier.labelKey)}: {modifier.value >= 0 ? '+' : ''}{modifier.value}
                </p>
              ))}
              <p>{translate('ui.total')}: {lastResolution.dice.total}</p>
              <p>{translate('ui.result')}: {translate(RESULT_LABEL_KEYS[lastResolution.dice.result])}</p>
            </>
          )}
          <p>{translate('ui.outcome')}: {translate(lastResolution.outcome.textKey)}</p>
        </section>
      )}
    </main>
  );
}
