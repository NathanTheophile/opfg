import {
  Anchor,
  Backpack,
  Boxes,
  Clock3,
  Coins,
  Compass,
  LockKeyhole,
  MapPin,
  Package,
  UserRound,
  Waves,
} from 'lucide-react';
import { Panel } from '@/components/ui';
import type { ContentCatalog } from '@/game/content/schema';
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

export function TopWorldHud({
  state,
  catalog,
  translate,
}: TopWorldHudProps) {
  const sea = catalog.seas.find(
    ({ id }) => id === state.player.profile.originSeaId,
  );
  const shipDefinition = state.ship
    ? catalog.ships.find(({ id }) => id === state.ship?.shipId)
    : undefined;
  const shipPercent =
    state.ship && shipDefinition
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              (state.ship.health / shipDefinition.maxHealth) * 100,
            ),
          ),
        )
      : 0;

  const tooltipLocale = inferTooltipLocale(
    translate('stat.health'),
  );
  const isFrench = tooltipLocale === 'fr';

  const profileAffiliation = catalog.affiliations.find(
    ({ id }) => id === state.player.profile.affiliationId,
  );
  const careerAffiliation = catalog.careerAffiliations.find(
    ({ id }) => id === state.player.career.affiliationId,
  );
  const affiliationLabel =
    state.careerPhase === 'active'
      ? careerAffiliation
        ? translate(careerAffiliation.nameKey)
        : '—'
      : profileAffiliation
        ? translate(profileAffiliation.nameKey)
        : '—';

  const inventoryCapacity = state.player.inventory.capacity;
  const inventoryStacks = state.player.inventory.stacks;
  const inventoryOverflow = Math.max(
    0,
    inventoryCapacity - INVENTORY_PREVIEW_SLOTS,
  );

  const cargoCapacity = shipDefinition?.cargoSlots ?? 0;
  const cargoOccupants: CargoOccupant[] = state.ship
    ? [
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
      ]
    : [];


  const berryFormatter = new Intl.NumberFormat(
    isFrench ? 'fr-FR' : 'en-US',
  );

  return (
    <Panel
      variant="strong"
      padding="none"
      className="opfg-top-world-hud"
      aria-label={
        isFrench
          ? 'Informations du personnage, du monde et du navire'
          : 'Character, world and ship information'
      }
    >
      <section className="opfg-top-world-hud__section opfg-top-world-hud__inventory">
        <ContextTooltip
          className="opfg-top-world-hud__eyebrow"
          title={isFrench ? 'Inventaire' : 'Inventory'}
          detail={
            isFrench
              ? 'Vos possessions personnelles. Deux emplacements : même Luffy devrait réussir à ne pas les perdre tous les deux.'
              : 'Your personal possessions. Two slots: even Luffy should be able to avoid losing both of them.'
          }
          meta={`${inventoryStacks.length} / ${inventoryCapacity}`}
          side="bottom"
        >
          <Backpack className="size-4" aria-hidden="true" />
          {isFrench ? 'Inventaire' : 'Inventory'}
        </ContextTooltip>

        <div
          className="opfg-top-world-hud__inventory-slots"
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
                    className="opfg-top-world-hud__slot is-locked"
                    title={
                      isFrench
                        ? 'Emplacement indisponible'
                        : 'Unavailable slot'
                    }
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
                    className="opfg-top-world-hud__slot is-empty"
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
                  className="opfg-top-world-hud__slot-wrap"
                  title={label}
                  detail={
                    isFrench
                      ? 'Objet personnel. Un même type d’objet reste empilé dans un seul emplacement.'
                      : 'Personal item. Identical items remain stacked in a single slot.'
                  }
                  meta={`×${stack.quantity}`}
                  side="bottom"
                  focusable
                >
                  <span className="opfg-top-world-hud__slot is-filled">
                    <Package
                      className="size-4"
                      aria-hidden="true"
                    />
                    {stack.quantity > 1 && (
                      <strong className="opfg-top-world-hud__slot-quantity">
                        {stack.quantity}
                      </strong>
                    )}
                  </span>
                </ContextTooltip>
              );
            },
          )}

          {inventoryOverflow > 0 && (
            <span className="opfg-top-world-hud__slot-overflow">
              +{inventoryOverflow}
            </span>
          )}
        </div>

        <div className="opfg-top-world-hud__berries">
          <Coins className="size-4" aria-hidden="true" />
          <strong>{berryFormatter.format(state.berries)}</strong>
          <span>B</span>
        </div>
      </section>

      <div className="opfg-top-world-hud__divider" />

      <section className="opfg-top-world-hud__section opfg-top-world-hud__world">
        <ContextTooltip
          className="opfg-top-world-hud__eyebrow"
          title={isFrench ? 'Monde' : 'World'}
          detail={getUiTooltipDetail(
            'world',
            tooltipLocale,
          )}
          side="bottom"
        >
          <MapPin className="size-4" aria-hidden="true" />
          {isFrench ? 'Monde' : 'World'}
        </ContextTooltip>

        <div className="opfg-top-world-hud__primary">
          {state.locationId}
        </div>

        <div className="opfg-top-world-hud__secondary">
          <span>
            <Waves className="size-3.5" aria-hidden="true" />
            {sea ? translate(sea.nameKey) : '—'}
          </span>

          <span>
            <Compass className="size-3.5" aria-hidden="true" />
            {translate(`travel.${state.travelState}`)}
          </span>
        </div>
      </section>

      <div className="opfg-top-world-hud__divider" />

      <section className="opfg-top-world-hud__section opfg-top-world-hud__time">
        <div
          className="opfg-top-world-hud__character-name"
          aria-label={
            isFrench
              ? 'Nom du personnage'
              : 'Character name'
          }
        >
          {state.player.profile.name ?? '—'}
        </div>

        <div className="opfg-top-world-hud__affiliation">
          {affiliationLabel}
        </div>

        <div className="opfg-top-world-hud__secondary">
          <span>
            <Clock3 className="size-3.5" aria-hidden="true" />
            {Math.floor(state.ageMonths / 12)}{' '}
            {isFrench ? 'ans' : 'years'} ·{' '}
            {state.ageMonths % 12}{' '}
            {isFrench ? 'mois' : 'months'}
          </span>

          {state.careerPhase === 'active' && (
            <span>
              {isFrench ? 'Slot' : 'Slot'}{' '}
              {state.slotInMonth + 1} / 2
            </span>
          )}
        </div>
      </section>

      <div className="opfg-top-world-hud__divider" />

      <section className="opfg-top-world-hud__section opfg-top-world-hud__ship">
        <div className="opfg-top-world-hud__ship-main">
          <ContextTooltip
            className="opfg-top-world-hud__ship-icon"
            title={isFrench ? 'Navire' : 'Ship'}
            detail={getUiTooltipDetail(
              'ship',
              tooltipLocale,
            )}
            meta={
              state.ship
                ? `${state.ship.health} HP · ${shipPercent} %`
                : undefined
            }
            side="left"
          >
            <Anchor className="size-5" aria-hidden="true" />
          </ContextTooltip>

          <div className="opfg-top-world-hud__ship-copy">
            <div className="opfg-top-world-hud__eyebrow">
              {isFrench ? 'Navire' : 'Ship'}
            </div>

            <div className="opfg-top-world-hud__primary">
              {state.ship?.name ??
                (isFrench ? 'Aucun navire' : 'No ship')}
            </div>

            <div className="opfg-top-world-hud__secondary">
              <span>
                {shipDefinition
                  ? translate(shipDefinition.nameKey)
                  : '—'}
              </span>

              <span>
                {state.ship
                  ? `${state.ship.health} HP · ${shipPercent} %`
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        <div
          className="opfg-top-world-hud__ship-condition"
          aria-label={
            state.ship
              ? `${
                  isFrench
                    ? 'État du navire'
                    : 'Ship condition'
                } : ${shipPercent}%`
              : isFrench
                ? 'Aucun navire'
                : 'No ship'
          }
        >
          <span style={{ width: `${shipPercent}%` }} />
        </div>

        <div className="opfg-top-world-hud__cargo">
          <div
            className="opfg-top-world-hud__cargo-slots"
            aria-label={
              isFrench ? 'Slots de cale' : 'Cargo slots'
            }
          >
            <ContextTooltip
              className="opfg-top-world-hud__slot-wrap"
              title={isFrench ? 'Cale' : 'Cargo'}
              detail={
                isFrench
                  ? 'La capacité dépend du navire. Les passagers prennent aussi une place : une décision qui rend soudain les tonneaux très compétitifs.'
                  : 'Capacity depends on the ship. Passengers also take a slot, which suddenly makes barrels surprisingly competitive.'
              }
              meta={`${cargoOccupants.length}/${cargoCapacity}`}
              side="bottom"
              focusable
            >
              <span className="opfg-top-world-hud__slot opfg-top-world-hud__slot--cargo-icon">
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
                      className="opfg-top-world-hud__slot is-locked"
                      title={
                        state.ship
                          ? isFrench
                            ? 'Slot non disponible sur ce navire'
                            : 'Slot unavailable on this ship'
                          : isFrench
                            ? 'Aucun navire'
                            : 'No ship'
                      }
                      aria-label={
                        isFrench
                          ? 'Slot de cale indisponible'
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
                      className="opfg-top-world-hud__slot is-empty"
                      aria-label={
                        isFrench
                          ? 'Slot de cale vide'
                          : 'Empty cargo slot'
                      }
                    />
                  );
                }

                return (
                  <ContextTooltip
                    key={occupant.key}
                    className="opfg-top-world-hud__slot-wrap"
                    title={occupant.label}
                    detail={
                      occupant.kind === 'passenger'
                        ? isFrench
                          ? 'Passager temporaire. Oui, il prend une place dans la cale. Non, on ne le range pas dans une caisse.'
                          : 'Temporary passenger. Yes, they occupy cargo space. No, they are not stored in a crate.'
                        : isFrench
                          ? 'Cargaison du navire. En cas de naufrage, la mer ne garantit aucun service après-vente.'
                          : 'Ship cargo. In case of shipwreck, the sea offers no refund policy.'
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
                    <span className="opfg-top-world-hud__slot is-filled">
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
                          <strong className="opfg-top-world-hud__slot-quantity">
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
      </section>
    </Panel>
  );
}
