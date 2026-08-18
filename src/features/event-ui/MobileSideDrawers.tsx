import {
  Anchor,
  Backpack,
  BarChart3,
  House,
  UsersRound,
} from 'lucide-react';
import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Translator } from '@/game/localization';
import './hud-panel-header.css';
import './mobile-side-drawers.css';

type DrawerId = 'stats' | 'inventory' | 'crew' | 'ship';

type DrawerDefinition = {
  id: DrawerId;
  label: string;
  icon: typeof BarChart3;
  content: ReactNode;
};

export interface MobileSideDrawersProps {
  stats: ReactNode;
  inventory: ReactNode;
  crew: ReactNode;
  ship: ReactNode;
  translate: Translator;
  onHome?: () => void;
}

export function MobileSideDrawers({
  stats,
  inventory,
  crew,
  ship,
  translate,
  onHome,
}: MobileSideDrawersProps) {
  const [openDrawer, setOpenDrawer] = useState<DrawerId | null>(null);

  const drawers: DrawerDefinition[] = [
    { id: 'stats', label: translate('ui.stats'), icon: BarChart3, content: stats },
    { id: 'inventory', label: translate('ui.inventory'), icon: Backpack, content: inventory },
    { id: 'crew', label: translate('ui.crew'), icon: UsersRound, content: crew },
    { id: 'ship', label: translate('ui.ship'), icon: Anchor, content: ship },
  ];

  const current = drawers.find(({ id }) => id === openDrawer) ?? null;

  useEffect(() => {
    if (!openDrawer) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenDrawer(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [openDrawer]);

  return (
    <div className="opfg-mobile-side-ui">
      <button
        type="button"
        className="opfg-hud-home-button opfg-hud-section-title opfg-mobile-home-button"
        onClick={onHome}
        disabled={!onHome}
        aria-label={translate('ui.action.home')}
        title={translate('ui.action.home')}
      >
        <House className="size-4" aria-hidden="true" />
        <span>{translate('ui.action.home')}</span>
      </button>

      {current && (
        <aside
          className="opfg-mobile-side-drawer"
          aria-label={current.label}
        >
          {current.content}
        </aside>
      )}

      <div className="opfg-mobile-side-tabs">
        {drawers.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className="opfg-mobile-side-tab"
            data-active={openDrawer === id ? 'true' : 'false'}
            aria-label={label}
            title={label}
            onClick={() => setOpenDrawer((currentId) => currentId === id ? null : id)}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
