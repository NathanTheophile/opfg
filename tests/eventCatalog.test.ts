import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { buildEventCatalog, eventCatalog } from '../src/game/content/eventCatalog';
import { loadNodeContentCatalog } from '../src/game/content/nodeContentCatalog';
import { validateContent } from '../src/game/validation/validateContent';

describe('eventCatalog', () => {
  it('discovers the complete catalog once and in stable lexical order', () => {
    const ids = eventCatalog.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([...ids].sort());
    expect(ids).toEqual(expect.arrayContaining([
      'origin_name',
      'origin_family_structure',
      'origin_social_class',
      'origin_affiliation',
      'origin_race',
      'origin_sea',
      'origin_to_childhood',
      'critical_player_death',
      'critical_mira_death',
      'critical_ship_destroyed',
      'critical_ship_missing_at_sea',
      'critical_ship_replacement',
    ]));
  });

  it('keeps Scheduled and Critical variants and validates the assembled catalog', () => {
    const scheduledIds = eventCatalog
      .filter(({ kind }) => kind === 'scheduled')
      .map(({ id }) => id);

    expect(scheduledIds).toEqual(expect.arrayContaining([
      'ch_v2_generic_early_01_lt01_first_return',
      'ch_v2_generic_late_01_favor_s01_first_return',
      'ch_v2_peers_01_lt_rival_s01_new_measure',
      'ch_v2_identity_world_01_traveling_notebook_s01_first_return',
      'ch_v2_combat_risk_01_younger_lt_s01_show_me',
    ]));

    expect(eventCatalog.filter(({ kind }) => kind === 'critical').map(({ id }) => id)).toEqual([
      'critical_career_horizon',
      'critical_mira_death',
      'critical_player_death',
      'critical_ship_destroyed',
      'critical_ship_missing_at_sea',
      'critical_ship_replacement',
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
  }, 15000);
});
