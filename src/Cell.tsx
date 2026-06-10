import { type Ref } from 'react';

function Cell({ id, cellRef }: { id: string, cellRef?: Ref<HTMLDivElement>; }) {
  return (
    <div id={id} className="cell" ref={cellRef}></div>
  )
}

export default Cell;
