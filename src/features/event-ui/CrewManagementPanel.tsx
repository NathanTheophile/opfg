import { useMemo, useState } from 'react';
import { Button, Panel, PanelBody, PanelDescription, PanelFooter, PanelHeader, PanelTitle } from '@/components/ui';
import { assignCrewRoleToRecruit, completeAnnualCrewReassignment } from '@/game/engine/crew';
import type { ContentCatalog } from '@/game/content/schema';
import type { Translator } from '@/game/localization';
import type { CrewRoleId, GameState, NpcId } from '@/game/model/schema';
import {
  annualAssignmentsAreComplete,
  annualReassignmentView,
  initialAnnualAssignments,
  recruitAssignmentView,
} from './crewManagementView';
import './crew-management-panel.css';

interface CrewManagementPanelProps {
  state: GameState;
  catalog: ContentCatalog;
  translate: Translator;
  onSystemAction: (action: (state: GameState) => void) => boolean;
}

function crewName(
  npcId: NpcId,
  state: GameState,
  catalog: ContentCatalog,
  translate: Translator,
) {
  const definition = catalog.npcs.find(({ id }) => id === npcId);
  return state.npcs[npcId]?.displayName
    ?? (definition ? translate(definition.nameKey) : translate('ui.crew.member'));
}

export function CrewManagementPanel({
  state,
  catalog,
  translate,
  onSystemAction,
}: CrewManagementPanelProps) {
  const recruitView = recruitAssignmentView(state, catalog);
  const annualView = annualReassignmentView(state, catalog);
  const [selectedRecruitRoleId, setSelectedRecruitRoleId] = useState<CrewRoleId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Partial<Record<CrewRoleId, NpcId>>>(() =>
    initialAnnualAssignments(state, catalog),
  );

  const annualComplete = useMemo(
    () => annualAssignmentsAreComplete(state, assignments),
    [assignments, state],
  );

  if (!recruitView && !annualView) return null;

  const confirmRecruit = () => {
    if (!recruitView || selectedRecruitRoleId === null) return;
    setError(null);
    try {
      onSystemAction((next) =>
        assignCrewRoleToRecruit(
          next,
          catalog,
          recruitView.recruit.npcId,
          selectedRecruitRoleId,
        ),
      );
    } catch (reason) {
      console.error('[CrewManagementPanel] Recruit assignment failed.', reason);
      setError(translate('ui.crewManagement.error'));
    }
  };

  const confirmAnnual = () => {
    if (!annualView || !annualComplete) return;
    setError(null);
    try {
      onSystemAction((next) =>
        completeAnnualCrewReassignment(
          next,
          catalog,
          assignments,
        ),
      );
    } catch (reason) {
      console.error('[CrewManagementPanel] Annual reassignment failed.', reason);
      setError(translate('ui.crewManagement.error'));
    }
  };

  return (
    <Panel
      variant="strong"
      className="opfg-crew-management"
      aria-label={translate('ui.crewManagement.title')}
    >
      <PanelHeader>
        <p className="opfg-crew-management__eyebrow">
          {translate('ui.crewManagement.eyebrow')}
        </p>
        <PanelTitle>{translate('ui.crewManagement.title')}</PanelTitle>
        <PanelDescription>
          {translate(
            annualView
              ? 'ui.crewManagement.annual.description'
              : 'ui.crewManagement.recruit.description',
          )}
        </PanelDescription>
      </PanelHeader>

      <PanelBody className="opfg-crew-management__body">
        {recruitView && (
          <>
            <div className="opfg-crew-management__member">
              <span>{translate('ui.crewManagement.assignRole')}</span>
              <strong>
                {crewName(recruitView.recruit.npcId, state, catalog, translate)}
              </strong>
            </div>
            <div className="opfg-crew-management__role-grid">
              {recruitView.availableRoles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={`opfg-crew-management__role ${selectedRecruitRoleId === role.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedRecruitRoleId(role.id)}
                >
                  {translate(role.nameKey)}
                </button>
              ))}
            </div>
          </>
        )}

        {annualView && (
          <div className="opfg-crew-management__assignment-list">
            {annualView.roles.map((role) => {
              const selectedNpcId = assignments[role.id] ?? '';
              const usedNpcIds = new Set(
                Object.entries(assignments)
                  .filter(([roleId]) => roleId !== role.id)
                  .map(([, npcId]) => npcId)
                  .filter((npcId): npcId is NpcId => npcId !== undefined),
              );
              return (
                <label key={role.id} className="opfg-crew-management__assignment">
                  <span>{translate(role.nameKey)}</span>
                  <select
                    value={selectedNpcId}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      setAssignments((current) => {
                        const next = { ...current };
                        if (value === '') delete next[role.id];
                        else next[role.id] = value;
                        return next;
                      });
                    }}
                  >
                    <option value="">
                      {translate('ui.crewManagement.roleVacant')}
                    </option>
                    {annualView.crew.map(({ npcId }) => (
                      <option
                        key={npcId}
                        value={npcId}
                        disabled={usedNpcIds.has(npcId)}
                      >
                        {crewName(npcId, state, catalog, translate)}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
          </div>
        )}

        {error && (
          <p className="opfg-crew-management__error" role="alert">
            {error}
          </p>
        )}
      </PanelBody>

      <PanelFooter>
        <Button
          variant="primary"
          disabled={recruitView ? selectedRecruitRoleId === null : !annualComplete}
          onClick={recruitView ? confirmRecruit : confirmAnnual}
        >
          {translate(
            recruitView
              ? 'ui.crewManagement.confirmAssignment'
              : 'ui.crewManagement.confirmCrew',
          )}
        </Button>
      </PanelFooter>
    </Panel>
  );
}
