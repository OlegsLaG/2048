import { type RefObject } from 'react';

function Cell({ id, ref }: { id: string, ref: RefObject<HTMLDivElement> }) {
  return (
    <div id={id} className="cell" ref={ref}></div>
  )
}

export default Cell;
