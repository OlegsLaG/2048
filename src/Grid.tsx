import Cell from './Cell.tsx';
import ActiveCell from './ActiveCell.tsx';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EventBus } from './engine/EventBus.ts';
import { EventList } from './engine/EventList.ts';
import { EventStates } from './engine/EventStates.ts';

export interface Grid { coordinate: { x: number, y: number }, occupied: boolean }

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

  const startingCells = Math.round(size - 1);

  const getFreeCells = () => {
    const occupiedSet = new Set(activeCellRef.current.map(c => c.id));

    return grid.filter(cell => {
      const key = `${cell.coordinate.x}-${cell.coordinate.y}`;
      return !occupiedSet.has(key);
    });
  }

  const createNewActiveCell = (): ActiveCellType | null => {
    const freeCells = getFreeCells();

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
      id: activeKey,
      coordinate: { x, y },
      value: 2,
      style: {
        transform: `translate(${relativePosition.x}px, ${relativePosition.y}px)`,
        width: `${cellRect.width}px`,
        height: `${cellRect.height}px`,
      },
    };
  }

  const mergeCells = (movedCells: ActiveCellType[]) => {
    return Object.values(
      movedCells.reduce<Record<string, ActiveCellType>>((acc, cell) => {
        const existing = acc[cell.id];

        if (!existing) {
          acc[cell.id] = cell;
        } else if (existing.value === cell.value) {
          acc[cell.id] = {
            ...cell,
            value: cell.value + existing.value,
          };
        }

        return acc;
      }, {})
    );
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
      id: `${x}-${y}`,
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

    rows.forEach((cells, index) => {
      let target: { x: number, y: number } = { x: 0, y: 0 };

      if (direction === 'ArrowUp') {
        target = { x: index, y: 0 };
      }
      if (direction === 'ArrowRight') {
        target = { x: size - 1, y: index };
      }
      if (direction === 'ArrowDown') {
        target = { x: index, y: size - 1 };
      }
      if (direction === 'ArrowLeft') {
        target = { x: 0, y: index };
      }

      cells.sort((a, b) => {
        if (direction === 'ArrowUp') {
          return a.coordinate.y - b.coordinate.y;
        }
        if (direction === 'ArrowDown') {
          return b.coordinate.y - a.coordinate.y;
        }
        if (direction === 'ArrowLeft') {
          return a.coordinate.x - b.coordinate.x;
        }
        if (direction === 'ArrowRight') {
          return b.coordinate.x - a.coordinate.x;
        }
        return 0;
      });

      cells.forEach(cell => {
        const newCell = nextState(cell, target.x, target.y);
        result.push(newCell);

        if (direction === 'ArrowUp') {
          target.y++;
        }
        if (direction === 'ArrowRight') {
          target.x--;
        }
        if (direction === 'ArrowDown') {
          target.y--;
        }
        if (direction === 'ArrowLeft') {
          target.x++;
        }
      });
    });

    return result;
  }

  const setNewPosition = (direction: keyof typeof Direction) => {
    setActiveCell(prev => {
      const rows = new Map<number, ActiveCellType[]>();
      const result: ActiveCellType[] = [];

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
      const merged = mergeCells(moved);

      result.push(...merged);

      return result;
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

  }, [activeCell, setNewPosition]);

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
