import {useEffect, useRef, useState} from 'react';
import gameWonSoundFile from './assets/sounds/game_won.mp3';
import { EventList } from './engine/EventList.ts';
import { EventBus } from './engine/EventBus.ts';

function GameWon({ showGameWon, bus }: { showGameWon: boolean,  bus: EventBus<Record<string, unknown>>  }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [score, setScore] = useState<string | null>(null);
  const [bestScore, setBestScore] = useState<string | null>(null);

  const startNewGame = () => {
    bus.emit(EventList.NEW_GAME, null);
  }

  useEffect(() => {
    audioRef.current = new Audio(gameWonSoundFile);
    setScore(() => localStorage.getItem('score'));
    setBestScore(() => localStorage.getItem('bestScore'));

    const audio = audioRef.current;
    if (audio && showGameWon) {
      audio.currentTime = 0;
      audio.play().catch(err => {
        console.warn('GameWon sound blocked or failed:', err);
      });
    }
  }, [showGameWon]);

  return (
    <div className={`game-won-container ${showGameWon ? 'show' : null}`}>
      <div className={'game-won-content'}>
        <h1>Congratulations! You won!</h1>
        {score && bestScore && score < bestScore
          ? <p>You've reached {score} and have beaten your highest score {bestScore}</p>
          : <p>You've reached {score}</p>
        }
        <button
          className={`${showGameWon ? 'show' : null}`}
          onClick={startNewGame}
        >
          Play Again
        </button>
      </div>
    </div>
  )
}

export default GameWon;
