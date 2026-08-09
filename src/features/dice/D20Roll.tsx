import { useEffect, useRef, useState } from 'react';
import { D20Scene } from './D20Scene';
import './d20-roll.css';

export interface D20RollProps {
  result?: number;
  rollKey?: string | number;
  rolling?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function D20Roll({
  result,
  rollKey,
  rolling = false,
  onComplete,
  className = '',
}: D20RollProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<D20Scene | null>(null);
  const onCompleteRef = useRef(onComplete);
  const [fallback, setFallback] = useState(false);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      sceneRef.current = new D20Scene({
        canvas,
        onComplete: () => onCompleteRef.current?.(),
        onContextLost: () => setFallback(true),
      });
    } catch (error) {
      console.warn('[D20Roll] WebGL unavailable, using fallback.', error);
      setFallback(true);
      return;
    }

    const observer = new ResizeObserver(() => sceneRef.current?.resize());
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!rolling || result === undefined || rollKey === undefined) return;
    sceneRef.current?.roll(result, rollKey);
  }, [result, rollKey, rolling]);

  const fallbackValue = result ?? 'D20';

  return (
    <div
      className={`opfg-d20-roll ${className}`.trim()}
      aria-live="polite"
      aria-label={result === undefined ? 'd20 prêt à lancer' : `d20 result: ${result}`}
    >
      {!fallback && <canvas ref={canvasRef} className="opfg-d20-roll__canvas" />}

      {fallback && (
        <div
          key={rolling ? String(rollKey) : 'idle'}
          className={`opfg-d20-roll__fallback ${rolling ? 'is-rolling' : ''}`}
          role="img"
          aria-label={result === undefined ? 'd20 prêt à lancer' : `d20 result: ${result}`}
          onAnimationEnd={() => {
            if (rolling) onCompleteRef.current?.();
          }}
        >
          <span>{fallbackValue}</span>
        </div>
      )}
    </div>
  );
}
