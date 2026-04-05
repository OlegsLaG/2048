import Field from './Field.tsx';
import GameOver from './GameOver.tsx';
import GameWon from './GameWon.tsx';
import { EventBus } from './engine/EventBus.ts';
import { useEffect, useState } from 'react';
import { EventList } from './engine/EventList.ts';
const bus = new EventBus();

const cells = 4;

function App() {
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const onGameOver = () => {
    setGameOver(true);
  };

  const onGameWon = () => {
    setGameWon(true);
  };

  const onNewGame = () => {
    setGameOver(false);
  };

  useEffect(() => {
    bus.on(EventList.GAME_OVER, onGameOver);

    return () => {
      bus.off(EventList.GAME_OVER, () => {});
    };
  });

  useEffect(() => {
    bus.on(EventList.GAME_WON, onGameWon);

    return () => {
      bus.off(EventList.GAME_WON, () => {});
    };
  });

  useEffect(() => {
    bus.on(EventList.NEW_GAME, onNewGame);

    return () => {
      bus.off(EventList.NEW_GAME, () => {});
    };
  });

  return (
    <div>
      <GameOver showGameOver={gameOver} bus={bus} />
      <GameWon showGameWon={gameWon} bus={bus} />
      <Field size={cells} bus={bus} />
    </div>
  )
}

export default App
