export type LocalizationStatus = 'missing' | 'current' | 'outdated';

export interface LocalizedValue {
  text: string;
  sourceRevision: number;
}

export interface LocalizedAuthoringEntry {
  key: string;
  sourceRevision: number;
  values: Record<string, LocalizedValue>;
}

export type LocalizationAuthoringStore = Record<string, LocalizedAuthoringEntry>;

