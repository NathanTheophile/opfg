import {
  progressionSimulationPolicy,
  randomSimulationPolicy,
  type SimulationPolicy,
} from '../../../src/game/simulation/simulationPolicy';
import {
  getMinMaxTelemetry,
  minmaxSimulationPolicy,
  resetMinMaxTelemetry,
} from '../../../src/game/simulation/minmaxSimulationPolicy';
import type { V2PolicyId } from './types';

export function resolvePolicy(id: V2PolicyId): SimulationPolicy {
  if (id === 'random') return randomSimulationPolicy;
  if (id === 'progression') return progressionSimulationPolicy;
  return minmaxSimulationPolicy;
}

export function resetPolicyTelemetry(id: V2PolicyId): void {
  if (id === 'minmax') resetMinMaxTelemetry();
}

export function policyTelemetry(id: V2PolicyId): unknown {
  return id === 'minmax' ? getMinMaxTelemetry() : undefined;
}

export function assertCrewAwareProgressionPolicy(policy: SimulationPolicy): void {
  if (policy.id !== 'progression') return;
  const candidate = policy as SimulationPolicy & { chooseCrewPower?: unknown };
  if (typeof candidate.chooseCrewPower !== 'function') {
    throw new Error([
      'Sims/V2 progression requires the crew-power simulation patch.',
      'Expected progressionSimulationPolicy.chooseCrewPower to exist.',
      'Apply OPFG_SIM_PROGRESSION_CREW_POWERS_PATCH before running V2 progression simulations.',
    ].join(' '));
  }
}
