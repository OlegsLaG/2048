import { type ActiveCellType, Direction } from '../utils/types.ts';
import mergeCells from './MergeCells.ts';

const moveCells = (rows: Map<number, ActiveCellType[]>, direction: keyof typeof Direction, size: number) => {
  const result: ActiveCellType[] = [];
  let score = 0;
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

    const { merged, gainedScore } = mergeCells(sorted);
    score = gainedScore;

    let pos = isReversed ? size - 1 : 0;
    const step = isReversed ? -1 : 1;

    merged.forEach((cell) => {
      const x = isVertical ? cell.coordinate.x : pos;
      const y = isVertical ? pos : cell.coordinate.y;
      result.push({
        ...cell,
        prev_coordinate: cell.coordinate,
        coordinate: { x, y },
      });

      if (!cell.hidden) {
        pos += step;
      }
    });

  });
  return { result, score };
};

export default moveCells;
