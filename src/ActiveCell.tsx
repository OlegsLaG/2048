import { useEffect, useLayoutEffect, useState, memo } from 'react';
import type { ActiveCellType } from './utils/types.ts';

const ActiveCell = memo(function ActiveCell(
  {
    id,
    value,
    prev_coordinate,
    coordinate,
    grid_size,
    is_merged,
    hidden,
  }: ActiveCellType
) {
  const gap = 15;
  const cellSize = (500 - (gap) * ((grid_size || 4) - 1)) / (grid_size || 4);

  const getPosition = (coord: { x: number, y: number }, scale: number = 0) => ({
    transform: `translate(${coord.x * (cellSize + gap) + gap}px, ${coord.y * (cellSize + gap) + gap}px) scale(${scale})`
  });

  const [isMerging, setIsMerging] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const [style, setStyle] = useState(() =>
    getPosition(prev_coordinate || coordinate)
  );

  useLayoutEffect(() => {
    if (!prev_coordinate) {
      requestAnimationFrame(() => {
        setStyle(getPosition(coordinate, 1));
      })
      return;
    }

    if (prev_coordinate.x === coordinate.x && prev_coordinate.y === coordinate.y) {
      return;
    }

    const from = getPosition(prev_coordinate, 1);
    const to = getPosition(coordinate, 1);

    setStyle(from);

    requestAnimationFrame(() => {
      setStyle(to);
    });
  }, [coordinate.x, coordinate.y, prev_coordinate, coordinate]);

  useEffect(() => {
    if (is_merged) {
      setIsMerging(true);
      setStyle(getPosition(coordinate, 1.1));
      setTimeout(() => {
        setIsMerging(false);
        setStyle(getPosition(coordinate, 1));
      }, 200);
    }
    if (hidden) {
      setIsHidden(true);
    }
  }, [is_merged, coordinate, hidden]);

  return (
    <div
      id={id}
      className={`active-cell color-${value} ${isMerging ? 'merging' : ''}`}
      style={{
        ...style,
        opacity: isHidden ? 0 : 1,
      }}
    >
      <div className="cell-content">
        {value}
      </div>
    </div>
  )
});

export default ActiveCell;
