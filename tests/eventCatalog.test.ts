import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { buildEventCatalog, eventCatalog } from '../src/game/content/eventCatalog';
import { loadNodeContentCatalog } from '../src/game/content/nodeContentCatalog';
import { validateContent } from '../src/game/validation/validateContent';

describe('eventCatalog', () => {
  it('discovers the complete catalog once and in stable lexical order', () => {
    const ids = eventCatalog.map(({ id }) => id);
    expect(ids).toHaveLength(44);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([...ids].sort());
    expect(ids).toEqual(expect.arrayContaining([
      'origin_name',
      'departure',
      'childhood_memory',
      'mira_returns_favor',
      'critical_player_death',
      'critical_mira_death',
      'critical_ship_destroyed',
    ]));
  });

  it('contains all twenty explicit Childhood fixtures', () => {
    const fixtureIds = eventCatalog.filter(({ id }) => id.startsWith('childhood_fixture_')).map(({ id }) => id);
    expect(fixtureIds).toEqual(Array.from({ length: 20 }, (_, index) => `childhood_fixture_${String(index + 1).padStart(2, '0')}`));
  });

  it('keeps Scheduled and Critical variants and validates the assembled catalog', () => {
    expect(eventCatalog.filter(({ kind }) => kind === 'scheduled').map(({ id }) => id)).toEqual(['childhood_memory', 'mira_returns_favor']);
    expect(eventCatalog.filter(({ kind }) => kind === 'critical').map(({ id }) => id)).toEqual([
      'critical_mira_death',
      'critical_player_death',
      'critical_ship_destroyed',
    ]);
    expect(validateContent(contentCatalog)).toEqual([]);
  });

  it('rejects a filename that differs from its EventId', () => {
    expect(() => buildEventCatalog({
      './events/active/wrong.json': { id: 'actual', kind: 'normal', titleKey: 'x', textKey: 'x', choices: [] },
    })).toThrow(/does not match EventId/);
  });

  it('loads the exact same catalog in Node CLI and Vite runtimes', () => {
    expect(loadNodeContentCatalog()).toEqual(contentCatalog);
  });
});
