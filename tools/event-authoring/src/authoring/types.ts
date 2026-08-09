import type { EventDefinition, GameRegistries } from '../gameSchema/current/contract';
import type { LocalizationAuthoringStore } from '../localization/types';

export const AUTHORING_VERSION = 6 as const;

export type AuthoringStatus = 'draft' | 'ready' | 'migrated' | 'needsReview';
export type ContentFolder = 'origins' | 'childhood' | 'active' | 'scheduled' | 'critical' | 'fixtures/childhood';

export interface Point { x: number; y: number; }

export interface AuthoringNode {
  eventId: string;
  position: Point;
  notes: string;
  status: AuthoringStatus;
  contentFolder: ContentFolder;
}

export interface AuthoringEdge {
  id: string;
  sourceEventId: string;
  targetEventId: string;
  sourceChoiceId?: string;
}

export interface AuthoringProject {
  authoringVersion: number;
  gameSchemaVersion: number;
  name: string;
  sourceLocale: 'fr';
  supportedLocales: string[];
  events: EventDefinition[];
  nodes: AuthoringNode[];
  edges: AuthoringEdge[];
  registries: GameRegistries;
  localization: LocalizationAuthoringStore;
  viewport?: { x: number; y: number; zoom: number };
  metadata: {
    createdAt: string;
    updatedAt: string;
    migrationWarnings?: string[];
  };
}
