import type { AuthoringProject } from './types';
import { migrateImportedProject } from '../gameSchema/migrations';

export const serializeProject = (project: AuthoringProject): string => JSON.stringify(project, null, 2);
export const deserializeProject = (json: string): AuthoringProject => migrateImportedProject(JSON.parse(json) as unknown).project;

