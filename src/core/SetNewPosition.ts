import { type ActiveCellType, Direction } from '../utils/types.ts';
import moveCells from './MoveCells.ts';

const setNewPosition = (
  direction: keyof typeof Direction,
  isAnimatingRef: boolean,
  activeCellRef: ActiveCellType[],
  size: number,
): { prevState: ActiveCellType[], result: ActiveCellType[], score: number } | undefined => {
  if (isAnimatingRef) {
    return;
  }

  const prevState = activeCellRef;
  const rows = new Map<number, ActiveCellType[]>();

  prevState
    .filter(cell => !cell.hidden)
    .forEach(cell => {
      const key = direction === 'ArrowUp' || direction === 'ArrowDown' ? cell.coordinate.x : cell.coordinate.y;

      if (!rows.has(key)) {
        rows.set(key, []);
      }
      rows.get(key)!.push(cell);
    });

  const { result, score } = moveCells(rows, direction, size);

  return { prevState, result, score };
};

export default setNewPosition;
