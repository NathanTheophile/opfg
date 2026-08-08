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

assertValidContent(contentCatalog);

let fallbackSeed = Date.now() >>> 0;

const STAT_LABELS: Record<StatId, string> = {
  health: 'Santé',
  morale: 'Moral',
  strength: 'Force',
  observation: 'Observation',
  intelligence: 'Intelligence',
  navigation: 'Navigation',
  charisma: 'Charisme',
  luck: 'Chance',
  awakening: 'Éveil',
};

const RESULT_LABELS: Record<DiceResult, string> = {
  criticalFailure: 'Échec critique',
  failure: 'Échec',
  success: 'Succès',
  criticalSuccess: 'Succès critique',
};

const NPC_STAT_LABELS: Record<NpcStatId, string> = {
  health: 'Santé',
  morale: 'Moral',
  strength: 'Force',
  observation: 'Observation',
  intelligence: 'Intelligence',
  luck: 'Chance',
  loyalty: 'Loyauté',
  calm: 'Calme',
};

const NPC_STAT_IDS = Object.keys(NPC_STAT_LABELS) as NpcStatId[];

function generateCareerSeed(): number {
  if (globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
  }
  fallbackSeed = (fallbackSeed + 0x6d2b79f5) >>> 0;
  return fallbackSeed;
}

function createNewCareer(seed: number = generateCareerSeed()): GameState {
  return selectNextEvent(createInitialGameState(seed), contentCatalog.events);
}

export function App() {
  const [savedGame, setSavedGame] = useState<GameState | null>(() => loadGameState(window.localStorage));
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [lastResolution, setLastResolution] = useState<ChoiceResolutionResult | null>(null);

  const startCareer = (restart: boolean) => {
    if (restart) clearGameState(window.localStorage);
    const state = createNewCareer();
    saveGameState(window.localStorage, state);
    setSavedGame(state);
    setGameState(state);
    setLastResolution(null);
  };

  const continueCareer = () => {
    if (!savedGame) return;
    setGameState(savedGame);
    setLastResolution(null);
  };

  if (!gameState) {
    return (
      <main>
        <h1>Jam OP Fan Game</h1>
        {savedGame ? (
          <>
            <button type="button" onClick={continueCareer}>Continue Career</button>
            <button type="button" onClick={() => startCareer(true)}>Restart Career</button>
          </>
        ) : (
          <button type="button" onClick={() => startCareer(false)}>New Career</button>
        )}
      </main>
    );
  }

  const currentEvent = findCurrentEvent(gameState, contentCatalog.events);
  const choose = (eventId: string, choiceId: string) => {
    const result = resolveChoice(gameState, contentCatalog.events, eventId, choiceId);
    saveGameState(window.localStorage, result.state);
    setSavedGame(result.state);
    setGameState(result.state);
    setLastResolution(result);
  };

  return (
    <main>
      <h1>Jam OP Fan Game</h1>
      <p>Month: {gameState.month}</p>
      <p>Age: {Math.floor(gameState.ageMonths / 12)} years, {gameState.ageMonths % 12} months</p>
      <p>Phase: {gameState.careerPhase}</p>
      <p>Travel: {gameState.travelState}</p>
      <p>Location: {gameState.locationId}</p>
      <p>Ship: {gameState.ship.condition}</p>
      <p>Career: {gameState.careerStatus}</p>
      <p>Career End: {gameState.careerEndReason ?? '—'}</p>
      <button type="button" onClick={() => startCareer(true)}>Restart Career</button>

      <section>
        <h2>Player Profile</h2>
        <p>Health: {gameState.player.stats.health}</p>
        <p>Morale: {gameState.player.stats.morale}</p>
        <p>Strength: {gameState.player.stats.strength}</p>
        <p>Observation: {gameState.player.stats.observation}</p>
        <p>Intelligence: {gameState.player.stats.intelligence}</p>
        <p>Navigation: {gameState.player.stats.navigation}</p>
        <p>Charisma: {gameState.player.stats.charisma}</p>
        <p>Luck: {gameState.player.stats.luck}</p>
        <p>Awakening: {gameState.player.stats.awakening ?? '—'}</p>
        <h3>Traits</h3>
        {gameState.player.traits.length === 0 ? (
          <p>None</p>
        ) : gameState.player.traits.map((traitId) => {
          const trait = contentCatalog.traits.find(({ id }) => id === traitId);
          return trait ? (
            <div key={trait.id}>
              <strong>{trait.name}</strong>
              <p>{trait.description}</p>
            </div>
          ) : null;
        })}
      </section>

      <section>
        <h2>NPC Profiles</h2>
        {Object.entries(gameState.npcs).map(([npcId, npc]) => {
          const definition = contentCatalog.npcs.find(({ id }) => id === npcId);
          return (
            <div key={npcId}>
              <h3>{definition?.name ?? npcId}</h3>
              <p>Status: {npc.status}</p>
              <p>Relationship: {npc.relationship > 0 ? '+' : ''}{npc.relationship}</p>
              <h4>Stats</h4>
              {NPC_STAT_IDS.map((statId) => (
                <p key={statId}>{NPC_STAT_LABELS[statId]}: {npc.stats[statId]}</p>
              ))}
            </div>
          );
        })}
      </section>

      <section>
        <h2>Current Event</h2>
        {currentEvent ? (
          <>
            <h3>{currentEvent.title}</h3>
            <p>{currentEvent.text}</p>
            <h4>Choices</h4>
            {currentEvent.choices.map((choice) => {
              const choiceState = getChoiceState(choice, gameState);
              if (!choiceState.visible) return null;
              const preview = choice.resolution.type === 'dice'
                ? getDicePreview(choice.resolution, gameState)
                : null;
              const dicePrefix = preview === null
                ? ''
                : preview.available
                  ? `[${STAT_LABELS[preview.statId]} — ${Math.round(preview.successProbability * 100)} %] `
                  : `[${STAT_LABELS[preview.statId]} — inactive] `;

              return (
                <button
                  key={choice.id}
                  type="button"
                  disabled={!choiceState.available}
                  onClick={() => choose(currentEvent.id, choice.id)}
                >
                  {dicePrefix}{choice.text}
                </button>
              );
            })}
          </>
        ) : (
          <p>{gameState.careerStatus === 'ended' ? 'Career complete.' : 'No event available.'}</p>
        )}
      </section>

      {lastResolution && (
        <section>
          <h2>Last Resolution</h2>
          {lastResolution.dice && (
            <>
              <p>D20: {lastResolution.dice.rawRoll}</p>
              {lastResolution.dice.statValue !== null && (
                <p>
                  {STAT_LABELS[lastResolution.dice.statId]}: {lastResolution.dice.statModifier >= 0 ? '+' : ''}
                  {lastResolution.dice.statModifier}
                </p>
              )}
              {lastResolution.dice.conditionalModifiers.map((modifier, index) => (
                <p key={`${modifier.label}-${index}`}>
                  {modifier.label}: {modifier.value >= 0 ? '+' : ''}{modifier.value}
                </p>
              ))}
              <p>Total: {lastResolution.dice.total}</p>
              <p>Result: {RESULT_LABELS[lastResolution.dice.result]}</p>
            </>
          )}
          <p>Outcome: {lastResolution.outcome.text}</p>
        </section>
      )}
    </main>
  );
}
