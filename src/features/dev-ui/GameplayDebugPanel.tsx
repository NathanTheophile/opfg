import {
  Bug,
  ChevronDown,
  MapPin,
  PackagePlus,
  Search,
  UserPlus,
  X,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  ContentCatalog,
  StatId,
} from '@/game/content/schema';
import { vacantCrewRoleIds } from '@/game/engine/crew';
import { debugRecruitCrewMember, debugTeleportToLocation } from '@/game/engine/debug';
import { getPlayerMaxHealth } from '@/game/engine/health';
import { tryAutoPlaceReward } from '@/game/engine/inventory';
import { canRecruitNpc } from '@/game/engine/ship';
import {
  GAMEPLAY_DEBUG_STATE_EVENT,
  getGameplayDebugBridge,
  type GameplayDebugSnapshot,
} from '@/game/session/devGameplayDebugBridge';
import type {
  GameState,
  HakiType,
  TraitId,
} from '@/game/model/schema';
import './gameplay-debug.css';
import { PLAYER_NAME_MAX_LENGTH } from '@/game/model/playerName';

const ATTRIBUTE_IDS: StatId[] = [
  'morale',
  'strength',
  'agility',
  'observation',
  'intelligence',
  'navigation',
  'charisma',
  'luck',
];

const HAKI_TYPES: HakiType[] = [
  'observation',
  'armament',
  'conqueror',
];

const clampInteger = (
  value: number,
  min: number,
  max: number,
) => Math.max(min, Math.min(max, Math.round(value)));

const formatAgeMonths = (ageMonths: number) => {
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  return `${years} ans ${months} mois`;
};

function mutate(
  action: (state: GameState, catalog: ContentCatalog) => void,
): boolean {
  const bridge = getGameplayDebugBridge();
  const snapshot = bridge?.getSnapshot();
  if (!bridge || !snapshot?.gameState) return false;

  return bridge.applySystemAction((state) => action(state, snapshot.catalog));
}

function NumberControl({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="opfg-gameplay-debug__number">
      <span>{label}</span>
      <div>
        <button
          type="button"
          onClick={() => onChange(value - step)}
          disabled={value <= min}
        >
          −
        </button>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) =>
            onChange(
              clampInteger(
                Number(event.target.value),
                min,
                max,
              ),
            )
          }
        />
        <button
          type="button"
          onClick={() => onChange(value + step)}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </label>
  );
}

function DebugSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="opfg-gameplay-debug__section">
      <button
        type="button"
        className="opfg-gameplay-debug__section-toggle"
        onClick={() => setOpen((current) => !current)}
      >
        <ChevronDown
          className={open ? 'is-open' : undefined}
          size={14}
        />
        {title}
      </button>
      {open && (
        <div className="opfg-gameplay-debug__section-body">
          {children}
        </div>
      )}
    </section>
  );
}

function ownedItemQuantities(state: GameState) {
  const totals = new Map<string, number>();
  const add = (itemId: string, quantity: number) =>
    totals.set(itemId, (totals.get(itemId) ?? 0) + quantity);

  for (const stack of state.player.inventory.stacks) add(stack.itemId, stack.quantity);
  for (const stack of state.ship?.cargo ?? []) add(stack.itemId, stack.quantity);
  for (const stack of state.player.equipment) {
    if (stack) add(stack.itemId, 1);
  }
  if (state.player.logPose) add(state.player.logPose.itemId, state.player.logPose.quantity);
  if (state.player.companion) add(state.player.companion.itemId, state.player.companion.quantity);

  return [...totals.entries()].sort(([left], [right]) => left.localeCompare(right));
}

export function GameplayDebugPanel() {
  const [playerNameDraft, setPlayerNameDraft] = useState('');
  const [visible, setVisible] = useState(false);
  const [snapshot, setSnapshot] = useState<GameplayDebugSnapshot | null>(null);
  const [itemSearch, setItemSearch] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [traitSearch, setTraitSearch] = useState('');
  const [crewSearch, setCrewSearch] = useState('');
  const [selectedCrewNpcId, setSelectedCrewNpcId] = useState('');
  const [selectedCrewRoleId, setSelectedCrewRoleId] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');

  useEffect(() => {
    const refresh = () =>
      setSnapshot(getGameplayDebugBridge()?.getSnapshot() ?? null);

    refresh();
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener(GAMEPLAY_DEBUG_STATE_EVENT, refresh);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(GAMEPLAY_DEBUG_STATE_EVENT, refresh);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.code === 'KeyD') {
        event.preventDefault();
        setVisible((current) => !current);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const state = snapshot?.gameState ?? null;
  const catalog = snapshot?.catalog ?? null;
  useEffect(() => {
    if (state) setPlayerNameDraft(state.player.profile.name);
  }, [state?.player.profile.name]);



  const filteredItems = useMemo(() => {
    if (!catalog) return [];
    const query = itemSearch.trim().toLowerCase();
    return catalog.items.filter(({ id }) => !query || id.toLowerCase().includes(query));
  }, [catalog, itemSearch]);

  const filteredTraits = useMemo(() => {
    if (!catalog) return [];
    const query = traitSearch.trim().toLowerCase();
    return catalog.traits.filter(({ id }) => !query || id.toLowerCase().includes(query));
  }, [catalog, traitSearch]);

  const crewDefinitions = useMemo(() => {
    if (!catalog || !state) return [];
    const query = crewSearch.trim().toLowerCase();
    return catalog.npcs
      .filter(({ id }) => state.npcs[id]?.status !== 'crew' && state.npcs[id]?.status !== 'dead')
      .filter(({ id }) => !query || id.toLowerCase().includes(query))
      .sort((left, right) => left.id.localeCompare(right.id));
  }, [catalog, state, crewSearch]);

  const crewRoles = useMemo(
    () => [...(catalog?.crewRoles ?? [])].sort((left, right) => left.id.localeCompare(right.id)),
    [catalog],
  );

  const filteredLocations = useMemo(() => {
    if (!catalog) return [];
    const query = locationSearch.trim().toLowerCase();
    return catalog.locations
      .filter(({ id, seaId, nameKey }) => !query
        || id.toLowerCase().includes(query)
        || seaId.toLowerCase().includes(query)
        || nameKey.toLowerCase().includes(query))
      .sort((left, right) => left.id.localeCompare(right.id));
  }, [catalog, locationSearch]);

  useEffect(() => {
    if (!catalog) return;
    const stillVisible = filteredItems.some(({ id }) => id === selectedItemId);
    if (!stillVisible) setSelectedItemId(filteredItems[0]?.id ?? '');
  }, [catalog, filteredItems, selectedItemId]);

  useEffect(() => {
    const stillAvailable = crewDefinitions.some(({ id }) => id === selectedCrewNpcId);
    if (!stillAvailable) setSelectedCrewNpcId(crewDefinitions[0]?.id ?? '');
  }, [crewDefinitions, selectedCrewNpcId]);

  useEffect(() => {
    if (!state || !catalog) return;
    const vacantRoles = vacantCrewRoleIds(state, catalog);
    if (!vacantRoles.includes(selectedCrewRoleId)) {
      setSelectedCrewRoleId(vacantRoles[0] ?? '');
    }
  }, [state, catalog, selectedCrewRoleId]);

  useEffect(() => {
    const stillVisible = filteredLocations.some(({ id }) => id === selectedLocationId);
    if (!stillVisible) setSelectedLocationId(filteredLocations[0]?.id ?? '');
  }, [filteredLocations, selectedLocationId]);

  const selectedItem = catalog?.items.find(({ id }) => id === selectedItemId) ?? null;
  const selectedCrewDefinition = crewDefinitions.find(({ id }) => id === selectedCrewNpcId) ?? null;
  const vacantRoleIds = state && catalog ? vacantCrewRoleIds(state, catalog) : [];
  const canAddSelectedCrewmate = Boolean(
    state && catalog && selectedCrewDefinition && selectedCrewRoleId
      && !state.crewReassignmentPending
      && vacantRoleIds.includes(selectedCrewRoleId)
      && canRecruitNpc(state, catalog, selectedCrewDefinition.id, true),
  );
  const selectedLocation = filteredLocations.find(({ id }) => id === selectedLocationId) ?? null;
  const maxItemQuantity = selectedItem?.stackLimit ?? 1;
  const healthMax = state && catalog && state.player.profile.raceId
    ? getPlayerMaxHealth(state, catalog)
    : Math.max(60, state?.player.stats.health ?? 0);
  const applyPlayerName = () => {
    const name = playerNameDraft.trim().slice(0, PLAYER_NAME_MAX_LENGTH);
    if (!name || name === state?.player.profile.name) return;

    mutate((next) => {
      next.player.profile.name = name;
    });
  };



  const setAttribute = (statId: StatId, value: number) =>
    mutate((next) => {
      next.player.stats[statId] = clampInteger(value, 0, 50);
    });

  const setHealth = (value: number) =>
    mutate((next, nextCatalog) => {
      const maximum = next.player.profile.raceId
        ? getPlayerMaxHealth(next, nextCatalog)
        : Math.max(60, next.player.stats.health);
      next.player.stats.health = clampInteger(value, 0, maximum);
    });

  const setReputation = (value: number) =>
    mutate((next) => {
      next.player.career.reputation = clampInteger(value, 0, 100);
    });

  const setBounty = (value: number) =>
    mutate((next) => {
      next.player.career.bounty = Math.max(0, Math.round(value));
    });

  const setBerries = (value: number) =>
    mutate((next) => {
      next.berries = Math.max(0, Math.round(value));
    });

  const setHaki = (type: HakiType, value: number) =>
    mutate((next) => {
      next.player.powers.haki[type] = clampInteger(value, 0, 5);
    });

  const toggleTrait = (traitId: TraitId) =>
    mutate((next, nextCatalog) => {
      if (next.player.traits.includes(traitId)) {
        next.player.traits = next.player.traits.filter((id) => id !== traitId);
        return;
      }

      const definition = nextCatalog.traits.find(({ id }) => id === traitId);
      if (
        definition?.oppositeTraitId &&
        next.player.traits.includes(definition.oppositeTraitId)
      ) {
        return;
      }

      next.player.traits.push(traitId);
    });

  const recruitCrewmate = () => {
    if (!selectedCrewDefinition || !selectedCrewRoleId) return;

    mutate((next, nextCatalog) => {
      debugRecruitCrewMember(
        next,
        nextCatalog,
        selectedCrewDefinition.id,
        selectedCrewRoleId,
      );
    });
  };

  const teleportToLocation = () => {
    if (!selectedLocation) return;
    mutate((next, nextCatalog) => debugTeleportToLocation(next, nextCatalog, selectedLocation.id));
  };

  const giveItem = () => {
    if (!selectedItem || !state || state.pendingOverflow) return;
    const quantity = clampInteger(itemQuantity, 1, selectedItem.stackLimit);

    mutate((next, nextCatalog) => {
      if (next.pendingOverflow) return;
      if (!tryAutoPlaceReward(next, nextCatalog, selectedItem.id, quantity)) {
        next.pendingOverflow = {
          itemId: selectedItem.id,
          quantity,
          locationId: next.locationId,
          mandatory: false,
        };
      }
    });
  };

  if (!visible) {
    return (
      <button
        type="button"
        data-opfg-gameplay-debug
        className="opfg-gameplay-debug-launcher"
        onClick={() => setVisible(true)}
        title="Gameplay Debug — Ctrl+Shift+D"
        aria-label="Open gameplay debug"
      >
        <Bug size={16} />
      </button>
    );
  }

  return (
    <aside data-opfg-gameplay-debug className="opfg-gameplay-debug">
      <header className="opfg-gameplay-debug__header">
        <div>
          <strong>OPFG Gameplay Debug</strong>
          <small>Runtime state cheats · DEV only</small>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          title="Masquer — Ctrl+Shift+D"
        >
          <X size={16} />
        </button>
      </header>

      {!state || !catalog ? (
        <div className="opfg-gameplay-debug__empty">
          Démarre une run pour éditer le GameState.
        </div>
      ) : (
        <div className="opfg-gameplay-debug__scroll">
          <DebugSection title="Player Identity">
            <div className="opfg-gameplay-debug__action-row">
              <input
                type="text"
                maxLength={PLAYER_NAME_MAX_LENGTH}
                value={playerNameDraft}
                onChange={(event) => setPlayerNameDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applyPlayerName();
                }}
                aria-label="Player name"
              />
              <button
                type="button"
                onClick={applyPlayerName}
                disabled={
                  !playerNameDraft.trim()
                  || playerNameDraft.trim() === state.player.profile.name
                }
              >
                Apply name
              </button>
            </div>
            <div className="opfg-gameplay-debug__owned">
              Current: {state.player.profile.name} · max {PLAYER_NAME_MAX_LENGTH} chars
            </div>
          </DebugSection>

          <DebugSection title="Player Stats">
            <NumberControl
              label={`health / ${healthMax}`}
              value={state.player.stats.health}
              min={0}
              max={healthMax}
              onChange={setHealth}
            />
            {ATTRIBUTE_IDS.map((statId) => (
              <NumberControl
                key={statId}
                label={statId}
                value={state.player.stats[statId]}
                min={0}
                max={50}
                onChange={(value) => setAttribute(statId, value)}
              />
            ))}
          </DebugSection>

          <DebugSection title="Age" defaultOpen={false}>
            <div className="opfg-gameplay-debug__age-readout">
              <strong>{formatAgeMonths(state.ageMonths)}</strong>
              <span>{state.ageMonths} mois</span>
            </div>
            <input
              className="opfg-gameplay-debug__age-slider"
              type="range"
              min={0}
              max={1200}
              step={1}
              value={state.ageMonths}
              onChange={(event) =>
                mutate((next) => {
                  next.ageMonths = clampInteger(Number(event.target.value), 0, 1200);
                })
              }
              aria-label="Debug age in months"
            />
            <label className="opfg-gameplay-debug__wide-number">
              <span>ageMonths</span>
              <input
                type="number"
                min={0}
                max={1200}
                step={1}
                value={state.ageMonths}
                onChange={(event) =>
                  mutate((next) => {
                    next.ageMonths = clampInteger(Number(event.target.value), 0, 1200);
                  })
                }
              />
            </label>
          </DebugSection>

          <DebugSection title="Career & Economy">
            <NumberControl
              label="reputation"
              value={state.player.career.reputation}
              min={0}
              max={100}
              onChange={setReputation}
            />
            <label className="opfg-gameplay-debug__wide-number">
              <span>bounty</span>
              <input
                type="number"
                min={0}
                value={state.player.career.bounty}
                onChange={(event) => setBounty(Number(event.target.value))}
              />
            </label>
            <label className="opfg-gameplay-debug__wide-number">
              <span>berries</span>
              <input
                type="number"
                min={0}
                value={state.berries}
                onChange={(event) => setBerries(Number(event.target.value))}
              />
            </label>
          </DebugSection>

          <DebugSection title="Haki" defaultOpen={false}>
            {HAKI_TYPES.map((type) => (
              <NumberControl
                key={type}
                label={type}
                value={state.player.powers.haki[type]}
                min={0}
                max={5}
                onChange={(value) => setHaki(type, value)}
              />
            ))}
          </DebugSection>

          <DebugSection title="Crew" defaultOpen={false}>
            <label className="opfg-gameplay-debug__search">
              <Search size={14} />
              <input
                value={crewSearch}
                onChange={(event) => setCrewSearch(event.target.value)}
                placeholder="Filter NPC ID…"
              />
            </label>
            <div className="opfg-gameplay-debug__crew-row">
              <select
                value={selectedCrewRoleId}
                onChange={(event) => setSelectedCrewRoleId(event.target.value)}
                aria-label="Crew Role"
              >
                {crewRoles.map((role) => {
                  const metadata = [
                    role.annualPower ? `power:${role.annualPower}` : null,
                    role.passive ? `passive:${role.passive.type}` : null,
                  ].filter(Boolean).join(' · ');
                  const occupied = !vacantRoleIds.includes(role.id);
                  return (
                    <option key={role.id} value={role.id} disabled={occupied}>
                      {role.id}{metadata ? ` · ${metadata}` : ''}
                    </option>
                  );
                })}
              </select>
              <select
                value={selectedCrewNpcId}
                onChange={(event) => setSelectedCrewNpcId(event.target.value)}
                aria-label="Crew NPC definition"
              >
                {crewDefinitions.map(({ id }) => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={recruitCrewmate}
                disabled={!canAddSelectedCrewmate}
              >
                <UserPlus size={14} />
                Add crew
              </button>
            </div>
            <div className="opfg-gameplay-debug__owned">
              Active crew: {Object.entries(state.npcs)
                .filter(([, npc]) => npc.status === 'crew')
                .map(([npcId, npc]) => `${npcId} [${npc.crewRoleId ?? 'unassigned'}]`)
                .join(' · ') || 'none'}
            </div>
            {state.crewReassignmentPending && (
              <p className="opfg-gameplay-debug__warning">
                Resolve the annual Crew Role reassignment before adding a debug crewmate.
              </p>
            )}
            {crewDefinitions.length === 0 && (
              <p className="opfg-gameplay-debug__warning">
                No recruitable NPC is available in the current catalog/state.
              </p>
            )}
          </DebugSection>

          <DebugSection title="Location" defaultOpen={false}>
            <label className="opfg-gameplay-debug__search">
              <Search size={14} />
              <input
                value={locationSearch}
                onChange={(event) => setLocationSearch(event.target.value)}
                placeholder="Filter Location ID / sea…"
              />
            </label>
            <div className="opfg-gameplay-debug__action-row">
              <select
                value={selectedLocationId}
                onChange={(event) => setSelectedLocationId(event.target.value)}
                aria-label="Location V1"
              >
                {filteredLocations.map(({ id, seaId }) => (
                  <option key={id} value={id}>{id} · {seaId}</option>
                ))}
              </select>
              <button type="button" onClick={teleportToLocation} disabled={!selectedLocation}>
                <MapPin size={14} />
                Teleport
              </button>
            </div>
            <div className="opfg-gameplay-debug__owned">
              Current: {state.locationId} · {state.travelState}
            </div>
          </DebugSection>

          <DebugSection title="Give Item">
            <label className="opfg-gameplay-debug__search">
              <Search size={14} />
              <input
                value={itemSearch}
                onChange={(event) => setItemSearch(event.target.value)}
                placeholder="Filter item ID…"
              />
            </label>
            <div className="opfg-gameplay-debug__give-row">
              <select
                value={selectedItemId}
                onChange={(event) => {
                  setSelectedItemId(event.target.value);
                  setItemQuantity(1);
                }}
              >
                {filteredItems.map(({ id }) => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={maxItemQuantity}
                value={Math.min(itemQuantity, maxItemQuantity)}
                onChange={(event) =>
                  setItemQuantity(
                    clampInteger(Number(event.target.value), 1, maxItemQuantity),
                  )
                }
                aria-label="Item quantity"
              />
              <button
                type="button"
                onClick={giveItem}
                disabled={!selectedItem || state.pendingOverflow !== null}
              >
                <PackagePlus size={14} />
                Give
              </button>
            </div>
            {state.pendingOverflow && (
              <p className="opfg-gameplay-debug__warning">
                Resolve the current inventory overflow before giving another item.
              </p>
            )}
            <div className="opfg-gameplay-debug__owned">
              {ownedItemQuantities(state).length === 0
                ? 'Owned: none'
                : ownedItemQuantities(state)
                    .map(([itemId, quantity]) => `${itemId} ×${quantity}`)
                    .join(' · ')}
            </div>
          </DebugSection>

          <DebugSection title="Traits" defaultOpen={false}>
            <label className="opfg-gameplay-debug__search">
              <Search size={14} />
              <input
                value={traitSearch}
                onChange={(event) => setTraitSearch(event.target.value)}
                placeholder="Filter trait ID…"
              />
            </label>
            <div className="opfg-gameplay-debug__trait-grid">
              {filteredTraits.map((trait) => {
                const active = state.player.traits.includes(trait.id);
                const blockedBy = !active && trait.oppositeTraitId && state.player.traits.includes(trait.oppositeTraitId)
                  ? trait.oppositeTraitId
                  : null;

                return (
                  <button
                    key={trait.id}
                    type="button"
                    className={active ? 'is-active' : undefined}
                    disabled={blockedBy !== null}
                    title={blockedBy ? `Blocked by ${blockedBy}` : undefined}
                    onClick={() => toggleTrait(trait.id)}
                  >
                    {trait.id}
                  </button>
                );
              })}
            </div>
          </DebugSection>
        </div>
      )}
    </aside>
  );
}
