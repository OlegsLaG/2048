function ActiveCell(
  {
    value,
    style,
  }: { value: number, style: { transform: string, width: string, height: string } }
) {

  return (
    <div className="active-cell" style={style}>
      {value}
    </div>
  )
}

export default ActiveCell;
