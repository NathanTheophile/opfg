import { Panel } from '@/components/ui';
import type { ContentCatalog } from '@/game/content/schema';
import type { GameState } from '@/game/model/schema';

interface CareerStatusProps { state: GameState; catalog: ContentCatalog; translate: (key: string) => string }

export function CareerStatus({ state, catalog, translate }: CareerStatusProps) {
  const career = state.player.career;
  const affiliation = catalog.careerAffiliations.find(({ id }) => id === career.affiliationId);
  const rank = catalog.careerRanks.find(({ id }) => id === career.rankId);
  const title = catalog.careerTitles.find(({ id }) => id === career.titleId);
  const ending = catalog.endings.find(({ id }) => id === state.endingId);
  return <Panel variant="strong" className="mt-3 text-sm">
    <strong>{translate('career.category')}</strong>
    <div>{affiliation ? translate(affiliation.nameKey) : career.affiliationId} · {translate('career.reputation')}: {career.reputation} · {translate('career.bounty')}: {career.bounty}</div>
    {rank && <div>{translate('career.rank')}: {translate(rank.nameKey)}</div>}
    {title && <div>{translate('career.title')}: {translate(title.nameKey)}</div>}
    {ending && <div>{translate('career.ending')}: {translate(ending.nameKey)}</div>}
  </Panel>;
}
