import Cell from './Cell.tsx';
import ActiveCell from './ActiveCell.tsx';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EventBus } from './engine/EventBus.ts';
import { EventList } from './engine/EventList.ts';
import type { ActiveCellType, Grid } from './utils/types.ts';
import { Direction } from './utils/types.ts';

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
    const cellRect = cellRefs.current[activeKey];

    if (!cellRect) {
      return null;
    }
    if (freeCells.length > 0) {
      const randomCell = freeCells[Math.floor(Math.random() * freeCells.length)];
      const { x, y } = randomCell.coordinate;

      if (cellRect) {
        return {
          id: crypto.randomUUID(),
          coordinate: { x, y },
          value: 2,
          style: {
            transform: `translate(${x * (cellSize + gap) + gap}px, ${y * (cellSize + gap) + gap}px) scale(0)`,
          }
        };
      }
    }
  }

  const mergeCells = (movedCells: ActiveCellType[]) => {
    const merged: ActiveCellType[] = [];
    let gainedScore = 0;

    for (let i = 0; i < movedCells.length; i++) {
      const currentCell = movedCells[i];
      const nextCell = movedCells[i + 1];

      if (nextCell && currentCell.value === nextCell.value) {
        const newValue = currentCell.value * 2;
        gainedScore += newValue;
        merged.push({
          ...currentCell,
          is_merged: false,
          hidden: true,
        });
        merged.push({
          ...nextCell,
          value: newValue,
          is_merged: true,
          hidden: false
        });
        i++;
      } else {
        merged.push({ ...currentCell, is_merged: false });
      }
    }

    if (gainedScore > 0) {
      onScore(gainedScore);
    }

    return merged;
  };

  const nextState = (cell: ActiveCellType, x: number, y: number): ActiveCellType => {
    return {
      ...cell,
      prev_coordinate: cell.coordinate,
      coordinate: { x, y },
    };
  }

  const moveCells = ( rows: Map<number, ActiveCellType[]>, direction: keyof typeof Direction) => {
    const result: ActiveCellType[] = [];
    const isVertical = direction === 'ArrowUp' || direction === 'ArrowDown';
    const isReversed = direction === 'ArrowDown' || direction === 'ArrowRight';

    rows.forEach((cells) => {
      const sorted = [...cells]
        .filter(cell => !cell.hidden)
        .sort((start, end) => {
        const startVal = isVertical ? start.coordinate.y : start.coordinate.x;
        const endVal = isVertical ? end.coordinate.y : end.coordinate.x;
        return isReversed ? endVal - startVal : startVal - endVal;
      });

      const merged = mergeCells(sorted);
      let pos = isReversed ? size - 1 : 0;
      const step = isReversed ? -1 : 1;

      merged.forEach((cell) => {
        const x = isVertical ? cell.coordinate.x : pos;
        const y = isVertical ? pos : cell.coordinate.y;
        result.push(nextState(cell, x, y));

        if (!cell.hidden) {
          pos += step;
        }
      });

    });
    return result;
  };

  const setNewPosition = (direction: keyof typeof Direction) => {
    if (isAnimatingRef.current) {
      return;
    }

    isAnimatingRef.current = true;
    const prevState = activeCellRef.current;
    const rows = new Map<number, ActiveCellType[]>();

    prevState
      .filter(cell => !cell.hidden)
      .forEach(cell => {
      const key = direction === 'ArrowUp' || direction === 'ArrowDown' ? cell.coordinate.x : cell.coordinate.y;

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
          const afterMerge = prev
            .filter(cell => !cell.hidden)
            .map(cell => !cell.is_merged ? cell : { ...cell, is_merged: false });

          activeCellRef.current = afterMerge;
          const newCell = createNewActiveCell();
          return newCell ? [...afterMerge, newCell] : afterMerge;
        });
        isAnimatingRef.current = false;

        }, 300);
    });
  };

  const startNewGame = () => {
    const newCells: ActiveCellType[] = [];
    activeCellRef.current = [];

    for (let i = 0; i < startingCells; i++) {
      const cell = createNewActiveCell();

      if (cell) {
        newCells.push(cell);
        activeCellRef.current.push(cell);
      }
    }

    setActiveCell(newCells);
  };

  useLayoutEffect(() => {
    if (hasRun.current) {
      return;
    }

    hasRun.current = true;
    gridContainer.current = document.getElementById('grid-container')?.getBoundingClientRect() || { x: 0, y: 0 };

    startNewGame();
  });

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
            grid_gap={gap}
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
