import { type ActiveCellType, Direction } from '../utils/types.ts';
import moveCells from './MoveCells.ts';
import createMatrix from './CreateMatrix.ts';

const hasChanged = (
  prevState: ActiveCellType[],
  nextState: ActiveCellType[],
) => {
  if (prevState.length !== nextState.length) {
    return true;
  }

  const prevMap = new Map(
    prevState.map(cell => [cell.id, cell.coordinate])
  );

  return nextState.some(cell => {
    const prev = prevMap.get(cell.id);

    return (
      !prev ||
      prev.x !== cell.coordinate.x ||
      prev.y !== cell.coordinate.y ||
      cell.is_merged
    );
  });
};

const setNewPosition = (
  direction: keyof typeof Direction,
  isAnimatingRef: boolean,
  activeCellRef: ActiveCellType[],
  size: number,
): { result: ActiveCellType[], score: number, moved: boolean } | undefined => {
  if (isAnimatingRef) {
    return;
  }

  const prevState = [...activeCellRef];

  const matrix = createMatrix(prevState, size)

  const { result, score } = moveCells(matrix, direction, size);

  const moved = hasChanged(prevState, result);

  return { result, score, moved };
};

export default setNewPosition;
