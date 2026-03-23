import Cell from './Cell.tsx';
import ActiveCell from './ActiveCell.tsx';
import { useLayoutEffect, useRef, useState } from 'react';
import { EventBus } from './engine/EventBus.ts';
import { EventList } from './engine/EventList.ts';
import { EventStates } from './engine/EventStates.ts';

export interface Grid { coordinate: { x: number, y: number }, occupied: boolean }
export interface ActiveCell { coordinate: { x: number, y: number }, value: number, style: { transform: string } }
const bus = new EventBus();
new EventStates(bus);

function Grid({ size }: { size: number }) {
  const hasRun = useRef(false);
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeCell, setActiveCell] = useState<ActiveCell[]>([]);

  const grid: Grid[] = [];
  const gridStyles = {
    gridTemplateColumns: `repeat(${size}, minmax(0, ${500/size-15}px))`,
    gridTemplateRows: `repeat(${size}, minmax(0, ${500/size-15}px))`,
  }

  const randomCoordinate = () => {
    // eslint-disable-next-line react-hooks/purity
    const x = Math.floor(Math.random() * (size - 1));
    // eslint-disable-next-line react-hooks/purity
    const y = Math.floor(Math.random() * (size - 1));

    return { x, y };
  };

  const startingCells = Math.round(size / 2);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      grid.push({
        coordinate: { x: i, y: j },
        occupied: false,
      });
    }
  }

  useLayoutEffect(() => {
    if (hasRun.current) {
      return;
    }

    hasRun.current = true;

    const newGrid: ActiveCell[] = [];
    const gridContainer = document.getElementById('grid-container')?.getBoundingClientRect() || { x: 0, y: 0 };

    const createNewActiveCell = (): void => {
      let coords = randomCoordinate();

      grid.find(cell => {
        if (cell.coordinate.x === coords.x && cell.coordinate.y === coords.y) {
          if (!cell.occupied) {
            cell.occupied = true;
            return;
          }
          coords = randomCoordinate();
          return coords;
        }
      });

      const activeKey = `${coords.x}-${coords.y}`;
      const initialPosition = cellRefs.current[activeKey]?.getBoundingClientRect() || { x: 0, y: 0 };

      const relativePosition = {
        x: (initialPosition?.x - gridContainer?.x) - 15,
        y: (initialPosition?.y - gridContainer?.y) - 15,
      }

      newGrid.push({
        coordinate: { x: coords.x, y: coords.y },
        value: 2,
        style: {
          transform: `translate(${relativePosition?.x}px, ${relativePosition?.y}px)`,
        },
      });
    }

    for (let i = 0; i < startingCells; i++) {
      createNewActiveCell();
    }

    setActiveCell(newGrid);

    addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp') {
        bus.emit(EventList.MOVE_UP, { x: 0 });
      }
    })

  }, [grid, randomCoordinate, size, startingCells]);


  return (
    <div id="grid-container" className="grid-container">
      <div
        className="grid"
        style={gridStyles}
      >
        {activeCell?.map((cell) => (
          <ActiveCell
            style={cell?.style}
            key={`${cell?.coordinate.x}-${cell?.coordinate.y}`}
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
