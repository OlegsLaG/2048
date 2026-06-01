import { type ActiveCellType, Direction, type Matrix } from '../utils/types.ts';
import mergeCells from './MergeCells.ts';

function transpose(matrix: Matrix): Matrix {
  return matrix[0].map((_, x) => matrix.map(row => row[x]));
}

const moveCells = (
  matrix: Matrix,
  direction: keyof typeof Direction,
  size: number
) => {
  let score = 0;

  const isRight = direction === 'ArrowRight';
  const isDown = direction === 'ArrowDown';
  const isVertical = direction === 'ArrowUp' || direction === 'ArrowDown';

  let working: Matrix = matrix.map(row => [...row]);

  if (isRight) {
    working = working.map(row => [...row].reverse());
  }

  if (isVertical) {
    working = transpose(working);

    if (isDown) {
      working = working.map(row => [...row].reverse());
    }
  }

  let restored: Matrix = working.map(row => {
    const cells = row.filter(Boolean) as ActiveCellType[];

    const { merged, gainedScore } = mergeCells(cells);
    score += gainedScore;

    const filled: (ActiveCellType | null)[] = [
      ...merged,
      ...Array(size - merged.length).fill(null),
    ];

    return filled;
  });

  if (isVertical) {
    restored = transpose(restored);

    if (isDown) {
      restored = restored.map(row => row.reverse());
    }
  }

  if (isRight) {
    restored = restored.map(row => row.reverse());
  }

  const result: ActiveCellType[] = [];

  restored.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (!cell) {
        return
      }

      result.push({
        ...cell,
        prev_coordinate: cell.coordinate,
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
