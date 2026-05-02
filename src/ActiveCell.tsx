import { useEffect, useLayoutEffect, useState } from 'react';
import type { ActiveCellType } from './utils/types.ts';

function ActiveCell(
  {
    id,
    value,
    prev_coordinate,
    coordinate,
    grid_size,
    is_merged,
  }: ActiveCellType
) {
  const gap = 15;
  const cellSize = (500 - (gap) * ((grid_size || 4) - 1)) / (grid_size || 4);

  const getPosition = (coord: { x: number, y: number }) => ({
    transform: `translate(${coord.x * (cellSize + gap) + gap}px, ${coord.y * (cellSize + gap) + gap}px) scale(1)`
  });

  const [isMerging, setIsMerging] = useState(false);

  const [style, setStyle] = useState(() =>
    getPosition(prev_coordinate || coordinate)
  );

  useLayoutEffect(() => {
    if (!prev_coordinate) {
      return;
    }

    if (prev_coordinate.x === coordinate.x && prev_coordinate.y === coordinate.y) {
      return;
    }

    const from = getPosition(prev_coordinate);
    const to = getPosition(coordinate);

    setStyle(from);

    requestAnimationFrame(() => {
      setStyle(to);
    });
  }, [coordinate.x, coordinate.y]);

  useEffect(() => {
    if (is_merged) {
      setIsMerging(true);
      setTimeout(() => setIsMerging(false), 300);
    }
  }, [is_merged]);

  return (
    <div id={id} className={`active-cell color-${value} ${isMerging ? 'merging' : ''}`} style={style}>
      <div className="cell-content">
        {value}
      </div>
    </div>
  )
}

export default ActiveCell;
