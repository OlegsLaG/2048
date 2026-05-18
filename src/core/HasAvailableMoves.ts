import type { ActiveCellType } from '../utils/types.ts';

const hasAvailableMoves = (cells: ActiveCellType[], size: number) => {
  const map = new Map<string, number>();

  cells.forEach(cell => {
    map.set(`${cell.coordinate.x}-${cell.coordinate.y}`, cell.value);
  });

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const value = map.get(`${x}-${y}`);

      if (!value) {
        continue;
      }

      const right = map.get(`${x + 1}-${y}`);
      if (right === value) {
        return true;
      }

      const down = map.get(`${x}-${y + 1}`);
      if (down === value) {
        return true;
      }
    }
  }
  return false;
};

export default hasAvailableMoves;
