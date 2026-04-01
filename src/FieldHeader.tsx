function FieldHeader({ size }: { size: number }) {
  const gap = 15;
  const cellSize = (500 - gap * (size - 1)) / size;

  return (
    <div className="field-header">
      <div className="header-cell game-name color-2048" style={{width: `${cellSize}px`, height: `${cellSize}px`}}>
        <h1>2048</h1>
      </div>
      <div className="header-cell" style={{width: `${cellSize}px`, height: `${cellSize}px`}}>
        <p>Score:</p>
        <h2>1</h2>
      </div>
      <div className="header-cell" style={{width: `${cellSize}px`, height: `${cellSize}px`}}>
        <p>Record:</p>
        <h2>2</h2>
      </div>
    </div>
  )
}

export default FieldHeader;
