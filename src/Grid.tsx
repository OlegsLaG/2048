import Cell from './Cell.tsx';
import ActiveCell from './ActiveCell.tsx';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EventBus } from './engine/EventBus.ts';
import { EventList } from './engine/EventList.ts';
import type { ActiveCellType, Grid } from './utils/types.ts';
import { Direction } from './utils/types.ts';
import createNewActiveCell from './core/CreateNewActiveCell.ts';
import setNewPosition from './core/SetNewPosition.ts';
import startNewGame from "./core/StartNewGame.ts";

function Grid({ size, bus, onScore }: { size: number, bus: EventBus<Record<string, unknown>>, onScore: (newScore: number) => void }) {
  const hasRun = useRef(false);
  const gridContainer = useRef({ x: 0, y: 0 });
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const activeCellRef = useRef<ActiveCellType[]>([]);
  const [activeCell, setActiveCell] = useState<ActiveCellType[]>([]);
  const isAnimatingRef = useRef(false);

  const grid = useMemo(() => {
    const arr: Grid[] = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        arr.push({
          coordinate: { x: i, y: j },
        });
      }
    }
    return arr;
  }, [size]);

  const gridStyles = {
    gridTemplateColumns: `repeat(${size}, minmax(0, ${500/size}px))`,
    gridTemplateRows: `repeat(${size}, minmax(0, ${500/size}px))`,
  }

  const startingCells = Math.round(size / 2);

  useLayoutEffect(() => {
    activeCellRef.current = [];

    if (hasRun.current) {
      return;
    }

    hasRun.current = true;
    gridContainer.current = document.getElementById('grid-container')?.getBoundingClientRect() || { x: 0, y: 0 };

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
      id="grid-container"
      className="grid-container"
    >
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
      <div
        className="background-grid"
        style={gridStyles}
      >
        {grid.map((cell) => (
          <Cell
            id={`${cell.coordinate.x}-${cell.coordinate.y}`}
            key={`${cell.coordinate.x}-${cell.coordinate.y}`}
            ref={(el) => {
              const key = `${cell.coordinate.x}-${cell.coordinate.y}`;
              cellRefs.current[key] = el;
            }}
          />
        ))}
      </div>
    </div>
  )
}
export default Grid;
