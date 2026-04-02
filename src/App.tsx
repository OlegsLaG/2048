import Field from './Field.tsx';
import GameOver from './GameOver.tsx';
import { EventBus } from './engine/EventBus.ts';
import { useEffect, useState } from 'react';
import { EventList } from './engine/EventList.ts';
const bus = new EventBus();

const cells = 4;

function App() {
  const [gameOver, setGameOver] = useState(false);

  const onGameOver = () => {
    console.warn('Game Over');
    setGameOver(true);
  };

  const onNewGame = () => {
    console.warn('New Game');
    setGameOver(false);
  };

  useEffect(() => {
    bus.on(EventList.GAME_OVER, onGameOver);

    return () => {
      bus.off(EventList.GAME_OVER, onGameOver);
    };
  });

  useEffect(() => {
    bus.on(EventList.NEW_GAME, onNewGame);

    return () => {
      bus.off(EventList.NEW_GAME, onNewGame);
    };
  });

  return (
    <div>
      <GameOver showGameOver={gameOver} bus={bus} />
      <Field size={cells} bus={bus} />
    </div>
  )
}

export default App
