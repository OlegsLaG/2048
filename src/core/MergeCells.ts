import type { ActiveCellType } from '../utils/types.ts';

const mergeCells = (movedCells: ActiveCellType[]) => {
  const merged: ActiveCellType[] = [];
  let gainedScore = 0;

  for (let i = 0; i < movedCells.length; i++) {
    const current = movedCells[i];
    const next = movedCells[i + 1];

    if (next && current.value === next.value) {
      const newValue = current.value * 2;
      gainedScore += newValue;

      merged.push({
        ...current,
        value: newValue,
        is_merged: true,
        hidden: false,
      });

      i++;
    } else {
      merged.push({
        ...current,
        is_merged: false,
      });
    }
  }

  return { merged, gainedScore };
};

export default mergeCells;
