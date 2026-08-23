import type { ProgressMetric } from './types';

export interface ProgressReporterOptions {
  suite: string;
  policy: string;
  total: number;
  enabled: boolean;
  intervalMs: number;
}

export class ProgressReporter {
  private readonly startedAt = performance.now();
  private lastPaintAt = 0;
  private printed = false;

  constructor(private readonly options: ProgressReporterOptions) {}

  header(seed: number, maxEvents: number, jsonPath?: string): void {
    console.log(`OPFG Sims V2 — ${this.options.suite.toUpperCase()}`);
    console.log(`Policy: ${this.options.policy}`);
    console.log(`Runs: ${this.options.total} | Seeds: ${seed} → ${(seed + this.options.total - 1) >>> 0} | Max events: ${maxEvents}`);
    if (jsonPath) console.log(`Output: ${jsonPath}`);
    if (this.options.enabled) console.log('Progress: enabled (Ctrl+C to stop)');
    console.log('');
  }

  tick(done: number, metrics: readonly ProgressMetric[] = [], force = false): void {
    if (!this.options.enabled) return;
    const now = performance.now();
    if (!force && done < this.options.total && now - this.lastPaintAt < this.options.intervalMs) return;
    this.lastPaintAt = now;

    const elapsedMs = Math.max(1, now - this.startedAt);
    const rate = done / (elapsedMs / 1000);
    const remaining = Math.max(0, this.options.total - done);
    const etaMs = rate > 0 ? remaining / rate * 1000 : 0;
    const percent = this.options.total === 0 ? 100 : done / this.options.total * 100;
    const line = [
      progressBar(done, this.options.total),
      `${done}/${this.options.total}`,
      `${percent.toFixed(1)}%`,
      `${rate.toFixed(2)} runs/s`,
      `elapsed ${formatDuration(elapsedMs)}`,
      `ETA ${done === 0 ? '--:--' : formatDuration(etaMs)}`,
      ...metrics.map(({ label, value }) => `${label}=${value}`),
    ].join(' | ');

    if (process.stdout.isTTY) {
      process.stdout.write(`\r\x1b[2K${line}`);
      this.printed = true;
    } else {
      console.log(line);
    }
  }

  finish(done: number, metrics: readonly ProgressMetric[] = []): void {
    this.tick(done, metrics, true);
    if (this.options.enabled && process.stdout.isTTY && this.printed) process.stdout.write('\n');
  }

  elapsedMs(): number {
    return performance.now() - this.startedAt;
  }
}

function progressBar(done: number, total: number): string {
  const width = 24;
  const ratio = total === 0 ? 1 : Math.max(0, Math.min(1, done / total));
  const filled = Math.round(width * ratio);
  return `[${'█'.repeat(filled)}${'·'.repeat(width - filled)}]`;
}

export function formatDuration(milliseconds: number): string {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return '--:--';
  const seconds = Math.round(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}
