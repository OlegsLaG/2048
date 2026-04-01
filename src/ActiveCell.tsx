import { useEffect, useRef, useState } from "react";

function ActiveCell(
  {
    id,
    value,
    style,
  }: { id: string, value: number, style: { transform: string, width: string, height: string } }
) {
  const [isMerging, setIsMerging] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      setIsMerging(true);

      const timeout = setTimeout(() => {
        setIsMerging(false);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [value]);
  return (
    <div id={id} className={`active-cell color-${value} ${isMerging ? 'merging' : ''}`} style={style}>
      <div className="cell-content">
        {value}
      </div>
    </div>
  )
}

export default ActiveCell;
