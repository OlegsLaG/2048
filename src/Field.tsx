import Grid from './Grid.tsx';
import FieldHeader from './FieldHeader.tsx';
import type { EventBus } from './engine/EventBus.ts';
import { useState, useEffect } from 'react';
import { EventList } from './engine/EventList.ts';

function Field({ size, bus }: { size: number, bus: EventBus<Record<string, unknown>> }) {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('bestScore');

    if (saved) {
      setBestScore(Number(saved));
    }
  }, []);

  useEffect(() => {
    bus.on(EventList.GAME_OVER, () => {
      setScore(0);
      setBestScore(Number(score))
    });

    return () => {
      bus.off(EventList.GAME_OVER, () => {
        setScore(0);
        setBestScore(Number(score))
      });
    }
  });

  useEffect(() => {
    bus.on(EventList.GAME_WON, () => {
      setScore(0);
      setBestScore(Number(score))
    });

    return () => {
      bus.off(EventList.GAME_WON, () => {
        setScore(0);
        setBestScore(Number(score))
      });
    }
  });
  return (
    <div className="field">
      <FieldHeader size={size} score={score} bestScore={bestScore} />
      <Grid size={size} bus={bus} onScore={(newScore) => setScore((prev: number) => prev + newScore)} />
    </div>
  )
}

export default Field;
