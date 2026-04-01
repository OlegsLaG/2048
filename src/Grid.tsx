import Cell from './Cell.tsx';
import ActiveCell from './ActiveCell.tsx';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EventBus } from './engine/EventBus.ts';
import { EventList } from './engine/EventList.ts';
import { EventStates } from './engine/EventStates.ts';

export interface Grid { coordinate: { x: number, y: number } }

export interface ActiveCellType {
  id: string
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


function Grid({ size, bus }: { size: number, bus: EventBus<Record<string, unknown>> }) {
  new EventStates(bus);

  const hasRun = useRef(false);
  const gridContainer = useRef({ x: 0, y: 0 });
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const activeCellRef = useRef<ActiveCellType[]>([]);
  const [activeCell, setActiveCell] = useState<ActiveCellType[]>([]);

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
  const gap = 15;
  const cellSize = (500 - gap * (size - 1)) / size;

  const gridStyles = {
    gridTemplateColumns: `repeat(${size}, minmax(0, ${500/size}px))`,
    gridTemplateRows: `repeat(${size}, minmax(0, ${500/size}px))`,
  }

  const startingCells = Math.round(size / 2);

  const hasAvailableMoves = (cells: ActiveCellType[], size: number) => {
    const map = new Map<string, number>();

    cells.forEach(cell => {
      map.set(`${cell.coordinate.x}-${cell.coordinate.y}`, cell.value);
    });

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const value = map.get(`${x}-${y}`);

        if (!value) {
          continue;
        }

        const right = map.get(`${x + 1}-${y}`);
        if (right === value) {
          return true;
        }

        const down = map.get(`${x}-${y + 1}`);
        if (down === value) {
          return true;
        }
      }
    }

    return false;
  };

  const createNewActiveCell = (): ActiveCellType | null | undefined => {
    const occupiedSet = new Set(activeCellRef.current.map(cell => `${cell.coordinate.x}-${cell.coordinate.y}`));

    const freeCells = grid.filter(cell => !occupiedSet.has(`${cell.coordinate.x}-${cell.coordinate.y}`));

    if (freeCells.length === 0) {
      const hasMoves = hasAvailableMoves(activeCellRef.current, size);

      if (!hasMoves) {
        bus.emit(EventList.GAME_OVER, null);
      }

      return null;
    }

    const randomCell = freeCells[Math.floor(Math.random() * freeCells.length)];
    const { x, y } = randomCell.coordinate;

    const activeKey = `${x}-${y}`;
    const cellRect = cellRefs.current[activeKey]?.getBoundingClientRect();

    if (!cellRect) {
      return null;
    }

    if (freeCells.length > 0) {
      const randomCell = freeCells[Math.floor(Math.random() * freeCells.length)];
      const { x, y } = randomCell.coordinate;

      const cellRect = cellRefs.current[`${x}-${y}`]?.getBoundingClientRect();

      if (cellRect) {

        return {
          id: crypto.randomUUID(),
          coordinate: { x, y },
          value: 2,
          style: {
            width: `${cellSize}px`,
            height: `${cellSize}px`,
            transform: `translate(${x * (cellSize + gap) + gap}px, ${y * (cellSize + gap) + gap}px) scale(1)`,
          },
        };
      }
    }
  }

  const mergeCells = (movedCells: ActiveCellType[]) => {
    const merged: ActiveCellType[] = [];

    for (let i = 0; i < movedCells.length; i++) {
      if (
        movedCells[i + 1] &&
        movedCells[i].value === movedCells[i + 1].value
      ) {
        console.warn('merge', movedCells[i], movedCells[i + 1]);
        merged.push({
          ...movedCells[i],
          value: movedCells[i].value * 2,
        });
        i++;
      } else {
        merged.push(movedCells[i]);
      }
    }

    return merged;
  }

  const nextState = (cell: ActiveCellType, x: number, y: number): ActiveCellType => {
    const newStyle = {
      width: `${cellSize}px`,
      height: `${cellSize}px`,
      transform: `translate(${x * (cellSize + gap) + gap}px, ${y * (cellSize + gap) + gap}px) scale(1)`,
    };

    return {
      ...cell,
      coordinate: {
        x,
        y,
      },
      style: newStyle,
    };
  }

  const moveCells = (
    rows: Map<number, ActiveCellType[]>,
    direction: keyof typeof Direction,
  ) => {
    const result: ActiveCellType[] = [];

    rows.forEach((cells) => {
      const sorted = [...cells].sort((start, end) => {
        if (direction === 'ArrowUp') {
          return start.coordinate.y - end.coordinate.y;
        }

        if (direction === 'ArrowDown') {
          return end.coordinate.y - start.coordinate.y;
        }

        if (direction === 'ArrowLeft') {
          return start.coordinate.x - end.coordinate.x;
        }

        if (direction === 'ArrowRight') {
          return end.coordinate.x - start.coordinate.x;
        }
        return 0;
      });

      const merged: ActiveCellType[] = mergeCells(sorted);

      if (direction === 'ArrowDown') {
        let y = size - 1;

        merged.forEach((cell) => {
          result.push(nextState(cell, cell.coordinate.x, y));
          y--;
        });
      }

      if (direction === 'ArrowUp') {
        let y = 0;

        merged.forEach((cell) => {
          result.push(nextState(cell, cell.coordinate.x, y));
          y++;
        });
      }

      if (direction === 'ArrowRight') {
        let x = size - 1;

        merged.forEach((cell) => {
          result.push(nextState(cell, x, cell.coordinate.y));
          x--;
        });
      }

      if (direction === 'ArrowLeft') {
        let x = 0;

        merged.forEach((cell) => {
          result.push(nextState(cell, x, cell.coordinate.y));
          x++;
        });
      }
    });

    return result;
  };

  const setNewPosition = (direction: keyof typeof Direction) => {
    const prevState = activeCellRef.current;

    const rows = new Map<number, ActiveCellType[]>();

    prevState.forEach(cell => {
      const key =
        direction === 'ArrowUp' || direction === 'ArrowDown'
          ? cell.coordinate.x
          : cell.coordinate.y;

      if (!rows.has(key)) {
        rows.set(key, []);
      }

      rows.get(key)!.push(cell);
    });

    const moved = moveCells(rows, direction);

    setActiveCell(prevState);

    requestAnimationFrame(() => {
      setActiveCell(moved);

      setTimeout(() => {
        setActiveCell(prev => {
          activeCellRef.current = prev;

          const newCell = createNewActiveCell();
          if (!newCell) {
            return prev;
          }

          return [...prev, newCell];
        });
      }, 200);
    });
  };

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

  }, [createNewActiveCell, startingCells]);

  useEffect(() => {
    activeCellRef.current = activeCell;

    const handler = (event: KeyboardEvent) => {
      const eventName = EventList[Direction[event.key as keyof typeof Direction]];
      const key = event.key as keyof typeof Direction;

      if (eventName) {
        setNewPosition(key);
      }
    };

    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    };

  }, [activeCell, setNewPosition]);

  return (
    <div id="grid-container" className="grid-container">
      <div
        className="active-grid"
        style={gridStyles}
      >
        {activeCell?.map((cell) => (
          <ActiveCell
            style={cell?.style}
            key={cell.id}
            id={cell.id}
            value={cell.value}
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
