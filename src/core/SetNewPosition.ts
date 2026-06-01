import { type ActiveCellType, Direction } from '../utils/types.ts';
import moveCells from './MoveCells.ts';
import createMatrix from './CreateMatrix.ts';

const setNewPosition = (
  direction: keyof typeof Direction,
  isAnimatingRef: boolean,
  activeCellRef: ActiveCellType[],
  size: number,
): { prevState: ActiveCellType[], result: ActiveCellType[], score: number } | undefined => {
  if (isAnimatingRef) {
    return;
  }

  const prevState = [...activeCellRef];

  const matrix = createMatrix(prevState, size)

  const { result, score } = moveCells(matrix, direction, size);

  return { prevState, result, score };
};

export default setNewPosition;
