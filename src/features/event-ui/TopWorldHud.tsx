import {
  Anchor,
  Backpack,
  Boxes,
  CalendarDays,
  Clock3,
  Coins,
  ListChecks,
  LockKeyhole,
  MapPin,
  Navigation,
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
  translate: (key: string) => string;

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
  isFrench: boolean,
): string {
  const safeAgeMonths = Math.max(
    0,
    Math.floor(ageMonths),
  );

  const year =
    CALENDAR_START_YEAR +
    Math.floor(safeAgeMonths / 12);

  const monthIndex =
    safeAgeMonths % 12;

  const months = isFrench
    ? [
        'Janvier',
        'Février',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juillet',
        'Août',
        'Septembre',
        'Octobre',
        'Novembre',
        'Décembre',
      ]
    : [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

  return `${months[monthIndex]} ${year}`;
}

function getAffiliationTitle(
  state: GameState,
  catalog: ContentCatalog,
  translate: (key: string) => string,
  isFrench: boolean,
): string {
  const careerAffiliation =
    catalog.careerAffiliations.find(
      ({ id }) =>
        id === state.player.career.affiliationId,
    );

  if (careerAffiliation) {
    return translate(careerAffiliation.nameKey);
  }

  const profileAffiliation =
    catalog.affiliations.find(
      ({ id }) =>
        id === state.player.profile.affiliationId,
    );

  if (profileAffiliation) {
    return translate(profileAffiliation.nameKey);
  }

  return isFrench ? 'Civil' : 'Civilian';
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
  const inventoryCapacity =
    state.player.inventory.capacity;
  const inventoryStacks =
    state.player.inventory.stacks;

  const berryFormatter =
    new Intl.NumberFormat(
      isFrench ? 'fr-FR' : 'en-US',
    );

  return (
    <Panel
      variant="strong"
      padding="none"
      className="opfg-hud-panel opfg-hud-panel--inventory"
    >
      <div className="opfg-hud-panel__body opfg-hud-inventory">
        <div className="opfg-hud-inventory__topline">
          <ContextTooltip
            className="opfg-hud-inventory__icon"
            title={
              isFrench
                ? 'Inventaire'
                : 'Inventory'
            }
            detail={
              isFrench
                ? 'Deux emplacements personnels. Simple, rapide, et difficile à transformer en débarras.'
                : 'Two personal slots. Simple, fast, and difficult to turn into a junk drawer.'
            }
            meta={`${inventoryStacks.length}/${inventoryCapacity}`}
            side="bottom"
          >
            <Backpack
              className="size-[1.15rem]"
              aria-hidden="true"
            />
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
              {
                length:
                  INVENTORY_PREVIEW_SLOTS,
              },
              (_, index) => {
                const stack =
                  inventoryStacks[index];

                const locked =
                  index >= inventoryCapacity;

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
                        ? 'Objet personnel. Les objets identiques restent empilés dans le même emplacement.'
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

                      {stack.quantity >
                        1 && (
                        <strong className="opfg-hud-slot__quantity">
                          {
                            stack.quantity
                          }
                        </strong>
                      )}
                    </span>
                  </ContextTooltip>
                );
              },
            )}
          </div>
        </div>

        <ContextTooltip
          className="opfg-hud-inventory__money"
          title={
            isFrench ? 'Berrys' : 'Berries'
          }
          detail={
            isFrench
              ? 'Votre argent liquide. Rien ne vous oblige à le dépenser dans le premier bar venu.'
              : 'Your cash. Nothing forces you to spend it in the first bar you find.'
          }
          meta={`${berryFormatter.format(
            state.berries,
          )} B`}
          side="bottom"
        >
          <Coins
            className="size-4"
            aria-hidden="true"
          />
          <strong>
            {berryFormatter.format(
              state.berries,
            )}
          </strong>
          <span>B</span>
        </ContextTooltip>
      </div>
    </Panel>
  );
}

export function IdentityEnvironmentHudPanel({
  state,
  catalog,
  translate,
  calendarAgeMonths,
  monthEventProgress,
}: TopWorldHudProps) {
  const tooltipLocale = inferTooltipLocale(
    translate('stat.health'),
  );

  const isFrench =
    tooltipLocale === 'fr';

  const locationPath =
    getLocationPath(state, catalog);

  const rootLocation =
    locationPath[0];

  const subLocations =
    locationPath.slice(1);

  const currentLocation =
    locationPath[
      locationPath.length - 1
    ];

  const sea = catalog.seas.find(
    ({ id }) =>
      id ===
      (currentLocation?.seaId ??
        state.player.profile
          .originSeaId),
  );

  const locationLabel =
    rootLocation
      ? translate(
          rootLocation.nameKey,
        )
      : state.locationId;

  const subLocationLabel =
    subLocations.length > 0
      ? subLocations
          .map((location) =>
            translate(
              location.nameKey,
            ),
          )
          .join(' › ')
      : '—';

  const shownAgeMonths =
    calendarAgeMonths ??
    state.ageMonths;

  const progress = Math.max(
    0,
    Math.min(
      MONTH_EVENT_SLOTS,
      monthEventProgress ??
        (state.careerPhase ===
        'active'
          ? state.slotInMonth
          : 0),
    ),
  );

  const affiliationTitle =
    getAffiliationTitle(
      state,
      catalog,
      translate,
      isFrench,
    );

  const calendarLabel =
    getCalendarLabel(
      shownAgeMonths,
      isFrench,
    );

  return (
    <Panel
      variant="strong"
      padding="none"
      className="opfg-hud-panel opfg-hud-panel--identity"
    >
      <div className="opfg-hud-panel__body opfg-hud-identity">
        <div className="opfg-hud-identity__nameplate">
          <span aria-hidden="true" />
          <strong>
            {state.player.profile.name ??
              '—'}
          </strong>
          <span aria-hidden="true" />
        </div>

        <div className="opfg-hud-identity__title">
          {affiliationTitle}
        </div>

        <div className="opfg-hud-identity__separator" />

        <div className="opfg-hud-identity__grid">
          <ContextTooltip
            className="opfg-hud-identity__column is-left"
            title={
              isFrench
                ? 'Environnement'
                : 'Environment'
            }
            detail={getUiTooltipDetail(
              'world',
              tooltipLocale,
            )}
            side="bottom"
          >
            <div className="opfg-hud-info-row is-primary">
              <MapPin
                className="size-4"
                aria-hidden="true"
              />
              <strong>
                {locationLabel}
              </strong>
            </div>

            <div className="opfg-hud-info-row is-muted">
              <Navigation
                className="size-4"
                aria-hidden="true"
              />
              <strong>
                {subLocationLabel}
              </strong>
            </div>

            <div className="opfg-hud-info-row is-muted">
              <Waves
                className="size-4"
                aria-hidden="true"
              />
              <strong>
                {sea
                  ? translate(
                      sea.nameKey,
                    )
                  : '—'}
              </strong>
            </div>
          </ContextTooltip>

          <div className="opfg-hud-identity__column is-right">
            <ContextTooltip
              className="opfg-hud-info-row is-primary"
              title={
                isFrench ? 'Âge' : 'Age'
              }
              detail={
                isFrench
                  ? 'Âge actuel du personnage.'
                  : 'Current character age.'
              }
              side="bottom"
            >
              <Clock3
                className="size-4"
                aria-hidden="true"
              />
              <strong>
                {Math.floor(
                  shownAgeMonths /
                    12,
                )}{' '}
                {isFrench
                  ? 'ans'
                  : 'years'}
              </strong>
            </ContextTooltip>

            <ContextTooltip
              className="opfg-hud-info-row is-muted"
              title={
                isFrench ? 'Date' : 'Date'
              }
              detail={
                isFrench
                  ? 'Le calendrier OPFG commence toujours en janvier 1507, deux ans après la naissance de Luffy.'
                  : 'The OPFG calendar always starts in January 1507, two years after Luffy was born.'
              }
              side="bottom"
            >
              <CalendarDays
                className="size-4"
                aria-hidden="true"
              />
              <strong>
                {calendarLabel}
              </strong>
            </ContextTooltip>

            <ContextTooltip
              className="opfg-hud-info-row opfg-hud-month-progress"
              title={
                isFrench
                  ? 'Events du mois'
                  : 'Events this month'
              }
              detail={
                isFrench
                  ? 'Le premier rectangle se remplit après le premier Event du mois, le second après le deuxième. Les deux se vident au passage au mois suivant.'
                  : 'The first pip fills after the first Event of the month and the second after the second. Both reset when the next month begins.'
              }
              meta={`${progress}/${MONTH_EVENT_SLOTS}`}
              side="bottom"
            >
              <ListChecks
                className="size-4"
                aria-hidden="true"
              />

              <span className="opfg-hud-month-progress__pips">
                {Array.from(
                  {
                    length:
                      MONTH_EVENT_SLOTS,
                  },
                  (_, index) => (
                    <span
                      key={`month-event-${index}`}
                      className="opfg-hud-month-progress__pip"
                      data-filled={
                        index <
                        progress
                          ? 'true'
                          : 'false'
                      }
                      aria-hidden="true"
                    />
                  ),
                )}
              </span>
            </ContextTooltip>
          </div>
        </div>
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

  const isFrench =
    tooltipLocale === 'fr';

  const shipDefinition =
    state.ship
      ? catalog.ships.find(
          ({ id }) =>
            id ===
            state.ship?.shipId,
        )
      : undefined;

  const shipPercent =
    state.ship &&
    shipDefinition
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              (state.ship.health /
                shipDefinition
                  .maxHealth) *
                100,
            ),
          ),
        )
      : 0;

  const cargoCapacity =
    shipDefinition?.cargoSlots ??
    0;

  const cargoOccupants =
    buildCargoOccupants(
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
        <div className="opfg-hud-ship__identity">
          <ContextTooltip
            className="opfg-hud-ship__icon"
            title={
              isFrench ? 'Bateau' : 'Ship'
            }
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
              className="size-[1.2rem]"
              aria-hidden="true"
            />
          </ContextTooltip>

          <div className="opfg-hud-ship__copy">
            <strong className="opfg-hud-ship__name">
              {state.ship?.name ??
                (isFrench
                  ? 'Aucun bateau'
                  : 'No ship')}
            </strong>

            <span className="opfg-hud-ship__status">
              {state.ship
                ? `${shipPercent}%`
                : '—'}
            </span>
          </div>
        </div>

        <div
          className="opfg-hud-ship__condition"
          aria-label={
            isFrench
              ? `État du bateau : ${shipPercent}%`
              : `Ship condition: ${shipPercent}%`
          }
        >
          <span
            style={{
              width:
                `${shipPercent}%`,
            }}
          />
        </div>

        <div
          className="opfg-hud-slots opfg-hud-cargo"
          aria-label={
            isFrench
              ? 'Cargaison'
              : 'Cargo'
          }
        >
          <ContextTooltip
            className="opfg-hud-slot-wrap"
            title={
              isFrench
                ? 'Cale'
                : 'Cargo'
            }
            detail={
              isFrench
                ? 'La première case représente le transport. Les sept autres sont les emplacements de cargaison maximum.'
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
            {
              length:
                CARGO_PREVIEW_SLOTS,
            },
            (_, index) => {
              const occupant =
                cargoOccupants[index];

              const locked =
                !state.ship ||
                index >=
                  cargoCapacity;

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
                  key={
                    occupant.key
                  }
                  className="opfg-hud-slot-wrap"
                  title={
                    occupant.label
                  }
                  detail={
                    occupant.kind ===
                    'passenger'
                      ? isFrench
                        ? 'Passager temporaire : il consomme également un emplacement de cale.'
                        : 'Temporary passenger: they also consume one cargo slot.'
                      : isFrench
                        ? 'Objet transporté dans la cale du bateau.'
                        : 'Item transported in the ship cargo hold.'
                  }
                  meta={
                    occupant.kind ===
                    'item'
                      ? `×${occupant.quantity}`
                      : isFrench
                        ? 'Passager'
                        : 'Passenger'
                  }
                  side="bottom"
                  focusable
                >
                  <span className="opfg-hud-slot is-filled">
                    {occupant.kind ===
                    'item' ? (
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

                    {occupant.kind ===
                      'item' &&
                      occupant.quantity >
                        1 && (
                        <strong className="opfg-hud-slot__quantity">
                          {
                            occupant.quantity
                          }
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
          props.translate(
            'stat.health',
          ),
        ) === 'fr'
          ? 'Informations principales'
          : 'Primary information'
      }
    >
      <InventoryHudPanel
        {...props}
      />
      <IdentityEnvironmentHudPanel
        {...props}
      />
      <ShipHudPanel
        {...props}
      />
    </div>
  );
}
