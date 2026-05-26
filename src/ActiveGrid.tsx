import ActiveCell from './ActiveCell.tsx';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { type ActiveCellType, Direction } from './utils/types.ts';
import startNewGame from './core/StartNewGame.ts';
import { EventList } from './engine/EventList.ts';
import setNewPosition from './core/SetNewPosition.ts';
import createNewActiveCell from './core/CreateNewActiveCell.ts';
import { EventBus } from './engine/EventBus.ts';

function ActiveGrid(
  {
    size,
    bus,
    onScore,
    grid,
    cellRefs
  }: {
    size: number,
    bus: EventBus<Record<string, unknown>>,
    onScore: (newScore: number) => void,
    grid: {
      coordinate: {
        x: number,
        y: number,
      }
    }[],
    cellRefs: {
      current: Record<string, HTMLDivElement | null>
    }
  }) {
  const hasRun = useRef(false);
  const activeCellRef = useRef<ActiveCellType[]>([]);
  const [activeCell, setActiveCell] = useState<ActiveCellType[]>([]);
  const isAnimatingRef = useRef(false);
  const startingCells = Math.round(size / 2);

  useLayoutEffect(() => {
    activeCellRef.current = [];

    if (hasRun.current) {
      return;
    }

    hasRun.current = true;

    const newCells = startNewGame(
      grid,
      startingCells,
      activeCellRef.current,
      cellRefs.current,
      size,
      bus,
    );
    setActiveCell(newCells);
    activeCellRef.current.push(...newCells);
  }, [startNewGame]);

  useEffect(() => {
    activeCellRef.current = activeCell;
    const handler = (event: KeyboardEvent) => {
      const eventName = EventList[Direction[event.key as keyof typeof Direction]];
      const key = event.key as keyof typeof Direction;

      if (eventName) {
        const newPosition = setNewPosition(key, isAnimatingRef.current, activeCellRef.current, size);
        if (newPosition) {
          onScore(newPosition.score);
          setActiveCell(newPosition.prevState);

          requestAnimationFrame(() => {
            setActiveCell(newPosition.result);
            setTimeout(() => {
              setActiveCell(prev => {
                const afterMerge = prev
                  .filter((cell: ActiveCellType) => !cell.hidden)
                  .map((cell: ActiveCellType) => !cell.is_merged ? cell : {...cell, is_merged: false});

                activeCellRef.current = afterMerge;
                const newCell = createNewActiveCell(
                  grid,
                  activeCellRef.current,
                  cellRefs.current,
                  size,
                  bus,
                );
                return newCell ? [...afterMerge, newCell] : afterMerge;
              });
              isAnimatingRef.current = false;
            }, 300);
          })
        }

      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  });

  useEffect(() => {
    const handler = () => startNewGame();

    bus.on(EventList.NEW_GAME, handler);

    return () => {
      bus.off(EventList.NEW_GAME, handler);
    };
  });

  return (
    <div
      className="active-grid"
    >
      {activeCell?.map((cell) => (
        <ActiveCell
          style={cell?.style}
          key={cell.id}
          id={cell.id}
          prev_coordinate={cell.prev_coordinate}
          coordinate={cell.coordinate}
          grid_size={size}
          value={cell.value}
          is_merged={cell.is_merged}
          hidden={cell.hidden}
        />
      ))}
    </div>
  )
}

export default ActiveGrid;
