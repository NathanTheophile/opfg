import {
  Anchor,
  Backpack,
  Boxes,
  Check,
  Coins,
  LockKeyhole,
  MapPin,
  Package,
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
import { ContextTooltip } from './ContextTooltip';
import {
  getUiTooltipDetail,
  inferTooltipLocale,
} from './context-tooltip-copy';
import './top-world-hud.css';

const INVENTORY_PREVIEW_SLOTS = 2;
const CARGO_PREVIEW_SLOTS = 7;
const YEAR_EVENT_SLOTS = 2;

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
  translate: (key: string) => string;
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

function getCurrentYearEventCount(
  state: GameState,
): number {
  const currentYear = Math.floor(state.ageMonths / 12);

  return Math.min(
    YEAR_EVENT_SLOTS,
    state.history.filter(
      (entry) =>
        Math.floor(entry.ageMonths / 12) === currentYear,
    ).length,
  );
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

export function InventoryHudPanel({
  state,
  catalog,
  translate,
}: TopWorldHudProps) {
  const tooltipLocale = inferTooltipLocale(
    translate('stat.health'),
  );
  const isFrench = tooltipLocale === 'fr';
  const inventoryCapacity = state.player.inventory.capacity;
  const inventoryStacks = state.player.inventory.stacks;
  const berryFormatter = new Intl.NumberFormat(
    isFrench ? 'fr-FR' : 'en-US',
  );

  return (
    <Panel
      variant="strong"
      padding="none"
      className="opfg-hud-panel opfg-hud-panel--inventory"
    >
      <div className="opfg-hud-panel__body opfg-hud-inventory">
        <div className="opfg-hud-panel__heading">
          <Backpack className="size-4" aria-hidden="true" />
          <span>{isFrench ? 'Inventaire' : 'Inventory'}</span>
        </div>

        <div className="opfg-hud-inventory__content">
          <ContextTooltip
            className="opfg-hud-inventory__money"
            title={isFrench ? 'Berrys' : 'Berries'}
            detail={
              isFrench
                ? 'Votre argent liquide. Évitez de tout dépenser dans le premier bar venu.'
                : 'Your cash. Try not to spend all of it in the first bar you find.'
            }
            meta={`${berryFormatter.format(state.berries)} B`}
            side="bottom"
          >
            <Coins className="size-4" aria-hidden="true" />
            <strong>{berryFormatter.format(state.berries)}</strong>
            <span>B</span>
          </ContextTooltip>

          <div
            className="opfg-hud-slots opfg-hud-inventory__slots"
            aria-label={
              isFrench
                ? 'Emplacements d’inventaire'
                : 'Inventory slots'
            }
          >
            {Array.from(
              { length: INVENTORY_PREVIEW_SLOTS },
              (_, index) => {
                const stack = inventoryStacks[index];
                const locked = index >= inventoryCapacity;

                if (locked) {
                  return (
                    <span
                      key={`inventory-${index}`}
                      className="opfg-hud-slot is-locked"
                      aria-label={
                        isFrench
                          ? 'Emplacement indisponible'
                          : 'Unavailable slot'
                      }
                    >
                      <LockKeyhole
                        className="size-3.5"
                        aria-hidden="true"
                      />
                    </span>
                  );
                }

                if (!stack) {
                  return (
                    <span
                      key={`inventory-${index}`}
                      className="opfg-hud-slot is-empty"
                      aria-label={
                        isFrench
                          ? 'Emplacement vide'
                          : 'Empty slot'
                      }
                    />
                  );
                }

                const label = getItemLabel(
                  stack,
                  catalog,
                  translate,
                );

                return (
                  <ContextTooltip
                    key={`inventory-${stack.itemId}-${index}`}
                    className="opfg-hud-slot-wrap"
                    title={label}
                    detail={
                      isFrench
                        ? 'Objet personnel. Les objets identiques restent empilés dans un même slot.'
                        : 'Personal item. Identical items remain stacked in the same slot.'
                    }
                    meta={`×${stack.quantity}`}
                    side="bottom"
                    focusable
                  >
                    <span className="opfg-hud-slot is-filled">
                      <Package
                        className="size-4"
                        aria-hidden="true"
                      />

                      {stack.quantity > 1 && (
                        <strong className="opfg-hud-slot__quantity">
                          {stack.quantity}
                        </strong>
                      )}
                    </span>
                  </ContextTooltip>
                );
              },
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function IdentityEnvironmentHudPanel({
  state,
  catalog,
  translate,
}: TopWorldHudProps) {
  const tooltipLocale = inferTooltipLocale(
    translate('stat.health'),
  );
  const isFrench = tooltipLocale === 'fr';
  const locationPath = getLocationPath(state, catalog);
  const rootLocation = locationPath[0];
  const subLocations = locationPath.slice(1);
  const currentLocation =
    locationPath[locationPath.length - 1];

  const sea = catalog.seas.find(
    ({ id }) =>
      id ===
      (currentLocation?.seaId ??
        state.player.profile.originSeaId),
  );

  const locationLabel = rootLocation
    ? translate(rootLocation.nameKey)
    : state.locationId;

  const subLocationLabel =
    subLocations.length > 0
      ? subLocations
          .map((location) => translate(location.nameKey))
          .join(' · ')
      : '—';

  const annualEventCount =
    getCurrentYearEventCount(state);

  return (
    <Panel
      variant="strong"
      padding="none"
      className="opfg-hud-panel opfg-hud-panel--identity"
    >
      <div className="opfg-hud-panel__body opfg-hud-identity">
        <div className="opfg-hud-identity__nameplate">
          <span aria-hidden="true" />
          <strong>{state.player.profile.name ?? '—'}</strong>
          <span aria-hidden="true" />
        </div>

        <div className="opfg-hud-identity__age">
          {Math.floor(state.ageMonths / 12)}{' '}
          {isFrench ? 'ans' : 'years'}
        </div>

        <ContextTooltip
          className="opfg-hud-year-progress"
          title={
            isFrench
              ? 'Événements de l’année'
              : 'Events this year'
          }
          detail={
            isFrench
              ? 'Deux jalons annuels. Chaque rectangle se remplit lorsqu’un Event de l’année est résolu, puis la progression repart à zéro à l’année suivante.'
              : 'Two yearly milestones. Each rectangle fills when an Event for the current year is resolved, then resets on the next year.'
          }
          meta={`${annualEventCount}/${YEAR_EVENT_SLOTS}`}
          side="bottom"
        >
          {Array.from(
            { length: YEAR_EVENT_SLOTS },
            (_, index) => {
              const filled = index < annualEventCount;

              return (
                <span
                  key={`year-event-${index}`}
                  className="opfg-hud-year-progress__slot"
                  data-filled={filled ? 'true' : 'false'}
                  aria-label={`${isFrench ? 'Événement' : 'Event'} ${index + 1}: ${
                    filled
                      ? isFrench
                        ? 'résolu'
                        : 'resolved'
                      : isFrench
                        ? 'à venir'
                        : 'upcoming'
                  }`}
                >
                  {filled && (
                    <Check
                      className="size-3.5"
                      aria-hidden="true"
                    />
                  )}

                  <span>
                    {isFrench ? 'Événement' : 'Event'}{' '}
                    {index + 1}
                  </span>
                </span>
              );
            },
          )}
        </ContextTooltip>

        <div className="opfg-hud-identity__separator" />

        <ContextTooltip
          className="opfg-hud-environment"
          title={isFrench ? 'Monde' : 'World'}
          detail={getUiTooltipDetail(
            'world',
            tooltipLocale,
          )}
          side="bottom"
        >
          <div className="opfg-hud-environment__location">
            <MapPin className="size-4" aria-hidden="true" />

            <span>
              <small>{isFrench ? 'Lieu' : 'Location'}</small>
              <strong>{locationLabel}</strong>
            </span>

            <i aria-hidden="true">/</i>

            <span>
              <small>
                {isFrench ? 'Sous-lieu' : 'Sub-location'}
              </small>
              <strong>{subLocationLabel}</strong>
            </span>
          </div>

          <div className="opfg-hud-environment__sea">
            <Waves className="size-4" aria-hidden="true" />
            <small>{isFrench ? 'Mer' : 'Sea'}</small>
            <strong>
              {sea ? translate(sea.nameKey) : '—'}
            </strong>
          </div>
        </ContextTooltip>
      </div>
    </Panel>
  );
}

export function ShipHudPanel({
  state,
  catalog,
  translate,
}: TopWorldHudProps) {
  const tooltipLocale = inferTooltipLocale(
    translate('stat.health'),
  );
  const isFrench = tooltipLocale === 'fr';
  const shipDefinition = state.ship
    ? catalog.ships.find(
        ({ id }) => id === state.ship?.shipId,
      )
    : undefined;

  const shipPercent =
    state.ship && shipDefinition
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              (state.ship.health /
                shipDefinition.maxHealth) *
                100,
            ),
          ),
        )
      : 0;

  const cargoCapacity = shipDefinition?.cargoSlots ?? 0;
  const cargoOccupants = buildCargoOccupants(
    state,
    catalog,
    translate,
  );

  return (
    <Panel
      variant="strong"
      padding="none"
      className="opfg-hud-panel opfg-hud-panel--ship"
    >
      <div className="opfg-hud-panel__body opfg-hud-ship">
        <div className="opfg-hud-ship__header">
          <ContextTooltip
            className="opfg-hud-ship__icon"
            title={isFrench ? 'Bateau' : 'Ship'}
            detail={getUiTooltipDetail(
              'ship',
              tooltipLocale,
            )}
            meta={
              state.ship
                ? `${state.ship.health} HP · ${shipPercent}%`
                : undefined
            }
            side="bottom"
          >
            <Anchor
              className="size-[1.15rem]"
              aria-hidden="true"
            />
          </ContextTooltip>

          <div className="opfg-hud-ship__copy">
            <div className="opfg-hud-panel__heading">
              {isFrench ? 'Bateau' : 'Ship'}
            </div>

            <strong className="opfg-hud-ship__name">
              {state.ship?.name ??
                (isFrench ? 'Aucun bateau' : 'No ship')}
            </strong>
          </div>

          <span className="opfg-hud-ship__health">
            {state.ship ? `${shipPercent}%` : '—'}
          </span>
        </div>

        <div
          className="opfg-hud-ship__condition"
          aria-label={
            isFrench
              ? `État du bateau : ${shipPercent}%`
              : `Ship condition: ${shipPercent}%`
          }
        >
          <span style={{ width: `${shipPercent}%` }} />
        </div>

        <div
          className="opfg-hud-slots opfg-hud-cargo"
          aria-label={
            isFrench ? 'Cargaison' : 'Cargo'
          }
        >
          <ContextTooltip
            className="opfg-hud-slot-wrap"
            title={isFrench ? 'Cale' : 'Cargo'}
            detail={
              isFrench
                ? 'La première case représente le transport. Les sept autres correspondent aux emplacements de cargaison maximum.'
                : 'The first cell represents transport. The other seven are the maximum cargo slots.'
            }
            meta={`${cargoOccupants.length}/${cargoCapacity}`}
            side="bottom"
            focusable
          >
            <span className="opfg-hud-slot opfg-hud-slot--transport">
              <Boxes
                className="size-4"
                aria-hidden="true"
              />
            </span>
          </ContextTooltip>

          {Array.from(
            { length: CARGO_PREVIEW_SLOTS },
            (_, index) => {
              const occupant = cargoOccupants[index];
              const locked =
                !state.ship || index >= cargoCapacity;

              if (locked) {
                return (
                  <span
                    key={`cargo-${index}`}
                    className="opfg-hud-slot is-locked"
                    aria-label={
                      isFrench
                        ? 'Slot de cargaison indisponible'
                        : 'Unavailable cargo slot'
                    }
                  >
                    <LockKeyhole
                      className="size-3.5"
                      aria-hidden="true"
                    />
                  </span>
                );
              }

              if (!occupant) {
                return (
                  <span
                    key={`cargo-${index}`}
                    className="opfg-hud-slot is-empty"
                    aria-label={
                      isFrench
                        ? 'Slot de cargaison vide'
                        : 'Empty cargo slot'
                    }
                  />
                );
              }

              return (
                <ContextTooltip
                  key={occupant.key}
                  className="opfg-hud-slot-wrap"
                  title={occupant.label}
                  detail={
                    occupant.kind === 'passenger'
                      ? isFrench
                        ? 'Passager temporaire : il consomme également un emplacement de cale.'
                        : 'Temporary passenger: they also consume one cargo slot.'
                      : isFrench
                        ? 'Objet transporté dans la cale du bateau.'
                        : 'Item transported in the ship cargo hold.'
                  }
                  meta={
                    occupant.kind === 'item'
                      ? `×${occupant.quantity}`
                      : isFrench
                        ? 'Passager'
                        : 'Passenger'
                  }
                  side="bottom"
                  focusable
                >
                  <span className="opfg-hud-slot is-filled">
                    {occupant.kind === 'item' ? (
                      <Package
                        className="size-4"
                        aria-hidden="true"
                      />
                    ) : (
                      <UserRound
                        className="size-4"
                        aria-hidden="true"
                      />
                    )}

                    {occupant.kind === 'item' &&
                      occupant.quantity > 1 && (
                        <strong className="opfg-hud-slot__quantity">
                          {occupant.quantity}
                        </strong>
                      )}
                  </span>
                </ContextTooltip>
              );
            },
          )}
        </div>
      </div>
    </Panel>
  );
}

export function TopWorldHud(
  props: TopWorldHudProps,
) {
  return (
    <div
      className="opfg-top-world-hud"
      aria-label={
        inferTooltipLocale(
          props.translate('stat.health'),
        ) === 'fr'
          ? 'Informations principales'
          : 'Primary information'
      }
    >
      <InventoryHudPanel {...props} />
      <IdentityEnvironmentHudPanel {...props} />
      <ShipHudPanel {...props} />
    </div>
  );
}
