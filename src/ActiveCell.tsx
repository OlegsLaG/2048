import { useEffect, useState } from "react";

function ActiveCell(
  {
    id,
    value,
    style,
  }: { id: string, value: number, style: { transform: string, width: string, height: string } }
) {
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    setIsMerging(prev => {
      console.warn(prev);
      return prev;
    })
  }, [value]);
  return (
    <div id={id} className={`active-cell color-${value} ${isMerging}`} style={style}>
      {value}
    </div>
  )
}

export default ActiveCell;
