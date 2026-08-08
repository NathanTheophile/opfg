export type InterpolationParams = Record<string, string | number>;
export function interpolate(text: string, params: InterpolationParams = {}): string {
  return text.replace(/\{\{\s*([A-Za-z][A-Za-z0-9_]*)\s*\}\}/g, (match, name: string) => Object.hasOwn(params, name) ? String(params[name]) : match);
}
export function extractPlaceholders(text: string): string[] {
  return [...new Set([...text.matchAll(/\{\{\s*([A-Za-z][A-Za-z0-9_]*)\s*\}\}/g)].map((match) => match[1]))].sort();
}
