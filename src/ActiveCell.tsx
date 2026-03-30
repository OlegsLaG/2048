function ActiveCell(
  {
    id,
    value,
    style,
  }: { id: string, value: number, style: { transform: string, width: string, height: string } }
) {
  return (
    <div id={id} className={`active-cell color-${value}`} style={style}>
      {value}
    </div>
  )
}

export default ActiveCell;
