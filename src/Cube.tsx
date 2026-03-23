function Cube(
  {
    value,
    style,
  }: { value: number, style: { transform: string } }
) {

  return (
    <div className="cube" style={style}>
      {value}
    </div>
  )
}

export default Cube;
