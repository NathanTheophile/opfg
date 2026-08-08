export interface RandomResult {
  value: number;
  nextState: number;
}

export function nextRandom(rngState: number): RandomResult {
  const nextState = (rngState + 0x6d2b79f5) >>> 0;
  let value = nextState;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  value = (value ^ (value >>> 14)) >>> 0;

  return { value: value / 0x100000000, nextState };
}
