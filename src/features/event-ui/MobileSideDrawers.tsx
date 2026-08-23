import {
  Anchor,
  Backpack,
  BarChart3,
  House,
  UsersRound,
} from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Translator } from '@/game/localization';
import './hud-panel-header.css';
import './mobile-side-drawers.css';
import { NineSliceFrame } from '@/components/ui';

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
  const drawerRef = useRef<HTMLElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);

  const drawers: DrawerDefinition[] = [
    { id: 'stats', label: translate('ui.stats'), icon: BarChart3, content: stats },
    { id: 'inventory', label: translate('ui.inventory'), icon: Backpack, content: inventory },
    { id: 'crew', label: translate('ui.crew'), icon: UsersRound, content: crew },
    { id: 'ship', label: translate('ui.ship'), icon: Anchor, content: ship },
  ];

  const current = drawers.find(({ id }) => id === openDrawer) ?? null;

  useEffect(() => {
    if (!openDrawer) return;

    const closeIfOutside = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (
        drawerRef.current?.contains(target) ||
        tabsRef.current?.contains(target)
      ) {
        return;
      }

      setOpenDrawer(null);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenDrawer(null);
    };

    window.addEventListener('pointerdown', closeIfOutside);
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('pointerdown', closeIfOutside);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [openDrawer]);

  return (
    <div className="opfg-mobile-side-ui">
      <button
        type="button"
        className="opfg-mobile-home-button opfg-utility-square"
        onClick={onHome}
        disabled={!onHome}
        aria-label={translate('ui.action.home')}
        title={translate('ui.action.home')}
      >
        <NineSliceFrame />
        <House className="size-4" aria-hidden="true" />
        <span className="opfg-mobile-home-button__label">
          {translate('ui.action.home')}
        </span>
      </button>

      {current && (
        <aside
          ref={drawerRef}
          className="opfg-mobile-side-drawer"
          data-drawer={current.id}
          aria-label={current.label}
        >
          {current.content}
        </aside>
      )}

      <div ref={tabsRef} className="opfg-mobile-side-tabs">
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
            <NineSliceFrame />
            <Icon className="size-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
