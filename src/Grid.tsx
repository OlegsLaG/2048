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

const bus = new EventBus();
new EventStates(bus);

function Grid({ size }: { size: number }) {
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

  const gridStyles = {
    gridTemplateColumns: `repeat(${size}, minmax(0, ${500/size}px))`,
    gridTemplateRows: `repeat(${size}, minmax(0, ${500/size}px))`,
  }

  const startingCells = Math.round(size / 2);

  const createNewActiveCell = (): ActiveCellType | null | undefined => {
    const occupiedSet = new Set(activeCellRef.current.map(cell => `${cell.coordinate.x}-${cell.coordinate.y}`));

    const freeCells = grid.filter(cell => !occupiedSet.has(`${cell.coordinate.x}-${cell.coordinate.y}`));

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

    if (freeCells.length > 0) {
      const randomCell = freeCells[Math.floor(Math.random() * freeCells.length)];
      const { x, y } = randomCell.coordinate;

      const cellRect = cellRefs.current[`${x}-${y}`]?.getBoundingClientRect();

      if (cellRect) {
        const relativePosition = {
          x: cellRect.x - gridContainer.current.x,
          y: cellRect.y - gridContainer.current.y,
        };

        return {
          id: crypto.randomUUID(),
          coordinate: { x, y },
          value: 2,
          style: {
            transform: `translate(${relativePosition.x}px, ${relativePosition.y}px) scale(1)`,
            width: `${cellRect.width}px`,
            height: `${cellRect.height}px`,
          },
        };
      }
    }
  }

  const mergeCells = (movedCells: ActiveCellType[]) => {
    const merged: ActiveCellType[] = [];
    let skip = false;

    for (let i = 0; i < movedCells.length; i++) {
      if (skip) {
        skip = false;
        continue;
      }

      if (movedCells[i + 1] && movedCells[i].value === movedCells[i + 1].value) {
        merged.push({
          ...movedCells[i],
          value: movedCells[i].value * 2,
        });
        skip = true;
      } else {
        merged.push(movedCells[i]);
      }
    }

    return merged;
  }

  const nextState = (cell: ActiveCellType, x: number, y: number): ActiveCellType => {
    const cellRect = cellRefs.current[`${x}-${y}`]?.getBoundingClientRect();

    if (!cellRect) {
      return cell;
    }

    const newRelativePosition = {
      x: cellRect.x - gridContainer.current.x,
      y: cellRect.y - gridContainer.current.y,
    };

    const newStyle = {
      ...cell.style,
      transform: `translate(${newRelativePosition.x}px, ${newRelativePosition.y}px)`
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
      const sortedCells = cells.sort((start, end) => {
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

      const occupied = new Set<string>();

      const movedCells = sortedCells.map((cell) => {
        let { x, y } = cell.coordinate;

        while (true) {
          let nextX = x;
          let nextY = y;

          if (direction === 'ArrowUp') {
            nextY--;
          }
          if (direction === 'ArrowDown') {
            nextY++;
          }
          if (direction === 'ArrowLeft') {
            nextX--;
          }
          if (direction === 'ArrowRight') {
            nextX++;
          }

          const key = `${nextX}-${nextY}`;

          if (nextX < 0 || nextY < 0 || nextX >= size || nextY >= size) {
            break;
          }

          if (occupied.has(key)) {
            break;
          }
          x = nextX;
          y = nextY;
        }

        occupied.add(`${x}-${y}`);
        return nextState(cell, x, y);
      });
      const mergedCells = mergeCells(movedCells);
      result.push(...mergedCells);
    });
    return result;
  }

  const setNewPosition = (direction: keyof typeof Direction) => {
    setActiveCell(prev => {
      const rows = new Map<number, ActiveCellType[]>();
      prev.forEach(cell => {
        const key = direction === 'ArrowUp' || direction === 'ArrowDown'
          ? cell.coordinate.x
          : cell.coordinate.y;

        if (!rows.has(key)) {
          rows.set(key, []);
        }

        rows.get(key)!.push(cell);
      });

      const moved = moveCells(rows, direction);
      activeCellRef.current = moved;

      return moved;
    });
  }

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
        bus.emit(eventName, () => {
          setNewPosition(key);
          setTimeout(() => {
            setActiveCell(prev => {
              const newCell = createNewActiveCell();
              if (!newCell) {
                return prev;
              }
              return [...prev, newCell];
            });
          }, 150);
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
        {activeCell?.map((cell) => (
          <ActiveCell
            style={cell?.style}
            key={cell.id}
            id={cell.id}
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
