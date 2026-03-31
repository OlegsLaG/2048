import { useEffect, useRef } from 'react';
import gameOverSoundFile from './assets/sounds/game_over.mp3';

function GameOver({ showGameOver }: { showGameOver: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      <button className={`${showGameOver ? 'show' : null}`} onClick={() => window.location.reload()}>
        Play Again
      </button>
    </div>
  )
}

export default GameOver;
