function Cube(
  {
    value,
    style,
  }: { value: number, style: { gridColumn: string, gridRow: string } }
) {

  return (
    <div className="cube" style={style}>
      {value}<br />
    </div>
  )
}

export default Cube;
