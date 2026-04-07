import { useEffect, useRef, useState } from "react";

function FieldHeader({ size, score, bestScore }: { size: number, score: number, bestScore: number }) {
  const gap = 15;
  const cellSize = (500 - gap * (size - 1)) / size;
  const [isUpdating, setIsUpdating] = useState(false);
  const prevValueRef = useRef(score);

  useEffect(() => {
    if (prevValueRef.current !== score) {
      prevValueRef.current = score;
      localStorage.setItem('score', String(score));
      setIsUpdating(true);

      setTimeout(() => {
        setIsUpdating(false);
      }, 300);
    }
  }, [score]);

  return (
    <div className="field-header">
      <div className="header-cell game-name color-2048" style={{width: `${cellSize}px`, height: `${cellSize}px`}}>
        <h1>2048</h1>
      </div>
      <div className={`header-cell ${isUpdating ? 'updating' : ''}`} style={{width: `${cellSize}px`, height: `${cellSize}px`}}>
        <p>Score:</p>
        <h2>{score}</h2>
      </div>
      <div className="header-cell" style={{width: `${cellSize}px`, height: `${cellSize}px`}}>
        <p>Record:</p>
        <h2>{bestScore}</h2>
      </div>
    </div>
  )
}

export default FieldHeader;
