import {
  Anchor,
  Backpack,
  Boxes,
  CalendarDays,
  Clock3,
  Coins,
  House,
  ListChecks,
  LockKeyhole,
  MapPin,
  Navigation,
  Package,
  ShieldCheck,
  UserRound,
  Waves,
} from 'lucide-react';
import { Panel } from '@/components/ui';
import type {
  ContentCatalog,
  LocationDefinition,
} from '@/game/content/schema';
import type {
  GameState,
  ItemStack,
} from '@/game/model/schema';
import type { LocaleId, Translator } from '@/game/localization';
import { ContextTooltip } from './ContextTooltip';
import { getUiTooltipKey } from './context-tooltip-copy';
import './hud-panel-header.css';
import './top-world-hud.css';

const INVENTORY_PREVIEW_SLOTS = 2;
const CARGO_PREVIEW_SLOTS = 7;
const MONTH_EVENT_SLOTS = 2;
const CALENDAR_START_YEAR = 1507;

type CargoOccupant =
  | {
      kind: 'item';
      key: string;
      label: string;
      quantity: number;
    }
  | {
      kind: 'passenger';
      key: string;
      label: string;
    };

export interface TopWorldHudProps {
  state: GameState;
  catalog: ContentCatalog;
  translate: Translator;
  locale: LocaleId;

  /**
   * Optional presentation override used while an Outcome is visible.
   * The engine may already have advanced to the next month after the
   * second monthly Event, but the HUD should keep showing the month in
   * which the displayed Event actually happened until Continue.
   */
  calendarAgeMonths?: number;

  /**
   * Number of resolved normal/scheduled Events to show in the current
   * monthly two-slot progress indicator: 0, 1 or 2.
   */
  monthEventProgress?: number;
}

function getItemLabel(
  stack: ItemStack,
  catalog: ContentCatalog,
  translate: (key: string) => string,
): string {
  const definition = catalog.items.find(
    ({ id }) => id === stack.itemId,
  );

  return definition
    ? translate(definition.nameKey)
    : stack.itemId;
}

function getLocationPath(
  state: GameState,
  catalog: ContentCatalog,
): LocationDefinition[] {
  const path: LocationDefinition[] = [];
  const visited = new Set<string>();

  let current = catalog.locations.find(
    ({ id }) => id === state.locationId,
  );

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current);

    current = current.parentLocationId
      ? catalog.locations.find(
          ({ id }) => id === current?.parentLocationId,
        )
      : undefined;
  }

  return path;
}

function buildCargoOccupants(
  state: GameState,
  catalog: ContentCatalog,
  translate: (key: string) => string,
): CargoOccupant[] {
  if (!state.ship) return [];

  return [
    ...state.ship.cargo.map((stack, index) => ({
      kind: 'item' as const,
      key: `cargo-${stack.itemId}-${index}`,
      label: getItemLabel(
        stack,
        catalog,
        translate,
      ),
      quantity: stack.quantity,
    })),
    ...state.passengerNpcIds.map((npcId) => {
      const definition = catalog.npcs.find(
        ({ id }) => id === npcId,
      );

      return {
        kind: 'passenger' as const,
        key: `passenger-${npcId}`,
        label: definition
          ? translate(definition.nameKey)
          : npcId,
      };
    }),
  ];
}

function getCalendarLabel(
  ageMonths: number,
  translate: Translator,
): string {
  const safeAgeMonths = Math.max(0, Math.floor(ageMonths));
  const year = CALENDAR_START_YEAR + Math.floor(safeAgeMonths / 12);
  const monthIndex = safeAgeMonths % 12;
  const monthKey = `calendar.month.${String(monthIndex + 1).padStart(2, '0')}`;
  return `${translate(monthKey)} ${year}`;
}

function getAffiliationTitle(
  state: GameState,
  catalog: ContentCatalog,
  translate: Translator,
): string {
  const careerAffiliation = catalog.careerAffiliations.find(({ id }) => id === state.player.career.affiliationId);
  if (careerAffiliation) return translate(careerAffiliation.nameKey);
  const profileAffiliation = catalog.affiliations.find(({ id }) => id === state.player.profile.affiliationId);
  if (profileAffiliation) return translate(profileAffiliation.nameKey);
  return translate('affiliation.civilian.name');
}

export function InventoryHudPanel({
  state,
  catalog,
  translate,
  locale,
}: TopWorldHudProps) {
  const inventoryCapacity = state.player.inventory.capacity;
  const inventoryStacks = state.player.inventory.stacks;
  const berryFormatter = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US');

  return (
    <div className="opfg-hud-inventory-stack">
      <button type="button" className="opfg-hud-home-button" onClick={() => undefined}>
        <House className="size-4" aria-hidden="true" />
        <span>{translate('ui.action.home')}</span>
      </button>

      <Panel
        variant="strong"
        padding="none"
        className="opfg-hud-panel opfg-hud-panel--inventory"
        aria-label={translate('ui.inventory')}
      >
        <div className="opfg-hud-section-header opfg-hud-inventory__header">
          <ContextTooltip
            className="opfg-hud-inventory__icon"
            title={translate('ui.inventory')}
            detail={translate('ui.inventory.description')}
            meta={`${inventoryStacks.length}/${inventoryCapacity}`}
            side="bottom"
          >
            <Backpack className="size-[1.15rem]" aria-hidden="true" />
          </ContextTooltip>
          <span>{translate('ui.inventory')}</span>
          <strong>{inventoryStacks.length}/{inventoryCapacity}</strong>
        </div>

        <div className="opfg-hud-panel__body opfg-hud-inventory">
          <div className="opfg-hud-slots opfg-hud-inventory__slots" aria-label={translate('ui.inventory.slotsAria')}>
            {Array.from({ length: INVENTORY_PREVIEW_SLOTS }, (_, index) => {
              const stack = inventoryStacks[index];
              const locked = index >= inventoryCapacity;

              if (locked) {
                return (
                  <span key={`inventory-${index}`} className="opfg-hud-slot is-locked" aria-label={translate('ui.slot.unavailable')}>
                    <LockKeyhole className="size-3.5" aria-hidden="true" />
                  </span>
                );
              }

              if (!stack) {
                return <span key={`inventory-${index}`} className="opfg-hud-slot is-empty" aria-label={translate('ui.slot.empty')} />;
              }

              const label = getItemLabel(stack, catalog, translate);
              return (
                <ContextTooltip
                  key={`inventory-${stack.itemId}-${index}`}
                  className="opfg-hud-slot-wrap"
                  title={label}
                  detail={translate('ui.inventory.personalItem.description')}
                  meta={`×${stack.quantity}`}
                  side="bottom"
                  focusable
                >
                  <span className="opfg-hud-slot is-filled">
                    <Package className="size-4" aria-hidden="true" />
                    {stack.quantity > 1 && <strong className="opfg-hud-slot__quantity">{stack.quantity}</strong>}
                  </span>
                </ContextTooltip>
              );
            })}
          </div>

          <ContextTooltip
            className="opfg-hud-inventory__money"
            title={translate('currency.berries.name')}
            detail={translate('ui.currency.berries.description')}
            meta={`${berryFormatter.format(state.berries)} B`}
            side="bottom"
          >
            <Coins className="size-4" aria-hidden="true" />
            <strong>{berryFormatter.format(state.berries)}</strong>
            <span>B</span>
          </ContextTooltip>
        </div>
      </Panel>
    </div>
  );
}

export function IdentityEnvironmentHudPanel({
  state,
  catalog,
  translate,
  calendarAgeMonths,
  monthEventProgress,
}: TopWorldHudProps) {
  const locationPath = getLocationPath(state, catalog);
  const rootLocation = locationPath[0];
  const subLocations = locationPath.slice(1);
  const currentLocation = locationPath[locationPath.length - 1];
  const sea = catalog.seas.find(({ id }) => id === (currentLocation?.seaId ?? state.player.profile.originSeaId));
  const locationLabel = rootLocation ? translate(rootLocation.nameKey) : state.locationId;
  const subLocationLabel = subLocations.length > 0 ? subLocations.map((location) => translate(location.nameKey)).join(' › ') : '—';
  const shownAgeMonths = calendarAgeMonths ?? state.ageMonths;
  const progress = Math.max(0, Math.min(MONTH_EVENT_SLOTS, monthEventProgress ?? (state.careerPhase === 'active' ? state.slotInMonth : 0)));
  const affiliationTitle = getAffiliationTitle(state, catalog, translate);
  const calendarLabel = getCalendarLabel(shownAgeMonths, translate);

  return (
    <Panel variant="strong" padding="none" className="opfg-hud-panel opfg-hud-panel--identity">
      <div className="opfg-hud-panel__body opfg-hud-identity">
        <div className="opfg-hud-identity__nameplate">
          <span aria-hidden="true" />
          <strong>{state.player.profile.name ?? '—'}</strong>
          <span aria-hidden="true" />
        </div>
        <div className="opfg-hud-identity__title">{affiliationTitle}</div>
        <div className="opfg-hud-identity__separator" />

        <div className="opfg-hud-identity__grid">
          <ContextTooltip
            className="opfg-hud-identity__column is-left"
            title={translate('ui.environment')}
            detail={translate(getUiTooltipKey('world'))}
            side="bottom"
          >
            <div className="opfg-hud-info-row is-primary">
              <MapPin className="size-4" aria-hidden="true" />
              <strong>{locationLabel}</strong>
            </div>
            <div className="opfg-hud-info-row is-muted">
              <Navigation className="size-4" aria-hidden="true" />
              <strong>{subLocationLabel}</strong>
            </div>
            <div className="opfg-hud-info-row is-muted">
              <Waves className="size-4" aria-hidden="true" />
              <strong>{sea ? translate(sea.nameKey) : '—'}</strong>
            </div>
          </ContextTooltip>

          <div className="opfg-hud-identity__column is-right">
            <ContextTooltip className="opfg-hud-info-row is-primary" title={translate('ui.age')} detail={translate('ui.age.description')} side="bottom">
              <Clock3 className="size-4" aria-hidden="true" />
              <strong>{Math.floor(shownAgeMonths / 12)} {translate('ui.unit.years')}</strong>
            </ContextTooltip>

            <ContextTooltip className="opfg-hud-info-row is-muted" title={translate('ui.date')} detail={translate('ui.date.description')} side="bottom">
              <CalendarDays className="size-4" aria-hidden="true" />
              <strong>{calendarLabel}</strong>
            </ContextTooltip>

            <ContextTooltip
              className="opfg-hud-info-row opfg-hud-month-progress"
              title={translate('ui.monthEvents')}
              detail={translate('ui.monthEvents.description')}
              meta={`${progress}/${MONTH_EVENT_SLOTS}`}
              side="bottom"
            >
              <ListChecks className="size-4" aria-hidden="true" />
              <span className="opfg-hud-month-progress__pips">
                {Array.from({ length: MONTH_EVENT_SLOTS }, (_, index) => (
                  <span key={`month-event-${index}`} className="opfg-hud-month-progress__pip" data-filled={index < progress ? 'true' : 'false'} aria-hidden="true" />
                ))}
              </span>
            </ContextTooltip>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function ShipHudPanel({ state, catalog, translate }: TopWorldHudProps) {
  const shipDefinition = state.ship ? catalog.ships.find(({ id }) => id === state.ship?.shipId) : undefined;
  const shipHealth = state.ship?.health ?? 0;
  const shipMaxHealth = shipDefinition?.maxHealth ?? 0;
  const shipType = shipDefinition ? translate(shipDefinition.nameKey) : '—';
  const cargoCapacity = shipDefinition?.cargoSlots ?? 0;
  const cargoOccupants = buildCargoOccupants(state, catalog, translate);

  return (
    <Panel variant="strong" padding="none" className="opfg-hud-panel opfg-hud-panel--ship">
      <div className="opfg-hud-section-header opfg-hud-ship__header">
        <ContextTooltip
          className="opfg-hud-ship__icon"
          title={translate('ui.ship')}
          detail={translate(getUiTooltipKey('ship'))}
          side="bottom"
        >
          <Anchor className="size-[1.2rem]" aria-hidden="true" />
        </ContextTooltip>

        <div className="opfg-hud-ship__copy">
          <strong className="opfg-hud-ship__name">{state.ship?.name ?? translate('ui.ship.none')}</strong>
          <span className="opfg-hud-ship__type">{state.ship ? shipType : '—'}</span>
        </div>

        <ContextTooltip
          className="opfg-hud-ship__resistance"
          title={translate('ui.ship.resistance')}
          detail={translate('ui.ship.resistance.description')}
          meta={state.ship ? `${shipHealth}/${shipMaxHealth}` : undefined}
          side="bottom"
          ariaLabel={state.ship
            ? translate('ui.ship.resistanceAria', { current: shipHealth, max: shipMaxHealth })
            : translate('ui.ship.none')}
          focusable
        >
          <ShieldCheck className="size-4" aria-hidden="true" />
          <strong>{state.ship ? shipHealth : '—'}</strong>
          {state.ship && <span>/{shipMaxHealth}</span>}
        </ContextTooltip>
      </div>

      <div className="opfg-hud-panel__body opfg-hud-ship">
        <div className="opfg-hud-slots opfg-hud-cargo" aria-label={translate('ui.cargo')}>
          <ContextTooltip
            className="opfg-hud-slot-wrap opfg-hud-cargo__storage-wrap"
            title={translate('ui.cargo.hold')}
            detail={translate('ui.cargo.description')}
            meta={`${cargoOccupants.length}/${cargoCapacity}`}
            side="bottom"
            focusable
          >
            <span className="opfg-hud-cargo__storage-icon">
              <Boxes className="size-[1.15rem]" aria-hidden="true" />
            </span>
          </ContextTooltip>

          {Array.from({ length: CARGO_PREVIEW_SLOTS }, (_, index) => {
            const occupant = cargoOccupants[index];
            const locked = !state.ship || index >= cargoCapacity;

            if (locked) {
              return (
                <span key={`cargo-${index}`} className="opfg-hud-slot is-locked" aria-label={translate('ui.cargo.slotUnavailable')}>
                  <LockKeyhole className="size-3.5" aria-hidden="true" />
                </span>
              );
            }
            if (!occupant) {
              return <span key={`cargo-${index}`} className="opfg-hud-slot is-empty" aria-label={translate('ui.cargo.slotEmpty')} />;
            }

            return (
              <ContextTooltip
                key={occupant.key}
                className="opfg-hud-slot-wrap"
                title={occupant.label}
                detail={translate(occupant.kind === 'passenger' ? 'ui.cargo.passenger.description' : 'ui.cargo.item.description')}
                meta={occupant.kind === 'item' ? `×${occupant.quantity}` : translate('ui.cargo.passenger')}
                side="bottom"
                focusable
              >
                <span className="opfg-hud-slot is-filled">
                  {occupant.kind === 'item'
                    ? <Package className="size-4" aria-hidden="true" />
                    : <UserRound className="size-4" aria-hidden="true" />}
                  {occupant.kind === 'item' && occupant.quantity > 1 && <strong className="opfg-hud-slot__quantity">{occupant.quantity}</strong>}
                </span>
              </ContextTooltip>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

export function TopWorldHud(props: TopWorldHudProps) {
  return (
    <div className="opfg-top-world-hud" aria-label={props.translate('ui.hud.mainAria')}>
      <InventoryHudPanel {...props} />
      <IdentityEnvironmentHudPanel {...props} />
      <ShipHudPanel {...props} />
    </div>
  );
}