import { describe, expect, it } from 'vitest';

import {
  getPlayerNameOrnamentLevel,
  getPlayerNameOrnamentSrc,
} from './PlayerNameOrnament';

describe('PlayerNameOrnament', () => {
  it.each([
    [-10, 0],
    [0, 0],
    [19, 0],
    [20, 1],
    [39, 1],
    [40, 2],
    [59, 2],
    [60, 3],
    [79, 3],
    [80, 4],
    [100, 4],
    [150, 4],
  ] as const)('maps reputation %s to level %s', (reputation, expectedLevel) => {
    expect(getPlayerNameOrnamentLevel(reputation)).toBe(expectedLevel);
  });

  it.each([
    ['civilian', 0, 'civil1.png'],
    ['marine', 1, 'marine2.png'],
    ['pirate', 2, 'pirate3.png'],
    ['revolutionary', 3, 'revo4.png'],
    ['bounty_hunter', 4, 'civil5.png'],
  ] as const)('maps %s level %s to %s', (affiliationId, level, expectedFile) => {
    expect(getPlayerNameOrnamentSrc(affiliationId, level)).toContain(expectedFile);
  });
});
