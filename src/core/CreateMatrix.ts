import type { ActiveCellType, Matrix } from '../utils/types.ts';

const createMatrix = (
  cells: ActiveCellType[],
  size: number,
): Matrix => {
  const matrix: Matrix = Array(size).fill(null).map(() => Array(size).fill(null));

  cells.forEach(cell => {
    const { x, y } = cell.coordinate;
    matrix[y][x] = cell;
  })

  return matrix;
};

export default createMatrix;
