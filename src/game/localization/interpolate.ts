export type InterpolationParams = Record<string, string | number>;

const SIMPLE_PLACEHOLDER = /\{\{\s*([A-Za-z][A-Za-z0-9_]*)\s*\}\}/g;
const SELECT_EXPRESSION = /\{\{\s*select:([A-Za-z][A-Za-z0-9_]*)\s*\|\s*([^{}]*?)\s*\}\}/g;

function selectValue(
  match: string,
  name: string,
  rawOptions: string,
  params: InterpolationParams,
): string {
  if (!Object.hasOwn(params, name)) return match;

  const selected = String(params[name]);
  const options = new Map<string, string>();

  for (const rawOption of rawOptions.split('|')) {
    const separator = rawOption.indexOf(':');
    if (separator <= 0) return match;
    const key = rawOption.slice(0, separator).trim();
    const value = rawOption.slice(separator + 1).trim();
    if (!key) return match;
    options.set(key, value);
  }

  return options.get(selected) ?? options.get('other') ?? match;
}

export function interpolate(text: string, params: InterpolationParams = {}): string {
  const selected = text.replace(
    SELECT_EXPRESSION,
    (match, name: string, rawOptions: string) =>
      selectValue(match, name, rawOptions, params),
  );

  return selected.replace(
    SIMPLE_PLACEHOLDER,
    (match, name: string) =>
      Object.hasOwn(params, name) ? String(params[name]) : match,
  );
}

export function extractPlaceholders(text: string): string[] {
  return [
    ...new Set(
      [...text.matchAll(SIMPLE_PLACEHOLDER)].map((match) => match[1]),
    ),
  ].sort();
}

export function extractSelectors(text: string): string[] {
  return [
    ...new Set(
      [...text.matchAll(SELECT_EXPRESSION)].map((match) => match[1]),
    ),
  ].sort();
}
