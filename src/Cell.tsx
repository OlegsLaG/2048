function Cell({ coordinate }: { coordinate: { x: number, y: number }}) {
  return (
    <div className="cell" key={`${coordinate.x}-${coordinate.y}`}>
    </div>
  )
}

export default Cell;
