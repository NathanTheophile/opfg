import { useEffect, useRef } from 'react';
import { mountTavernBackground } from './tavern-background-runtime';
import './tavern-background.css';

export function TavernBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    return mountTavernBackground(root);
  }, []);

  return <div ref={rootRef} className="tavern-background layer-background" aria-hidden="true" />;
}
