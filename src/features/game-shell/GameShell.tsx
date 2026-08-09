import type { PropsWithChildren } from 'react';
import { TavernBackground } from '@/features/tavern-background/TavernBackground';

export function GameShell({ children }: PropsWithChildren) {
  return (
    <>
      <TavernBackground />
      <div className="relative layer-game-ui min-h-dvh">{children}</div>
    </>
  );
}
