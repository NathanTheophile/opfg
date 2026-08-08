import { useState } from 'react';
import { contentCatalog } from '../game/content/definitions';
import { getChoiceState } from '../game/engine/conditions';
import { findCurrentEvent, selectNextEvent } from '../game/engine/events';
import { resolveChoice } from '../game/engine/resolution';
import { createInitialGameState } from '../game/model/initialState';
import { assertValidContent } from '../game/validation/validateContent';

assertValidContent(contentCatalog);

function createNewCareer() {
  return selectNextEvent(createInitialGameState(), contentCatalog.events);
}

export function App() {
  const [gameState, setGameState] = useState(createNewCareer);
  const currentEvent = findCurrentEvent(gameState, contentCatalog.events);

  return (
    <main>
      <h1>Jam OP Fan Game</h1>
      <p>Month: {gameState.month}</p>
      <p>Location: {gameState.locationId}</p>
      <p>Ship: {gameState.ship.condition}</p>
      <p>Career: {gameState.careerStatus}</p>
      <button type="button" onClick={() => setGameState(createNewCareer())}>
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
                  onClick={() =>
                    setGameState((state) =>
                      resolveChoice(state, contentCatalog.events, currentEvent.id, choice.id),
                    )
                  }
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
    </main>
  );
}
