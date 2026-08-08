import { useState } from 'react';
import { contentCatalog } from '../game/content/definitions';
import { getChoiceState } from '../game/engine/conditions';
import { findCurrentEvent, selectNextEvent } from '../game/engine/events';
import { resolveChoice } from '../game/engine/resolution';
import type { ChoiceResolutionResult } from '../game/engine/resolution';
import { createInitialGameState } from '../game/model/initialState';
import { assertValidContent } from '../game/validation/validateContent';

assertValidContent(contentCatalog);

function createNewCareer() {
  return selectNextEvent(createInitialGameState(), contentCatalog.events);
}

export function App() {
  const [gameState, setGameState] = useState(createNewCareer);
  const [lastResolution, setLastResolution] = useState<ChoiceResolutionResult | null>(null);
  const currentEvent = findCurrentEvent(gameState, contentCatalog.events);

  const startNewCareer = () => {
    setGameState(createNewCareer());
    setLastResolution(null);
  };

  const choose = (eventId: string, choiceId: string) => {
    const result = resolveChoice(gameState, contentCatalog.events, eventId, choiceId);
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
      <button type="button" onClick={startNewCareer}>
        New Career
      </button>

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
