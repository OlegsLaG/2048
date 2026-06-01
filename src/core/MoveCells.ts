import { type ActiveCellType, Direction, type Matrix } from '../utils/types.ts';
import mergeCells from './MergeCells.ts';

function transpose(matrix: Matrix): Matrix {
  return matrix[0].map((_, index) =>
    matrix.map(row => row[index])
  );
}

const moveCells = (
  matrix: Matrix,
  direction: keyof typeof Direction,
  size: number
) => {
  let score = 0;

  const isVertical = direction === 'ArrowUp' || direction === 'ArrowDown';

  const isReverse = direction === 'ArrowRight' || direction === 'ArrowDown';

  let working: Matrix = matrix.map(row => [...row]);

  if (isVertical) {
    working = transpose(working);
  }

  const merged: Matrix = working.map(row => {
    let line = row.filter(Boolean) as ActiveCellType[];

    if (isReverse) {
      line = [...line].reverse();
    }

    const { merged, gainedScore } = mergeCells(line);

    score += gainedScore;

    const filled: (ActiveCellType | null)[] = [...merged];

    while (filled.length < size) {
      filled.push(null);
    }

    if (isReverse) {
      filled.reverse();
    }

    return filled;
  });

  const finalMatrix = isVertical ? transpose(merged) : merged;

  const result: ActiveCellType[] = [];

  finalMatrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (!cell) {
        return;
      }

      result.push({
        ...cell,
        prev_coordinate: { ...cell.coordinate },
        coordinate: { x, y },
      });
    });
  });

  return {
    result,
    score,
  };
};

export default moveCells;
