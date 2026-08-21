import type { DragEvent, ReactNode } from 'react';
import { Anchor, Backpack, Coins, House, LockKeyhole, Navigation, Package, ShieldCheck, Shirt, UserRound } from 'lucide-react';
import { Panel, NineSliceFrame } from '@/components/ui';
import type { ContentCatalog, LocationDefinition } from '@/game/content/schema';
import type { GameState, ItemId, ItemStack } from '@/game/model/schema';
import type { LocaleId, Translator } from '@/game/localization';
import type { StorageSlot } from '@/game/engine/inventory';
import { getItemIconUrl } from '@/ui/itemIcons';
import { ContextTooltip } from './ContextTooltip';
import { getUiTooltipKey } from './context-tooltip-copy';
import './hud-panel-header.css';
import './item-icons.css';
import './top-world-hud.css';

const INVENTORY_PREVIEW_SLOTS = 2;
const CARGO_PREVIEW_SLOTS = 8;
const CALENDAR_START_YEAR = 1507;

type CargoOccupant =
  | {
      kind: 'item';
      key: string;
      label: string;
      itemId: ItemId;
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
   * Presentation override while a resolved Outcome is still visible.
   * Keeps the HUD on the age/date where the displayed Event happened.
   */
  calendarAgeMonths?: number;
  selectedStorageSlot?: StorageSlot | null;
  onStorageSlot?: (slot: StorageSlot) => void;
  onHome?: () => void;
}

function storageKey(slot: StorageSlot): string {
  return slot.type === 'logPose' || slot.type === 'companion'
    ? slot.type
    : `${slot.type}-${slot.index}`;
}

function interactionProps(
  slot: StorageSlot,
  selected: StorageSlot | null | undefined,
  onSlot?: (slot: StorageSlot) => void,
) {
  return {
    draggable: true,
    'data-selected': selected && storageKey(selected) === storageKey(slot) ? 'true' : undefined,
    onClick: () => onSlot?.(slot),
    onDragStart: (event: DragEvent) => event.dataTransfer.setData('application/x-opfg-storage', JSON.stringify(slot)),
    onDragOver: (event: DragEvent) => { if (onSlot) event.preventDefault(); },
    onDrop: (event: DragEvent) => {
      event.preventDefault();
      try {
        onSlot?.(JSON.parse(event.dataTransfer.getData('application/x-opfg-storage')) as StorageSlot);
        onSlot?.(slot);
      } catch {
        // Ignore foreign drags.
      }
    },
  };
}

function ItemSlotIcon({ itemId, fallback }: { itemId: ItemId; fallback: ReactNode }) {
  const iconUrl = getItemIconUrl(itemId);
  return iconUrl
    ? <img className="opfg-hud-slot__item-icon" src={iconUrl} alt="" aria-hidden="true" draggable={false} />
    : fallback;
}

function getItemLabel(
  stack: ItemStack,
  catalog: ContentCatalog,
  translate: (key: string) => string,
): string {
  const definition = catalog.items.find(({ id }) => id === stack.itemId);
  return definition ? translate(definition.nameKey) : stack.itemId;
}

export function getLocationPath(
  state: GameState,
  catalog: ContentCatalog,
): LocationDefinition[] {
  const path: LocationDefinition[] = [];
  const visited = new Set<string>();
  let current = catalog.locations.find(({ id }) => id === state.locationId);

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current);
    current = current.parentLocationId
      ? catalog.locations.find(({ id }) => id === current?.parentLocationId)
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
      label: getItemLabel(stack, catalog, translate),
      itemId: stack.itemId,
      quantity: stack.quantity,
    })),
    ...state.passengerNpcIds.map((npcId) => {
      const definition = catalog.npcs.find(({ id }) => id === npcId);
      return {
        kind: 'passenger' as const,
        key: `passenger-${npcId}`,
        label: definition ? translate(definition.nameKey) : npcId,
      };
    }),
  ];
}

export function getCalendarLabel(ageMonths: number, translate: Translator): string {
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
  selectedStorageSlot,
  onStorageSlot,
  onHome,
}: TopWorldHudProps) {
  const inventoryCapacity = state.player.inventory.capacity;
  const inventoryStacks = state.player.inventory.stacks;
  const berryFormatter = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US');

  return (
    <div className="opfg-hud-inventory-stack">
      <button type="button" className="opfg-hud-home-button opfg-hud-section-header" onClick={onHome} disabled={!onHome} aria-label={translate('ui.action.home')}>
        <NineSliceFrame />
        <House className="size-4" aria-hidden="true" />
        <span className="opfg-hud-section-title">{translate('ui.action.home')}</span>
      </button>

      <Panel variant="strong" padding="none" className="opfg-hud-panel opfg-hud-panel--inventory" aria-label={translate('ui.inventory')}>
        <div className="opfg-hud-section-header opfg-hud-inventory__header">
          <ContextTooltip
            className="opfg-hud-inventory__icon opfg-hud-header-icon-slot"
            title={translate('ui.inventory')}
            detail={translate('ui.inventory.description')}
            meta={`${inventoryStacks.length}/${inventoryCapacity}`}
            side="bottom"
          >
            <Backpack className="size-[1.15rem]" aria-hidden="true" />
          </ContextTooltip>
          <span className="opfg-hud-section-title">{translate('ui.inventory')}</span>
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
                return <button key={`inventory-${index}`} type="button" className="opfg-hud-slot is-empty" aria-label={translate('ui.slot.empty')} {...interactionProps({ type: 'pocket', index: index as 0 | 1 }, selectedStorageSlot, onStorageSlot)} />;
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
                  <span className="opfg-hud-slot is-filled" {...interactionProps({ type: 'pocket', index: index as 0 | 1 }, selectedStorageSlot, onStorageSlot)}>
                    <ItemSlotIcon itemId={stack.itemId} fallback={<Package className="size-4" aria-hidden="true" />} />
                    {stack.quantity > 1 && <strong className="opfg-hud-slot__quantity">{stack.quantity}</strong>}
                  </span>
                </ContextTooltip>
              );
            })}
          </div>

          <div className="opfg-hud-equipment" aria-label={translate('ui.equipment')}>
            {state.player.equipment.map((stack, index) => {
              const slot = { type: 'equipment' as const, index: index as 0 | 1 };
              return (
                <button key={`equipment-${index}`} type="button" className={`opfg-hud-slot ${stack ? 'is-filled' : 'is-empty'}`} aria-label={stack ? getItemLabel(stack, catalog, translate) : translate('ui.equipment.empty')} {...interactionProps(slot, selectedStorageSlot, onStorageSlot)}>
                  {stack
                    ? <ItemSlotIcon itemId={stack.itemId} fallback={<Shirt className="size-4" aria-hidden="true" />} />
                    : <Shirt className="size-4" aria-hidden="true" />}
                </button>
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
            <strong>{berryFormatter.format(state.berries)}</strong>
            <Coins className="size-4" aria-hidden="true" />
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
}: TopWorldHudProps) {
  const affiliationTitle = getAffiliationTitle(state, catalog, translate);

  return (
    <Panel variant="strong" padding="none" className="opfg-hud-panel opfg-hud-panel--identity">
      <div className="opfg-hud-panel__body opfg-hud-identity">
        <div className="opfg-hud-identity__upper">
          {state.player.profile.name && (
            <div className="opfg-hud-identity__nameplate">
              <span aria-hidden="true" />
              <strong>{state.player.profile.name}</strong>
              <span aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="opfg-hud-identity__separator" />
        <div className="opfg-hud-identity__lower">
          <div className="opfg-hud-identity__title">{affiliationTitle}</div>
        </div>
      </div>
    </Panel>
  );
}

export function ShipHudPanel({ state, catalog, translate, selectedStorageSlot, onStorageSlot }: TopWorldHudProps) {
  const shipDefinition = state.ship ? catalog.ships.find(({ id }) => id === state.ship?.shipId) : undefined;
  const shipHealth = state.ship?.health ?? 0;
  const shipMaxHealth = shipDefinition?.maxHealth ?? 0;
  const cargoCapacity = shipDefinition?.cargoSlots ?? 0;
  const cargoOccupants = buildCargoOccupants(state, catalog, translate);
  const activeCompanion = state.player.companion;
  const activeCompanionDefinition = activeCompanion
    ? catalog.items.find(({ id }) => id === activeCompanion.itemId)
    : undefined;
  const activeCompanionLabel = activeCompanion ? getItemLabel(activeCompanion, catalog, translate) : null;
  const activeCompanionBonus = activeCompanionDefinition?.companion === true
    ? Object.entries(activeCompanionDefinition.modifiers ?? {})
        .filter(([, amount]) => amount !== 0)
        .map(([statId, amount]) => `${Number(amount) > 0 ? '+' : ''}${amount} ${translate(`stat.${statId}`)}`)
        .join(' · ')
    : '';

  return (
    <Panel variant="strong" padding="none" className="opfg-hud-panel opfg-hud-panel--ship">
      <div className="opfg-hud-section-header opfg-hud-ship__header">
        <ContextTooltip
          className="opfg-hud-ship__icon opfg-hud-header-icon-slot"
          title={translate('ui.ship')}
          detail={translate(getUiTooltipKey('ship'))}
          side="bottom"
        >
          <Anchor className="size-[1.2rem]" aria-hidden="true" />
        </ContextTooltip>

        <div className="opfg-hud-ship__copy">
          <span className="opfg-hud-section-title">{translate('ui.ship')}</span>
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
        <div className="opfg-hud-storage-layout">
          <div className="opfg-hud-cargo-group">
            <div className="opfg-hud-slots opfg-hud-cargo" aria-label={translate('ui.cargo')}>
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
                  return <button key={`cargo-${index}`} type="button" className="opfg-hud-slot is-empty" aria-label={translate('ui.cargo.slotEmpty')} {...interactionProps({ type: 'cargo', index }, selectedStorageSlot, onStorageSlot)} />;
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
                    <span className="opfg-hud-slot is-filled" {...(occupant.kind === 'item' ? interactionProps({ type: 'cargo', index }, selectedStorageSlot, onStorageSlot) : {})}>
                      {occupant.kind === 'item'
                        ? <ItemSlotIcon itemId={occupant.itemId} fallback={<Package className="size-4" aria-hidden="true" />} />
                        : <UserRound className="size-4" aria-hidden="true" />}
                      {occupant.kind === 'item' && occupant.quantity > 1 && <strong className="opfg-hud-slot__quantity">{occupant.quantity}</strong>}
                    </span>
                  </ContextTooltip>
                );
              })}
            </div>
          </div>

          <div className="opfg-hud-special-slots" aria-label={translate('ui.specialSlots')}>
            <ContextTooltip
              className="opfg-hud-slot-wrap"
              title={translate('ui.logPose.title')}
              detail={state.player.logPose ? getItemLabel(state.player.logPose, catalog, translate) : translate('ui.logPose.empty')}
              side="bottom"
              focusable
            >
              <button
                type="button"
                className={`opfg-hud-slot ${state.player.logPose ? 'is-filled' : 'is-empty'}`}
                aria-label={state.player.logPose ? getItemLabel(state.player.logPose, catalog, translate) : translate('ui.logPose.empty')}
                {...interactionProps({ type: 'logPose' }, selectedStorageSlot, onStorageSlot)}
              >
                {state.player.logPose
                  ? <ItemSlotIcon itemId={state.player.logPose.itemId} fallback={<Navigation className="size-4" aria-hidden="true" />} />
                  : <Navigation className="size-4" aria-hidden="true" />}
              </button>
            </ContextTooltip>

            <ContextTooltip
              className="opfg-hud-slot-wrap"
              title={translate('ui.companion.title')}
              detail={activeCompanionLabel
                ? [activeCompanionLabel, activeCompanionBonus].filter(Boolean).join(' · ')
                : translate('ui.companion.empty')}
              side="bottom"
              focusable
            >
              <button
                type="button"
                className={`opfg-hud-slot ${activeCompanion ? 'is-filled' : 'is-empty'}`}
                aria-label={activeCompanionLabel ?? translate('ui.companion.empty')}
                {...interactionProps({ type: 'companion' }, selectedStorageSlot, onStorageSlot)}
              >
                <UserRound className="size-4" aria-hidden="true" />
              </button>
            </ContextTooltip>
          </div>
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
