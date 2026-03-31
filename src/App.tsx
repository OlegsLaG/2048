import Field from './Field.tsx';
import GameOver from './GameOver.tsx';
import { EventBus } from './engine/EventBus.ts';
import { useEffect, useState } from 'react';
import { EventList } from './engine/EventList.ts';
const bus = new EventBus();

const cells = 4;

function App() {
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    bus.on(EventList.GAME_OVER, () => {
      setGameOver(true);
    });
  }, []);

  return (
    <div>
      <GameOver showGameOver={gameOver} />
      <Field size={cells} bus={bus} />
    </div>
  )
}

export default App
