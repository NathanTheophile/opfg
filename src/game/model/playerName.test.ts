import { describe, expect, it } from 'vitest';
import {
  PLAYER_NAME_MAX_LENGTH,
  normalizePlayerName,
} from './playerName';

describe('player name validation', () => {
  it('accepts a 24-character name', () => {
    const name = 'N'.repeat(PLAYER_NAME_MAX_LENGTH);
    expect(normalizePlayerName(name)).toBe(name);
  });

  it('rejects a name over 24 characters even when authored content allows more', () => {
    expect(() => normalizePlayerName('N'.repeat(25), 1, 32)).toThrow(
      'Player name must contain 1 to 24 characters.',
    );
  });

  it('trims before validating and storing the name', () => {
    expect(normalizePlayerName('  Luffy  ')).toBe('Luffy');
  });
});
