import { Panel } from '@/components/ui';
import type { ContentCatalog } from '@/game/content/schema';
import type { GameState } from '@/game/model/schema';

interface PowerStatusProps {
  state: GameState;
  catalog: ContentCatalog;
  translate: (key: string) => string;
}

export function PowerStatus({ state, catalog, translate }: PowerStatusProps) {
  const { powers } = state.player;
  const fruit = catalog.devilFruits.find(({ id }) => id === powers.devilFruitId);
  const fruitLabel = fruit ? translate(fruit.nameKey) : translate('power.devilFruit.none');
  return <Panel variant="strong" className="mt-3 text-sm">
    <strong>{translate('power.category')}</strong>
    <div>{translate('power.devilFruit')}: {fruitLabel}{fruit ? ` · ${translate('power.awakening')} ${powers.devilFruitAwakening}/10` : ''}</div>
    <div>{translate('power.haki.observation')} {powers.haki.observation}/5</div>
    <div>{translate('power.haki.armament')} {powers.haki.armament}/5</div>
    <div>{translate('power.haki.conqueror')} {powers.haki.conqueror}/5</div>
  </Panel>;
}
