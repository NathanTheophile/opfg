import { useState } from 'react';
import { contentCatalog } from '../game/content/definitions';
import { getChoiceState } from '../game/engine/conditions';
import { findCurrentEvent, selectNextEvent } from '../game/engine/events';
import { resolveChoice } from '../game/engine/resolution';
import type { ChoiceResolutionResult } from '../game/engine/resolution';
import { clearGameState, loadGameState, saveGameState } from '../game/engine/save';
import { createInitialGameState } from '../game/model/initialState';
import type { GameState } from '../game/model/schema';
import { assertValidContent } from '../game/validation/validateContent';

assertValidContent(contentCatalog);

let fallbackSeed = Date.now() >>> 0;

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
      <p>Location: {gameState.locationId}</p>
      <p>Ship: {gameState.ship.condition}</p>
      <p>Career: {gameState.careerStatus}</p>
      <button type="button" onClick={() => startCareer(true)}>Restart Career</button>

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

              return (
                <button
                  key={choice.id}
                  type="button"
                  disabled={!choiceState.available}
                  onClick={() => choose(currentEvent.id, choice.id)}
                >
                  {choice.text}
                </button>
              );
            })}
          </>
        ) : (
          <p>{gameState.careerStatus === 'ended' ? 'Temporary career complete.' : 'No event available.'}</p>
        )}
      </section>

      {lastResolution && (
        <section>
          <h2>Last Resolution</h2>
          {lastResolution.dice && (
            <>
              <p>Roll: {lastResolution.dice.rawRoll}</p>
              {lastResolution.dice.modifiers.map((modifier, index) => (
                <p key={`${modifier.label}-${index}`}>
                  {modifier.label}: {modifier.value >= 0 ? '+' : ''}{modifier.value} ({modifier.displayInfluence})
                </p>
              ))}
              <p>Total: {lastResolution.dice.total}</p>
            </>
          )}
          <p>Outcome: {lastResolution.outcome.text}</p>
        </section>
      )}
    </main>
  );
}
