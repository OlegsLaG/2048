import Cell from './Cell.tsx';
import ActiveGrid from './ActiveGrid.tsx';
import { useMemo, useRef } from 'react';
import { EventBus } from './engine/EventBus.ts';
import type { Grid } from './utils/types.ts';

function BackgroundGrid({ size, bus, onScore }: { size: number, bus: EventBus<Record<string, unknown>>, onScore: (newScore: number) => void }) {
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  return (
    <div
      id="grid-container"
      className="grid-container"
    >
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
      <ActiveGrid size={size} bus={bus} onScore={onScore} grid={grid} cellRefs={cellRefs} />
    </div>
  )
}
export default BackgroundGrid;
