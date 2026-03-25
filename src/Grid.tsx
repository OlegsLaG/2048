import Cell from './Cell.tsx';
import ActiveCell from './ActiveCell.tsx';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EventBus } from './engine/EventBus.ts';
import { EventList } from './engine/EventList.ts';
import { EventStates } from './engine/EventStates.ts';

export interface Grid { coordinate: { x: number, y: number }, occupied: boolean }

export interface ActiveCell {
  coordinate: {
    x: number,
    y: number,
  },
  value: number,
  style: {
    transform: string,
    width: string,
    height: string,
  },
}

const Direction = {
  ArrowUp: 'MOVE_UP',
  ArrowRight: 'MOVE_RIGHT',
  ArrowDown: 'MOVE_DOWN',
  ArrowLeft: 'MOVE_LEFT',
} as const;

const bus = new EventBus();
new EventStates(bus);

function Grid({ size }: { size: number }) {
  const hasRun = useRef(false);
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const activeCellRef = useRef<ActiveCell[]>([]);
  const [activeCell, setActiveCell] = useState<ActiveCell[]>([]);
  const gridContainer = useRef({ x: 0, y: 0 });

  const grid = useMemo(() => {
    const arr: Grid[] = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        arr.push({
          coordinate: { x: i, y: j },
          occupied: false,
        });
      }
    }
    return arr;
  }, [size]);

  const gridStyles = {
    gridTemplateColumns: `repeat(${size}, minmax(0, ${500/size}px))`,
    gridTemplateRows: `repeat(${size}, minmax(0, ${500/size}px))`,
  }

  const randomCoordinate = () => {
    // eslint-disable-next-line react-hooks/purity
    const x = Math.floor(Math.random() * (size - 1));
    // eslint-disable-next-line react-hooks/purity
    const y = Math.floor(Math.random() * (size - 1));

    return { x, y };
  };

  const createNewActiveCell = (): ActiveCell | null => {
    const occupiedSet = new Set(
      activeCellRef.current.map(c => `${c.coordinate.x}-${c.coordinate.y}`)
    );

    const freeCells = grid.filter(cell => {
      const key = `${cell.coordinate.x}-${cell.coordinate.y}`;
      return !occupiedSet.has(key);
    });

    if (freeCells.length === 0) {
      bus.emit(EventList.GAME_OVER, null);
      return null;
    }

    const randomCell = freeCells[Math.floor(Math.random() * freeCells.length)];
    const { x, y } = randomCell.coordinate;

    const activeKey = `${x}-${y}`;
    const cellRect = cellRefs.current[activeKey]?.getBoundingClientRect();

    if (!cellRect) {
      return null;
    }

    const relativePosition = {
      x: cellRect.x - gridContainer.current.x,
      y: cellRect.y - gridContainer.current.y,
    };

    return {
      coordinate: { x, y },
      value: 2,
      style: {
        transform: `translate(${relativePosition.x}px, ${relativePosition.y}px)`,
        width: `${cellRect.width}px`,
        height: `${cellRect.height}px`,
      },
    };
  }

  const setNewPosition = (direction: keyof typeof Direction) => {
    let x: number | undefined = undefined;
    let y: number | undefined = undefined;

    if (direction === 'ArrowUp') {
      y = 0;
    }

    if (direction === 'ArrowDown') {
      y = size - 1;
    }

    if (direction === 'ArrowLeft') {
      x = 0;
    }

    if (direction === 'ArrowRight') {
      x = size - 1;
    }

    setActiveCell(prev => {
      const movedCells = prev.map((cell) => {
        const cellRect = cellRefs.current[`${x !== undefined ? x : cell.coordinate.x}-${y !== undefined ? y : cell.coordinate.y}`]?.getBoundingClientRect();

        if (!cellRect) {
          return cell;
        }

        const relativePosition = {
          x: cellRect.x - gridContainer.current.x,
          y: cellRect.y - gridContainer.current.y,
        };

        const newStyle = {
          ...cell.style,
          transform: `translate(${relativePosition.x}px, ${relativePosition.y}px)`
        };

        return {
          ...cell,
          coordinate: {
            x: x ? x : cell.coordinate.x,
            y: y ? y : cell.coordinate.y,
          },
          style: newStyle,
        };
      });

      return [...movedCells];
    });
  }

  const startingCells = Math.round(size / 2);

  useLayoutEffect(() => {
    if (hasRun.current) {
      return;
    }

    hasRun.current = true;

    gridContainer.current = document.getElementById('grid-container')?.getBoundingClientRect() || { x: 0, y: 0 };

    for (let i = 0; i < startingCells; i++) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveCell(prev => {
        const newCell = createNewActiveCell();
        if (!newCell) {
          return prev;
        }

        return [...prev, newCell];
      });
    }

  }, [activeCell, createNewActiveCell, grid, randomCoordinate, size, startingCells]);

  useEffect(() => {
    activeCellRef.current = activeCell;

    const handler = (event: KeyboardEvent) => {
      const eventName = EventList[Direction[event.key as keyof typeof Direction]];
      const key = event.key as keyof typeof Direction;

      if (eventName) {
        bus.emit(eventName, () => {
          setNewPosition(key);
          // setActiveCell(prev => {
          //   const newCell = createNewActiveCell();
          //   if (!newCell) {
          //     return prev;
          //   }
          //
          //   return [...prev, newCell];
          // });
        });
      }
    };

    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    };

  }, [activeCell, createNewActiveCell, setNewPosition]);

  return (
    <div id="grid-container" className="grid-container">
      <div
        className="background-grid"
        style={gridStyles}
      >
        {activeCell?.map((cell, index) => (
          <ActiveCell
            style={cell?.style}
            key={index}
            value={cell.value}
          />
        ))}
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
