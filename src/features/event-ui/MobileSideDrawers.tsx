import {
  Anchor,
  Backpack,
  BarChart3,
  UsersRound,
  X,
} from 'lucide-react';
import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import './mobile-side-drawers.css';

type DrawerId =
  | 'stats'
  | 'inventory'
  | 'crew'
  | 'ship';

type DrawerDefinition = {
  id: DrawerId;
  label: string;
  side: 'left' | 'right';
  icon: typeof BarChart3;
  content: ReactNode;
};

export interface MobileSideDrawersProps {
  stats: ReactNode;
  inventory: ReactNode;
  crew: ReactNode;
  ship: ReactNode;
}

export function MobileSideDrawers({
  stats,
  inventory,
  crew,
  ship,
}: MobileSideDrawersProps) {
  const [openDrawer, setOpenDrawer] =
    useState<DrawerId | null>(null);

  const drawers: DrawerDefinition[] = [
    {
      id: 'stats',
      label: 'Stats',
      side: 'left',
      icon: BarChart3,
      content: stats,
    },
    {
      id: 'inventory',
      label: 'Inventaire',
      side: 'left',
      icon: Backpack,
      content: inventory,
    },
    {
      id: 'crew',
      label: 'Crew',
      side: 'right',
      icon: UsersRound,
      content: crew,
    },
    {
      id: 'ship',
      label: 'Bateau',
      side: 'right',
      icon: Anchor,
      content: ship,
    },
  ];

  const current =
    drawers.find(({ id }) => id === openDrawer) ??
    null;

  useEffect(() => {
    if (!openDrawer) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDrawer(null);
      }
    };

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener(
        'keydown',
        closeOnEscape,
      );
    };
  }, [openDrawer]);

  return (
    <div className="opfg-mobile-side-ui">
      <div className="opfg-mobile-side-tabs is-left">
        {drawers
          .filter(({ side }) => side === 'left')
          .map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className="opfg-mobile-side-tab"
              data-active={
                openDrawer === id ? 'true' : 'false'
              }
              aria-label={label}
              title={label}
              onClick={() =>
                setOpenDrawer((currentId) =>
                  currentId === id ? null : id,
                )
              }
            >
              <Icon className="size-4" />
            </button>
          ))}
      </div>

      <div className="opfg-mobile-side-tabs is-right">
        {drawers
          .filter(({ side }) => side === 'right')
          .map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className="opfg-mobile-side-tab"
              data-active={
                openDrawer === id ? 'true' : 'false'
              }
              aria-label={label}
              title={label}
              onClick={() =>
                setOpenDrawer((currentId) =>
                  currentId === id ? null : id,
                )
              }
            >
              <Icon className="size-4" />
            </button>
          ))}
      </div>

      {current && (
        <>
          <button
            type="button"
            className="opfg-mobile-side-backdrop"
            aria-label="Fermer le panneau"
            onClick={() => setOpenDrawer(null)}
          />

          <aside
            className="opfg-mobile-side-drawer"
            data-side={current.side}
            aria-label={current.label}
          >
            <header className="opfg-mobile-side-drawer__header">
              <span>{current.label}</span>

              <button
                type="button"
                onClick={() => setOpenDrawer(null)}
                aria-label="Fermer"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="opfg-mobile-side-drawer__content">
              {current.content}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
