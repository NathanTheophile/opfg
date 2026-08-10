import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { loadNodeContentCatalog } from '../../src/game/content/nodeContentCatalog';
import type { ContentCatalog } from '../../src/game/content/schema';
import { validateContent } from '../../src/game/validation/validateContent';

export interface SpecializedArgs {
  runs: number;
  seed: number;
  maxEvents: number;
  jsonPath?: string;
}

export function parseSpecializedArgs(values: string[], defaultJson?: string): SpecializedArgs {
  const result: SpecializedArgs = {
    runs: 5000,
    seed: 1,
    maxEvents: 1000,
    ...(defaultJson ? { jsonPath: defaultJson } : {}),
  };

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--runs') result.runs = positiveInteger(values[++index], '--runs');
    else if (value === '--seed') result.seed = uint32(values[++index], '--seed');
    else if (value === '--max-events') result.maxEvents = positiveInteger(values[++index], '--max-events');
    else if (value === '--json') result.jsonPath = requiredValue(values[++index], '--json');
    else throw new Error(`Unknown argument "${value}".`);
  }
  return result;
}

export function loadValidatedCatalog(): ContentCatalog {
  const catalog = loadNodeContentCatalog();
  const errors = validateContent(catalog);
  if (errors.length > 0) {
    errors.slice(0, 20).forEach(({ path, message }) => console.error(`ERROR ${path}: ${message}`));
    throw new Error(`Specialized simulation aborted: ContentCatalog has ${errors.length} structural error(s).`);
  }
  return catalog;
}

export function writeJson(path: string | undefined, value: unknown): void {
  if (!path) return;
  const output = resolve(path);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  console.log(`JSON report: ${output}`);
}

export function inc(target: Record<string, number>, key: string, amount = 1): void {
  target[key] = (target[key] ?? 0) + amount;
}

export function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function quantile(values: number[], q: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * q)));
  return sorted[index];
}

export function distribution(values: number[], bucket: (value: number) => string): Record<string, number> {
  const result: Record<string, number> = {};
  values.forEach((value) => inc(result, bucket(value)));
  return result;
}

export function topEntries(target: Record<string, number>, limit = 25): Array<{ key: string; value: number }> {
  return Object.entries(target)
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value || a.key.localeCompare(b.key))
    .slice(0, limit);
}

export function ageLabel(months: number | null): string {
  if (months === null) return 'never';
  return `${Math.floor(months / 12)}y${months % 12}m`;
}

export function pct(value: number, total: number): number {
  return total === 0 ? 0 : value / total * 100;
}

function positiveInteger(value: string | undefined, label: string): number {
  const parsed = Number(requiredValue(value, label));
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${label} must be a positive integer.`);
  return parsed;
}

function uint32(value: string | undefined, label: string): number {
  const parsed = Number(requiredValue(value, label));
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 0xffffffff) throw new Error(`${label} must be an integer from 0 to 4294967295.`);
  return parsed;
}

function requiredValue(value: string | undefined, label: string): string {
  if (!value || value.startsWith('--')) throw new Error(`${label} requires a value.`);
  return value;
}
