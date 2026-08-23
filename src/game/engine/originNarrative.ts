import type { ContentCatalog } from '../content/schema';
import type { GameState } from '../model/schema';
import type { InterpolationParams } from '../localization/interpolate';

type Localize = (
  key: string,
  params?: InterpolationParams,
) => string;

const LOCATION_FLAVORS: readonly {
  tags: readonly string[];
  key: string;
}[] = [
  {
    tags: ['marine_presence', 'military'],
    key: 'originNarrative.location.military',
  },
  {
    tags: ['pirate_presence', 'criminal'],
    key: 'originNarrative.location.outlaw',
  },
  {
    tags: ['port', 'trade', 'shipyard'],
    key: 'originNarrative.location.port',
  },
  {
    tags: ['royal', 'wealthy', 'capital'],
    key: 'originNarrative.location.royal',
  },
  {
    tags: ['snow'],
    key: 'originNarrative.location.snow',
  },
  {
    tags: ['forest', 'medical'],
    key: 'originNarrative.location.nature',
  },
  {
    tags: ['rural', 'agricultural'],
    key: 'originNarrative.location.rural',
  },
  {
    tags: ['entertainment', 'touristic'],
    key: 'originNarrative.location.entertainment',
  },
  {
    tags: ['isolated'],
    key: 'originNarrative.location.isolated',
  },
  {
    tags: ['urban', 'city'],
    key: 'originNarrative.location.urban',
  },
  {
    tags: ['coastal'],
    key: 'originNarrative.location.coastal',
  },
];

function householdKey(
  state: GameState,
): string {
  const profile = state.player.profile;

  if (profile.familyStructureId === 'orphan') {
    return 'originNarrative.household.orphan';
  }

  switch (profile.affiliationId) {
    case 'marine':
      return 'originNarrative.household.marine';
    case 'pirate':
      return 'originNarrative.household.pirate';
    case 'revolutionary':
      return 'originNarrative.household.revolutionary';
    case 'bandit':
      return 'originNarrative.household.bandit';
    case 'prisoner':
      return 'originNarrative.household.prisoner';
    case 'slave':
      return 'originNarrative.household.slave';
    case 'celestial_dragon':
      return 'originNarrative.household.celestial_dragon';
    case 'royal_family':
      return 'originNarrative.household.royal_family';
    case 'civilian':
      return `originNarrative.household.civilian_${
        profile.socialClassId ?? 'modest'
      }`;
    default:
      return 'originNarrative.household.generic';
  }
}

function familyReferenceKey(
  state: GameState,
): string {
  switch (
    state.player.profile.familyStructureId
  ) {
    case 'two_parents':
      return 'originNarrative.family.two_parents';
    case 'single_parent':
      return 'originNarrative.family.single_parent';
    default:
      return 'originNarrative.family.orphan';
  }
}

export function originNarrativeInterpolationParams(
  state: GameState | null,
  catalog: ContentCatalog,
  localize: Localize,
): Record<string, string> {
  if (state === null) return {};

  const location =
    catalog.locations.find(
      ({ id }) => id === state.locationId,
    );

  const birthplaceName =
    location === undefined
      ? ''
      : localize(location.nameKey);

  const locationFlavor =
    location === undefined
      ? undefined
      : LOCATION_FLAVORS.find(({ tags }) =>
          tags.some((tag) =>
            location.tags.includes(tag as never),
          ),
        );

  const birthplaceFlavor =
    localize(
      locationFlavor?.key ??
        'originNarrative.location.generic',
    );

  const familyReference =
    localize(familyReferenceKey(state));

  const householdFlavor =
    localize(
      householdKey(state),
      { familyReference },
    );

  const raceId =
    state.player.profile.raceId;

  const raceFlavor =
    raceId === null || raceId === 'human'
      ? ''
      : localize(
          `originNarrative.race.${raceId}`,
        );

  return {
    birthplaceName,
    birthplaceFlavor,
    householdFlavor,
    raceFlavor,
  };
}
