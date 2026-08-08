import { useState } from 'react';
import { createInitialGameState } from '../game/model/initialState';

export function App() {
  const [gameState, setGameState] = useState(createInitialGameState);

  return (
    <main>
      <h1>Jam OP Fan Game</h1>
      <p>Month: {gameState.month}</p>
      <p>Location: {gameState.locationId}</p>
      <p>Ship: {gameState.ship.condition}</p>
      <p>Career: {gameState.careerStatus}</p>
      <button type="button" onClick={() => setGameState(createInitialGameState())}>
        New Career
      </button>
    </main>
  );
}
