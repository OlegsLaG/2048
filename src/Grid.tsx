import Cell from './Cell.tsx';
import Cube from './Cube.tsx';

function Grid({ size }: { size: number }) {
  const grid = [];
  const activeGrid = [];
  const startingCubes = Math.round(size / 2);

  for (let i = 0; i < startingCubes; i++) {
    // eslint-disable-next-line react-hooks/purity
    const x = Math.floor(Math.random() * size);
    // eslint-disable-next-line react-hooks/purity
    const y = Math.floor(Math.random() * size);
    activeGrid.push({
      coordinate: { x, y },
      style: {
        gridColumn: x + 1,
        gridRow: y + 1,
      }
    });
  }

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      grid.push({
        coordinate: { x: i, y: j },
      });
    }
  }

  const gridStyles = {
    gridTemplateColumns: `repeat(${size}, minmax(0, ${500/size}px))`,
    gridTemplateRows: `repeat(${size}, minmax(0, ${500/size}px))`,
  }

  return (
    <div className="grid-container">
      <div
        className="grid"
        style={gridStyles}
      >
        {activeGrid.map((cell) => (
          <Cube
            style={cell.style}
            key={`${cell.coordinate.x}-${cell.coordinate.y}`}
            value={2}
          />
        ))}
      </div>
      <div
        className="background-grid"
        style={gridStyles}
      >
        {grid.map((cell) => (
          <Cell key={`${cell.coordinate.x}-${cell.coordinate.y}`} coordinate={cell.coordinate} />
        ))}
      </div>
    </div>

  )
}
export default Grid;
