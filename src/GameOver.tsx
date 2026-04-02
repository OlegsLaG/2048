import { useEffect, useRef } from 'react';
import gameOverSoundFile from './assets/sounds/game_over.mp3';
import { EventList } from './engine/EventList.ts';
import { EventBus } from './engine/EventBus.ts';

function GameOver({ showGameOver, bus }: { showGameOver: boolean,  bus: EventBus<Record<string, unknown>>  }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startNewGame = () => {
    bus.emit(EventList.NEW_GAME, null);
  }

  useEffect(() => {
    audioRef.current = new Audio(gameOverSoundFile);

    const audio = audioRef.current;
    if (audio && showGameOver) {
      audio.currentTime = 0;
      audio.play().catch(err => {
        console.warn('GameOver sound blocked or failed:', err);
      });
    }
  }, [showGameOver]);

  return (
    <div className={`game-over-container ${showGameOver ? 'show' : null}`}>
      <button className={`${showGameOver ? 'show' : null}`} onClick={startNewGame}>
        Play Again
      </button>
    </div>
  )
}

export default GameOver;
