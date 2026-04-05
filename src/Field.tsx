import Grid from './Grid.tsx';
import FieldHeader from './FieldHeader.tsx';
import type { EventBus } from './engine/EventBus.ts';
import { useState, useEffect } from 'react';
import { EventList } from './engine/EventList.ts';

function Field({ size, bus }: { size: number, bus: EventBus<Record<string, unknown>> }) {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const updateBestScore = (score: number) => {
    setBestScore(prev => {
      if (score > prev) {
        localStorage.setItem('bestScore', String(score));
        return score;
      }
      return prev;
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem('bestScore');

    if (saved) {
      setBestScore(Number(saved));
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      console.warn('Game Over', score);
      updateBestScore(score);
      setScore(0);
    };

    bus.on(EventList.GAME_OVER, handler);

    return () => {
      bus.off(EventList.GAME_OVER, handler);
    };
  }, [bus, score]);

  useEffect(() => {
    const handler = () => {
      console.warn('Game Over', score);
      updateBestScore(score);
      setScore(0);
    };

    bus.on(EventList.GAME_WON, handler);

    return () => {
      bus.off(EventList.GAME_WON, handler);
    };
  }, [bus, score]);

  return (
    <div className="field">
      <FieldHeader size={size} score={score} bestScore={bestScore} />
      <Grid size={size} bus={bus} onScore={(newScore) => setScore((prev: number) => prev + newScore)} />
    </div>
  )
}

export default Field;
